import { MQTTClient, TOPIC } from "../setupMQTT";

const TOPIC_POWER = `cmnd/${TOPIC}/Power`;

const sendSocket = (message: string) => {
  MQTTClient.publish(TOPIC_POWER, `${message}`);
};

export const startSocket = () => {
  sendSocket("on");
};

export const stopSocket = () => {
  sendSocket("off");
};
