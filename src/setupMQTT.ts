import mqtt from "mqtt";

const PROTOCOL = "mqtt";
const HOST = "broker.emqx.io";
const PORT = "1883";
const CLIENT_ID = "DVES_%06X";

const CONNECT_URL = `${PROTOCOL}://${HOST}:${PORT}`;
export const TOPIC = "mixer";

export const MQTTClient = mqtt.connect(CONNECT_URL, {
  clientId: CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  username: "DVES_USER",
  password: "****",
});

MQTTClient.on("connect", (ev) => {
  console.log("MQTT connected!");

  MQTTClient.subscribe([TOPIC], (err) => {
    if (!err) {
      // MQTTClient.publish(TOPIC, "Hello mqtt");
      console.log(`Subscribe to topic '${TOPIC}'`);
    }
  });
});

MQTTClient.on("message", (topic, message) => {
  // message is Buffer
  console.log("onMessage", topic, message.toString());
  // MQTTClient.end();
});

MQTTClient.on("error", (error) => {
  console.error("Connection failed", error);
});

MQTTClient.on("disconnect", (error) => {
  console.error("Disconnected", error);
});

MQTTClient.on("close", () => {
  console.error("Closed");
});

//131.159.6.111
