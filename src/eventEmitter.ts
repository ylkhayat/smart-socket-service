import EventEmitter from "events";
import { serverData } from "./store/dataStore";
import { manualStop } from "./store/manualStop";
class Emitter extends EventEmitter { }
const mqttEventEmitter = new Emitter();
export default mqttEventEmitter;

export type MqttEvent = "energyTodayData" | "powerData";
type MqttData<Event extends MqttEvent> = Event extends "energyTodayData"
    ? number
    : "ON" | "OFF";

export function waitForEventEmitterData<Events extends MqttEvent[]>(
    events: [...Events],
): Promise<{ [K in keyof Events]: MqttData<Events[K]> }> {
    const promises = events.map((event) => {
        return new Promise<MqttData<typeof event>>((resolve, reject) => {
            mqttEventEmitter.once(event, (data: MqttData<typeof event>) => {
                if (event === "energyTodayData" && typeof data === "number") {
                    resolve(data);
                } else if (event === "powerData" && (data === "ON" || data === "OFF")) {
                    resolve(data);
                } else {
                    reject(new Error(`Invalid data for ${event}`));
                }
            });
            setTimeout(
                () => reject(new Error(`Timeout waiting for ${event} MQTT data`)),
                10000,
            );
        });
    });
    return Promise.all(promises) as Promise<any>;
}
