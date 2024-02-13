import express from "express";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config();

let logServerData = null;

const PORT = 40111;

const app = express();

app.use((_, res, next) => {
  res.on("finish", () => {
    if (res.statusCode < 400) {
      logServerData = require("./logger").logServerData;
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