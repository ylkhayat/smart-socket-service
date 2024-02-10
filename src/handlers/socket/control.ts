import { MQTTClient } from "../../mqtt/setupMQTT";
import { TOPIC } from "../../mqtt/topic";

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
