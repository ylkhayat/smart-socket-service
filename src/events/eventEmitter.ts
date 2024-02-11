import EventEmitter from "events";
import { Status10Energy } from "../mqtt/setupMQTT";
class Emitter extends EventEmitter { }
const mqttEventEmitter = new Emitter();
export default mqttEventEmitter;

export type MqttEvent = "energyData" | "powerData";
type MqttData<Event extends MqttEvent> = Event extends "energyData"
    ? Status10Energy
    : "ON" | "OFF";

export function waitForEventEmitterData<Events extends MqttEvent[]>(
    events: [...Events],
): Promise<{ [K in keyof Events]: MqttData<Events[K]> }> {
    const promises = events.map(
        (event) =>
            new Promise<MqttData<typeof event>>((resolve, reject) => {
                mqttEventEmitter.once(event, (data: MqttData<typeof event>) => {
                    if (event === "energyData" && typeof data === "object") {
                        resolve(data);
                    } else if (
                        event === "powerData" &&
                        (data === "ON" || data === "OFF")
                    ) {
                        resolve(data);
                    } else {
                        reject(new Error(`Invalid data for ${event}`));
                    }
                });
                setTimeout(
                    () => reject(new Error(`Timeout waiting for ${event} MQTT data`)),
                    2000,
                );
            }),
    );
    return Promise.all(promises) as Promise<any>;
}
