import { MQTTClient } from "../../mqtt/setupMQTT";

const { TOPIC } = process.env;

if (TOPIC === undefined) {
  throw new Error("TOPIC is not defined");
}

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
