import { Router, Request, Response } from "express";
import { retrieveEnergyToday } from "./handlers/power-stats";
import { startSocket, stopSocket } from "./handlers/socket";
import mqttEventEmitter from "./eventEmitter";

const router = Router();

router.post("/start", async (req: Request, res: Response) => {
  await startSocket();
  res.status(200).send("Smart socket started");
});

router.post("/stop", async (req: Request, res: Response) => {
  await stopSocket();
  res.status(200).send("Smart socket stopped");
});

router.post("/wait", async (req: Request, res: Response) => {
  const { duration } = req.body;

  if (!duration || isNaN(duration) || duration <= 0) {
    return res.status(400).send("Invalid duration");
  }

  if (duration > 100) {
    return res.status(400).send("Duration too long");
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
    res.send(`Waited for ${duration} seconds`);
  } catch (error) {
    res.status(500).send("An error occurred");
  }
});

router.get("/power-statistics", async (_, res: Response) => {
  const waitForData = new Promise((resolve, reject) => {
    mqttEventEmitter.once("energyTodayData", (data) => {
      resolve(data);
    });

    // Timeout after 10 seconds (or your preferred time)
    setTimeout(() => {
      reject(new Error("Timeout waiting for MQTT data"));
    }, 10000);
  });

  try {
    retrieveEnergyToday();

    const data = await waitForData;
    res.json(data);
  } catch (error) {
    res.status(500).send("An error occurred while fetching power statistics");
  }
});

export default router;
