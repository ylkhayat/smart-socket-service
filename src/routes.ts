import { Router, Request, Response } from "express";
import { retrieveEnergyToday } from "./handlers/power-stats";
import { startSocket, stopSocket } from "./handlers/socket";
import { waitForEventEmitterData } from "./eventEmitter";
import axios from "axios";

const router = Router();

let startEnergyToday: number | null = null;

router.post("/start", async (_, res: Response) => {
  try {
    startSocket();
    retrieveEnergyToday();
    const [energyTodayData, powerData] = await waitForEventEmitterData([
      "energyTodayData",
      "powerData",
    ]);
    startEnergyToday = energyTodayData;
    if (powerData === "ON") {
      return res.status(200).json({
        lastEnergyConsumptionToday: energyTodayData,
        energyConsumptionSinceStart: 0,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message:
        "An error occurred while connecting to the socket or fetching power statistics",
    });
  }
});

router.post("/stop", async (_, res: Response) => {
  try {
    stopSocket();
    const [powerData] = await waitForEventEmitterData(["powerData"]);
    if (powerData === "OFF") return res.status(200).send();
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while stopping the socket",
    });
  }
});

/**
 * Use the callback to not block the execution of the process
 */
router.get("/wait", async (req: Request, res: Response) => {
  const duration = parseInt(req.query.duration as string, 10);
  try {
    const callbackUrl = req.get("CPEE-CALLBACK");
    res.set("CPEE-CALLBACK", "true").status(200).json({
      waiting: true,
    });
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));

    if (callbackUrl) {
      return await axios.put(callbackUrl, {
        waiting: false,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/power-statistics", async (_, res: Response) => {
  try {
    retrieveEnergyToday();
    const [energyTodayData] = await waitForEventEmitterData([
      "energyTodayData",
    ]);
    if (startEnergyToday === null) {
      return res.status(200).json({
        energyConsumptionSinceStart: energyTodayData,
      });
    } else {
      return res.status(200).json({
        energyConsumptionSinceStart:
          startEnergyToday > 0
            ? energyTodayData - startEnergyToday
            : energyTodayData,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "An error occurred while fetching power statistics" });
  }
});

export default router;
