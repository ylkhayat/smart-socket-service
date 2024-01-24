import client from "../database";

export const insertPowerStatistics = async (
  deviceId: string,
  timestamp: Date,
  powerConsumption: string,
) => {
  const query = `
        INSERT INTO power_stats (device_id, timestamp, power_consumption)
        VALUES ($1, $2, $3)
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
