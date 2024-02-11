import mqtt from "mqtt";

import mqttEventEmitter from "../events/eventEmitter";
import { serverData } from "../store";
import { manualStop } from "../handlers/socket/manualStop";
import {
  subscribeToPowerStatistics,
  ENERGY_TOPIC_RESULT,
  POWER_TOPIC_RESULT,
} from "../handlers/socket/powerMonitor";

const PROTOCOL = "mqtt";
//TUM HOST 131.159.6.111
const HOST = "broker.emqx.io";
const PORT = "1883";
const CLIENT_ID = "DVES_%06X";

const CONNECT_URL = `${PROTOCOL}://${HOST}:${PORT}`;

export const MQTTClient = mqtt.connect(CONNECT_URL, {
  clientId: CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  username: "DVES_USER",
  password: "****",
});

let previousInstancesTriggeringPowerOff: string[] = [];

export type Status10Energy = {
  apparentPower: number;
  current: number;
  factor: number;
  power: number;
  reactivePower: number;
  today: number;
  voltage: number;
};

MQTTClient.on("connect", (ev) => {
  console.log("MQTT connected!");
  subscribeToPowerStatistics();

  MQTTClient.on("message", (topic, message) => {
    switch (topic) {
      case ENERGY_TOPIC_RESULT: {
        const data = JSON.parse(message.toString());
        const { ENERGY } = data.StatusSNS;

        if (ENERGY === undefined) {
          return;
        }

        mqttEventEmitter.emit("energyData", {
          today: ENERGY.Today,
          apparentPower: ENERGY.ApparentPower,
          current: ENERGY.Current,
          factor: ENERGY.Factor,
          power: ENERGY.Power,
          reactivePower: ENERGY.ReactivePower,
          voltage: ENERGY.Voltage,
        } as Status10Energy);
        break;
      }
      case POWER_TOPIC_RESULT: {
        const data = message.toString();
        if (data === "OFF") {
          if (
            serverData.runningInstances.length > 0 &&
            serverData.instancesTriggeringPowerOff.length > 0 &&
            serverData.instancesTriggeringPowerOff.length ===
            previousInstancesTriggeringPowerOff.length
          ) {
            const { stoppedInstances } = manualStop();
            console.log(
              `Manual stop occurred, stopped instances ${stoppedInstances?.toString()}`,
            );
          }
          previousInstancesTriggeringPowerOff =
            serverData.instancesTriggeringPowerOff;
        }

        mqttEventEmitter.emit("powerData", data);

        break;
      }
      default:
        break;
    }
  });
});

MQTTClient.on("error", (error) => {
  console.error("Connection failed", error);
});

MQTTClient.on("disconnect", (error) => {
  console.error("Disconnected", error);
});

MQTTClient.on("close", () => {
  console.log("Closed");
});
