import { MQTTClient, TOPIC } from "../mqtt/setupMQTT";

const CMND_ENERGY_TOPIC = `cmnd/${TOPIC}/EnergyToday`;
export const STAT_TOPIC_RESULT = `stat/${TOPIC}/RESULT`;

export const subscribeToPowerStatistics = () => {
  MQTTClient.subscribe([STAT_TOPIC_RESULT], (err) => {
    if (!err) {
      console.log(`Subscribed to topic: '${STAT_TOPIC_RESULT}'`);
    }
  });
};

export const retrieveEnergyToday = (initialCall = false) => {
  // Pass 0 to reset the energy for today
  MQTTClient.publish(CMND_ENERGY_TOPIC, initialCall === true ? "0" : "");
};
