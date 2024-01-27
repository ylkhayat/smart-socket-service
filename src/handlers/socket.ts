import { MQTTClient, TOPIC } from "../mqtt/setupMQTT";
import { retrieveEnergyToday } from "./power-stats";

const POWER_TOPIC = `cmnd/${TOPIC}/Power`;

const sendSocket = (message: string) => {
  MQTTClient.publish(POWER_TOPIC, `${message}`);
};

export const startSocket = () => {
  sendSocket("on");
  retrieveEnergyToday(true);
};

export const stopSocket = () => {
  sendSocket("off");
};
