import { MQTTClient, TOPIC } from "../mqtt/setupMQTT";

const POWER_TOPIC = `cmnd/${TOPIC}/Power`;

const sendSocket = (message: string) => {
  MQTTClient.publish(POWER_TOPIC, `${message}`);
};

export const startSocket = () => {
  sendSocket("on");
};

export const stopSocket = () => {
  sendSocket("off");
};
