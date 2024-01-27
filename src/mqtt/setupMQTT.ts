import mqtt from "mqtt";
import {
  STAT_TOPIC_RESULT,
  subscribeToPowerStatistics,
} from "../handlers/power-stats";

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

// TelePeriod = 300
MQTTClient.on("connect", (ev) => {
  console.log("MQTT connected!");
  subscribeToPowerStatistics();

  MQTTClient.on("message", (topic, message) => {
    if (topic === STAT_TOPIC_RESULT) {
      const data = JSON.parse(message.toString());
      const { EnergyToday } = data;
      if (!EnergyToday) {
        return;
      }
      console.log("EnergyToday", data);
      // insertPowerStatistics(DeviceId, Time, POWER);
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
