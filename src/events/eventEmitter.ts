import EventEmitter from "events";
import { Status0, Status10Energy } from "../mqtt/setupMQTT";
class Emitter extends EventEmitter { }
const mqttEventEmitter = new Emitter();
export default mqttEventEmitter;

export type MqttEvent = "energyData" | "powerData";

export const waitForEventEmitterEnergyData = (): Promise<Status10Energy> =>
    new Promise((resolve, reject) => {
        mqttEventEmitter.once("energyData", (data: Status10Energy) => {
            resolve(data);
        });
        setTimeout(
            () => reject(new Error("Timeout waiting for energyData MQTT data")),
            2000,
        );
    });

export const waitForEventEmitterPowerData = (): Promise<"ON" | "OFF"> =>
    new Promise((resolve, reject) => {
        mqttEventEmitter.once("powerData", (data: "ON" | "OFF") => {
            resolve(data);
        });
        setTimeout(
            () => reject(new Error("Timeout waiting for powerData MQTT data")),
            2000,
        );
    });
