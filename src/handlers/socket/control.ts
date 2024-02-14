import { MQTTClient } from "../../mqtt/setupMQTT";

const { MQTT_TOPIC } = process.env;

const POWER_TOPIC = `cmnd/${MQTT_TOPIC}/Power`;

const sendSocket = (message: string) => {
  MQTTClient.publish(POWER_TOPIC, `${message}`);
};

export const startSocket = () => {
  sendSocket("on");
};

export const stopSocket = () => {
  sendSocket("off");
};
