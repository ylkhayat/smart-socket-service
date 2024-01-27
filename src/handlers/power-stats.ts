import client from "../database";
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

export const retrieveEnergyToday = () => {
  // Pass 0 to reset the energy for today
  MQTTClient.publish(CMND_ENERGY_TOPIC, "0");
};

export const insertPowerStatistics = async (
  deviceId: string,
  timestamp: Date,
  powerConsumption: string,
) => {
  const query = `
        INSERT INTO power_stats (timestamp, power_consumption)
        VALUES ($1, $2)
    `;
  try {
    await client.query(query, [deviceId, timestamp, powerConsumption]);
    console.log("Power statistics inserted successfully");
  } catch (err) {
    console.error("Error inserting power statistics:", err);
    throw err; // or handle the error as needed
  }
};

export const getPowerStatistics = (arg0: Date, arg1: Date) => {
  throw new Error("Function not implemented.");
};
