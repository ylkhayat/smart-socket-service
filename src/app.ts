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

app.use((_, res, next) => {
  res.on("finish", () => {
    if (res.statusCode < 400) {
      const logServerData = require("./logger").logServerData;
      logServerData?.();
    }
  });
  next();
});

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
