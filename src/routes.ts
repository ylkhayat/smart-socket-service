import { Router, Request, Response } from "express";
import { startSocket, stopSocket } from "./handlers/socket/control";
import { waitForEventEmitterData } from "./events/eventEmitter";
import {
  InstanceData,
  InstanceDataInput,
  instancesData,
  serverData,
} from "./store";
import { stopInstance } from "./handlers/instance/stopInstance";
import { startInstance } from "./handlers/instance/startInstance";
import { emergencyStop } from "./handlers/socket/emergencyStop";
import { deleteInstance } from "./handlers/instance/deleteInstance";
import {
  retrieveEnergyToday,
  setupPowerStatisticWatcher,
} from "./handlers/socket/powerMonitor";

const router = Router();

router.post(
  "/instance",
  async (req: Request<any, any, any, InstanceDataInput>, res: Response) => {
    const query = req.query;

    const emergencyStopTimeout = query.emergencyStopTimeout
      ? parseInt(query.emergencyStopTimeout, 10)
      : null;

    let instanceData: Partial<InstanceData> = {
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
      const eventData = await waitForEventEmitterData([
        "energyData",
        "powerData",
      ]);
      if (eventData === undefined) {
        throw new Error("An error occurred while stopping the socket");
      }
      const [energyData, powerData] = eventData;
      if (powerData === "OFF") {
        return res.status(409).json({
          message: "The socket turned off unexpectedly",
        });
      }
      instanceData.energy = {
        apparentPower: [energyData.apparentPower],
        consumedToday: 0,
        current: [energyData.current],
        factor: [energyData.factor],
        initialToday: energyData.today,
        power: [energyData.power],
        reactivePower: [energyData.reactivePower],
        voltage: [energyData.voltage],
      };

      const { instanceId, success, message, instance } = startInstance(
        instanceData as InstanceData,
      );

      if (!success) {
        return res.status(409).json({
          message,
          instanceId,
        });
      }
      setupPowerStatisticWatcher();
      return res.status(200).json({
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
  "/instance/:instanceId?",
  async (req: Request<any, any, any, PutInstanceParams>, res: Response) => {
    const { instanceId } = req.params;
    if (!instanceId)
      return res.status(422).json({ message: "instanceId is required" });
    try {
      const { success, statusCode, message, triggeredPowerOff, instance } =
        stopInstance(instanceId);

      if (!success) {
        return res.status(statusCode).json({
          message,
          instanceId,
        });
      }

      if (!triggeredPowerOff) {
        return res.status(200).json({
          instance,
          triggeredPowerOff,
        });
      }

      stopSocket();
      const eventData = await waitForEventEmitterData(["powerData"]);
      if (eventData === undefined) {
        throw new Error("An error occurred while stopping the socket");
      }
      const [powerData] = eventData;
      if (powerData === "OFF")
        return res.status(200).json({
          instance,
          triggeredPowerOff,
        });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while stopping the socket",
      });
    }
  },
);

router.put(
  "/emergency-stop/:instanceId?",
  async (req: Request, res: Response) => {
    const { instanceId: id } = req.params;
    try {
      const { message, success, instanceId, stoppedInstances } =
        emergencyStop(id);
      if (!success) {
        return res.status(409).json({
          message,
          instanceId,
        });
      }

      stopSocket();
      const eventData = await waitForEventEmitterData(["powerData"]);
      if (eventData === undefined) {
        throw new Error("An error occurred while stopping the socket");
      }
      const [powerData] = eventData;
      if (powerData === "OFF")
        return res.status(200).json({
          instanceId,
          stoppedInstances,
        });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while stopping the socket",
      });
    }
  },
);

type GetInstanceParams = {
  instanceId: string;
};

router.get(
  "/instance/:instanceId",
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
  "/instance/:instanceId?",
  async (req: Request<any, any, any, DeleteInstanceParams>, res: Response) => {
    const { instanceId: id } = req.params;
    if (!id) return res.status(422).json({ message: "instanceId is required" });
    try {
      const {
        message,
        success,
        statusCode,
        instanceId,
        instance,
        triggeredPowerOff,
      } = deleteInstance(id);
      if (!success) {
        return res.status(statusCode).json({
          message,
          instanceId,
        });
      }

      if (!triggeredPowerOff) {
        return res.status(200).json({
          instance,
        });
      }
      stopSocket();
      const eventData = await waitForEventEmitterData(["powerData"]);
      if (eventData === undefined) {
        throw new Error("An error occurred while stopping the socket");
      }
      const [powerData] = eventData;
      if (powerData === "OFF")
        return res.status(200).json({
          instance,
        });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while stopping the socket",
      });
    }
  },
);

type GetWaitParams = {
  duration: string;
};

router.get(
  "/wait",
  async (req: Request<any, any, any, GetWaitParams>, res: Response) => {
    const duration = parseInt(req.query.duration, 10);

    if (isNaN(duration)) {
      return res.status(422).json({ message: "duration is required" });
    }

    try {
      const callbackUrl = req.get("CPEE-CALLBACK");
      setTimeout(() => {
        if (callbackUrl) {
          fetch(callbackUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              waiting: false,
            }),
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

router.get("/download", (_: Request, res: Response) => {
  const data = {
    instances: instancesData,
    server: serverData,
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=server_state.json",
  );
  res.status(200).send(JSON.stringify(data, null, 4));
});

export default router;
