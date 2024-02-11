import EventEmitter from "events";
import { Status0, Status10Energy } from "../mqtt/setupMQTT";
class Emitter extends EventEmitter { }
const mqttEventEmitter = new Emitter();
export default mqttEventEmitter;

export type MqttEvent = "energyData" | "powerData";

// type Events = {
//     energyData: Status10Energy[];
//     powerData: ("ON" | "OFF")[];
// };
// const events: Events = {
//     energyData: [],
//     powerData: [],
// };

// mqttEventEmitter.on("energyData", (data: Status10Energy) => {
//     console.log("Received energyData from MQTT", data);
//     events.energyData.push(data);
//     console.log("events.energyData", events.energyData);

// });
// mqttEventEmitter.on("powerData", (data: "ON" | "OFF") => {
//     console.log("Received powerData from MQTT", data);
//     events.powerData.push(data);
//     console.log("events.powerData", events.powerData);
// });


// export const waitForEventEmitterEnergyData = (): Promise<Status10Energy> =>
//     new Promise((resolve, reject) => {
//         if (events.energyData.length > 0) {
//             resolve(events.energyData.shift()!);
//         } else {
//             const interval = setInterval(() => {
//                 if (events.energyData.length > 0) {
//                     clearInterval(interval);
//                     resolve(events.energyData.shift()!);
//                 }
//             }, 100);

//             setTimeout(() => {
//                 clearInterval(interval);
//                 reject(new Error("Timeout waiting for energyData MQTT data"));
//             }, 5000);
//         }
//     });

// export const waitForEventEmitterPowerData = (): Promise<"ON" | "OFF"> =>
//     new Promise((resolve, reject) => {
//         if (events.powerData.length > 0) {
//             resolve(events.powerData.shift()!);
//         } else {
//             const interval = setInterval(() => {
//                 if (events.powerData.length > 0) {
//                     clearInterval(interval);
//                     resolve(events.powerData.shift()!);
//                 }
//             }, 100);

//             setTimeout(() => {
//                 clearInterval(interval);
//                 reject(new Error("Timeout waiting for powerData MQTT data"));
//             }, 5000);
//         }
//     });

export const waitForEventEmitterEnergyData = (): Promise<Status10Energy> =>
    new Promise((resolve, reject) => {
        mqttEventEmitter.once("energyData", (data: Status10Energy) => {
            resolve(data);
        });
        setTimeout(
            () => reject(new Error("Timeout waiting for energyData MQTT data")),
            5000,
        );
    });

export const waitForEventEmitterPowerData = (): Promise<"ON" | "OFF"> =>
    new Promise((resolve, reject) => {
        mqttEventEmitter.once("powerData", (data: "ON" | "OFF") => {
            resolve(data);
        });
        setTimeout(
            () => reject(new Error("Timeout waiting for powerData MQTT data")),
            5000,
        );
    });
