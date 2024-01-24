import { Client } from "pg";

const client = new Client({
  user: "youssef",
  host: "localhost",
  database: "mixer_interaction",
  password: "",
  port: 5432,
});

client.connect(function (err) {
  if (err) throw err;
  console.log("Database connected!");
});

export default client;
