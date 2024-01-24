import { Router, Request, Response } from "express";
import {
  getPowerStatistics,
  insertPowerStatistics,
} from "./handlers/power-stats";
import { startSocket, stopSocket } from "./handlers/socket";

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

const iso8601Regex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;

router.get("/power-statistics", async (req: Request, res: Response) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res
      .status(400)
      .send(
        "Please provide both startTime and endTime following a valid ISO 8601 format, example: 2021-01-01",
      );
  }

  if (!startTime || !endTime) {
    return res.status(400).send("Please provide both startTime and endTime");
  }

  if (
    !iso8601Regex.test(startTime as string) ||
    !iso8601Regex.test(endTime as string)
  ) {
    return res
      .status(400)
      .send(
        "Please provide both startTime and endTime in a valid ISO 8601 format, example: 2021-01-01T00:00:00Z",
      );
  }

  try {
    const statistics = await getPowerStatistics(
      new Date(startTime as string),
      new Date(endTime as string),
    );
    res.json(statistics);
  } catch (error) {
    res.status(500).send("An error occurred while fetching power statistics");
  }
});

router.post("/power-stats", async (req, res) => {
  const { deviceId, timestamp, powerConsumption } = req.body;

  try {
    await insertPowerStatistics(deviceId, timestamp, powerConsumption);
    res.status(200).send("Power statistics recorded successfully");
  } catch (error) {
    console.error("Error recording power statistics:", error);
    res.status(500).send("Failed to record power statistics");
  }
});

export default router;
