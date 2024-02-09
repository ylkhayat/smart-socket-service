import { Router, Request, Response } from "express";
import { retrieveEnergyToday } from "./handlers/power-stats";
import { startSocket, stopSocket } from "./handlers/socket";
import { waitForEventEmitterData } from "./eventEmitter";
import {
  InstanceData,
  InstanceDataInput,
  instancesData,
  serverData,
} from "./store/dataStore";
import { stopInstance } from "./store/stopInstance";
import { startInstance } from "./store/startInstance";
import { emergencyStop } from "./store/emergyStop";
import { deleteInstance } from "./store/deleteInstance";
import { setupPowerStatisticWatcher } from "./store/powerMonitorWorker";

const router = Router();

router.post(
  "/instance",
  async (req: Request<any, any, any, InstanceDataInput>, res: Response) => {
    const query = req.query;
    /**
     * @default 2000 ms
     */
    const samplingInterval = query.samplingInterval
      ? parseInt(query.samplingInterval, 10)
      : 2000;
    const emergencyStopTimeout = query.emergencyStopTimeout
      ? parseInt(query.emergencyStopTimeout, 10)
      : null;

    let instanceData: Partial<InstanceData> = {
      consumedEnergyToday: 0.000,
      amperage: [],
      samplingInterval,
      startTimestamp: new Date(),
      stopTimestamp: null,
      powerOffTimestamp: null,
      isEmergencyStopped: false,
    };
    if (emergencyStopTimeout)
      instanceData.emergencyStopTimeout = emergencyStopTimeout;

    try {
      startSocket();
      retrieveEnergyToday();
      const [energyTodayData, powerData] = await waitForEventEmitterData([
        "energyTodayData",
        "powerData",
      ]);

      if (powerData === "OFF") {
        return res.status(409).json({
          message: "The socket turned off unexpectedly",
        });
      }
      instanceData.initialEnergyToday = energyTodayData;

      const {
        instanceId,
        isLastEmergencyStop,
        triggeredPowerOn,
        success,
        message,
        instance,
      } = startInstance(instanceData as InstanceData);

      if (!success) {
        return res.status(409).json({
          message,
          instanceId,
        });
      }
      setupPowerStatisticWatcher();
      return res.status(200).json({
        instanceId,
        isLastEmergencyStop,
        triggeredPowerOn,
        instance,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "An error occurred while controlling the socket or fetching power statistics",
      });
    }
  },
);

type PutInstanceParams = {
  instanceId: string;
};

router.put(
  "/instance",
  async (req: Request<any, any, any, PutInstanceParams>, res: Response) => {
    const instanceId = req.query.instanceId;

    if (!instanceId)
      return res.status(422).json({ message: "instanceId is required" });
    try {
      const { success, message, triggeredPowerOff, isLastEmergencyStop } =
        stopInstance(instanceId);

      if (!success) {
        return res.status(409).json({
          message,
          instanceId,
        });
      }

      if (triggeredPowerOff) {
        stopSocket();
      }

      const [powerData] = await waitForEventEmitterData(["powerData"]);
      if (powerData === "OFF")
        return res.status(200).send({
          instanceId,
          isLastEmergencyStop,
          triggeredPowerOff,
        });
    } catch (error) {
      return res.status(500).send({
        message: "An error occurred while stopping the socket",
      });
    }
  },
);

router.put("/emergency-stop", async (_: Request, res: Response) => {
  try {
    const { message, success, instanceId, stoppedInstances } = emergencyStop();
    if (!success) {
      return res.status(409).json({
        message,
        instanceId,
      });
    }

    stopSocket();
    const [powerData] = await waitForEventEmitterData(["powerData"]);

    if (powerData === "OFF")
      return res.status(200).send({
        instanceId,
        stoppedInstances,
      });
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while stopping the socket",
    });
  }
});

type GetInstanceParams = {
  instanceId: string;
};

router.get(
  "/instance",
  async (req: Request<any, any, any, GetInstanceParams>, res: Response) => {
    const { instanceId: id } = req.query;
    if (!id) return res.status(422).json({ message: "instanceId is required" });
    try {
      const instance = instancesData[id];
      if (!instance) {
        return res.status(404).json({
          message: `Instance with ID ${id} does not exist`,
        });
      }
      return res.status(200).json({
        instance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while fetching the instance",
      });
    }
  },
);

type DeleteInstanceParams = {
  instanceId: string;
};

router.delete(
  "/instance",
  async (req: Request<any, any, any, DeleteInstanceParams>, res: Response) => {
    const { instanceId: id } = req.query;
    if (!id) return res.status(422).json({ message: "instanceId is required" });
    try {
      const {
        message,
        success,
        instanceId,
        instance,
        isLastEmergencyStop,
        triggeredPowerOff,
      } = deleteInstance(id);
      if (!success) {
        return res.status(409).json({
          message,
          instanceId,
        });
      }

      if (triggeredPowerOff) {
        stopSocket();
      }

      const [powerData] = await waitForEventEmitterData(["powerData"]);
      if (powerData === "OFF")
        return res.status(200).send({
          instance,
          isLastEmergencyStop,
          triggeredPowerOff,
        });
    } catch (error) {
      return res.status(500).send({
        message: "An error occurred while stopping the socket",
      });
    }
  },
);

type WaitParams = {
  duration: string;
};

router.get(
  "/wait",
  async (req: Request<any, any, any, WaitParams>, res: Response) => {
    const duration = parseInt(req.query.duration, 10);

    if (isNaN(duration)) {
      return res.status(422).json({ message: "duration is required" });
    }

    try {
      const callbackUrl = req.get("CPEE-CALLBACK");
      setTimeout(function () {
        if (callbackUrl) {
          fetch(callbackUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              waiting: false,
            })
          });
        }
      }, duration * 1000);
      return res.set("CPEE-CALLBACK", "true").status(200).json({
        waiting: true,
      });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred" });
    }
  },
);

export default router;
