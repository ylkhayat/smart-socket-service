// Has to be the first import
import 'dotenv/config'

import express from "express";
import routes from "./routes";


const {
  MQTT_TOPIC,
  MQTT_PROTOCOL,
  MQTT_HOST,
  MQTT_PORT,
  MQTT_CLIENT_ID,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  PORT,
  LOGGING_ENABLED,
} = process.env;

if (PORT === undefined) {
  throw new Error("PORT is not defined");
}

if (
  MQTT_TOPIC === undefined ||
  MQTT_PROTOCOL === undefined ||
  MQTT_HOST === undefined ||
  MQTT_PORT === undefined ||
  MQTT_CLIENT_ID === undefined ||
  MQTT_USERNAME === undefined ||
  MQTT_PASSWORD === undefined
) {
  throw new Error("MQTT environment variables are not defined!");
}

const app = express();

if (LOGGING_ENABLED) {
  console.log("Logging is enabled!")
  const logServerData = require("./logger").logServerData;

  app.use((_, res, next) => {
    res.on("finish", () => {
      logServerData();
    });
    next();
  });
}

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
