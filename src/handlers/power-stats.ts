import { MQTTClient, TOPIC } from "../mqtt/setupMQTT";

const CMND_ENERGY_TOPIC = `cmnd/${TOPIC}/EnergyToday`;
export const STAT_TOPIC_RESULT = `stat/${TOPIC}/RESULT`;
export const POWER_TOPIC_RESULT = `stat/${TOPIC}/POWER`;

export const subscribeToPowerStatistics = () => {
  MQTTClient.subscribe([STAT_TOPIC_RESULT, POWER_TOPIC_RESULT], (err) => {
    if (!err) {
      console.log(`Subscribed to topic: '${STAT_TOPIC_RESULT}'`);
      console.log(`Subscribed to topic: '${POWER_TOPIC_RESULT}'`);
    }
  });
};

export const retrieveEnergyToday = () => {
  MQTTClient.publish(CMND_ENERGY_TOPIC, "");
};
