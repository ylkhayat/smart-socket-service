import mqtt from "mqtt";
import {
  POWER_TOPIC_RESULT,
  STAT_TOPIC_RESULT,
  subscribeToPowerStatistics,
} from "../handlers/power-stats";
import mqttEventEmitter from "../eventEmitter";
import { serverData } from "../store/dataStore";
import { manualStop } from "../store/manualStop";

const PROTOCOL = "mqtt";
//TUM HOST 131.159.6.111
const HOST = "broker.emqx.io";
const PORT = "1883";
const CLIENT_ID = "DVES_%06X";

const CONNECT_URL = `${PROTOCOL}://${HOST}:${PORT}`;
export const TOPIC = "mixer";

export const MQTTClient = mqtt.connect(CONNECT_URL, {
  clientId: CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  username: "DVES_USER",
  password: "****",
});

let previousInstancesTriggeringPowerOff: string[] =
  serverData.instancesTriggeringPowerOff;

MQTTClient.on("connect", (ev) => {
  console.log("MQTT connected!");
  subscribeToPowerStatistics();

  MQTTClient.on("message", (topic, message) => {
    switch (topic) {
      case STAT_TOPIC_RESULT: {
        const data = JSON.parse(message.toString());
        const { EnergyToday } = data;
        const todayEnergy = EnergyToday?.Today;

        if (todayEnergy === undefined) {
          return;
        }
        mqttEventEmitter.emit("energyTodayData", todayEnergy);
        break;
      }
      case POWER_TOPIC_RESULT: {
        const data = message.toString();

        if (
          data === "OFF" &&
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

        mqttEventEmitter.emit("powerData", data);

        break;
      }
      default:
        break;
    }
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
});
