import mqtt from "mqtt";

import mqttEventEmitter from "../events/eventEmitter";
import { serverData } from "../store";
import { manualStop } from "../handlers/socket/manualStop";
import {
  ENERGY_TOPIC_RESULT,
  POWER_TOPIC_RESULT,
  STATUS_TOPIC_RESULT,
  powerFetch,
  retrieveGeneralStatus,
} from "../handlers/socket/powerMonitor";
import { manualStart } from "../handlers/socket/manualStart";

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

export type Status0 = {
  deviceName: string;
  power: number;
};

export const subscribeToTopics = () => {
  MQTTClient.subscribe(
    [ENERGY_TOPIC_RESULT, POWER_TOPIC_RESULT, STATUS_TOPIC_RESULT],
    (err) => {
      if (!err) {
        console.log(
          `Subscribed to topics: [${ENERGY_TOPIC_RESULT}, ${POWER_TOPIC_RESULT}, ${STATUS_TOPIC_RESULT}]`,
        );
        /**
         * Fetch very initial power statistics
         */
        powerFetch();
        retrieveGeneralStatus();
      }
    },
  );
};

MQTTClient.on("connect", (ev) => {
  console.log("MQTT connected!");
  subscribeToTopics();

  MQTTClient.on("message", (topic, message) => {
    switch (topic) {
      case STATUS_TOPIC_RESULT: {
        const data = JSON.parse(message.toString());
        const { DeviceName, Power } = data.Status;
        serverData.connectedSocketName = DeviceName;
        console.log(`Connected to smart plug '${DeviceName}'`!);
        serverData.powerStatus[0].powerOn =
          Power === 1
            ? {
              timestamp: new Date(),
              instanceId: "<unknown>",
            }
            : null;
        break;
      }
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
            serverData.instancesTriggeringPowerOff.length ===
            previousInstancesTriggeringPowerOff.length
          ) {
            const { stoppedInstances } = manualStop();
            console.info(
              `Manual stop occurred, stopped instances [${stoppedInstances?.toString()}]!`,
            );
          }
          previousInstancesTriggeringPowerOff =
            serverData.instancesTriggeringPowerOff;
        } else {
          if (serverData.instancesStarting.length === 0) {
            manualStart();
            console.info("Manual start occurred!");
          }
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
