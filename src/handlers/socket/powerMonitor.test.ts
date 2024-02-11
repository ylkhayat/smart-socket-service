import {
    CMND_ENERGY_TOPIC,
    POWER_TOPIC_RESULT,
    ENERGY_TOPIC_RESULT,
    powerFetch,
    powerFetchingWorker,
    retrieveEnergyToday,
    setupPowerStatisticWatcher,
    subscribeToPowerStatistics,
} from "./powerMonitor";
import { MQTTClient, Status10Energy } from "../../mqtt/setupMQTT";
import {
    InstanceData,
    instancesData,
    resetAllData,
    serverData,
} from "../../store";
import * as powerMonitor from "./powerMonitor";
import mqttEventEmitter from "../../events/eventEmitter";

jest.mock("../../store");

jest.useFakeTimers();

const powerFetchingWorkerSpy = jest
    .spyOn(powerMonitor, "powerFetchingWorker")
    .mockImplementation(async () => {
        for (let i = 0; i < 2; i++) {
            powerFetch();
        }
        if (serverData.runningInstances.length === 0) {
            setupPowerStatisticWatcher();
        }
    });

jest
    .spyOn(powerMonitor, "setupPowerStatisticWatcher")
    .mockImplementation(async () => {
        if (serverData.runningInstances.length > 0) {
            powerFetchingWorker();
        }
    });

jest.mock("../../mqtt/setupMQTT", () => ({
    MQTTClient: {
        subscribe: jest.fn(),
        publish: jest.fn(),
    },
    TOPIC: "mixer",
}));

describe("Power Monitor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetAllData();
    });

    describe("subscribeToPowerStatistics", () => {
        it("should subscribe to power statistics topics", () => {
            subscribeToPowerStatistics();
            expect(MQTTClient.subscribe).toHaveBeenCalledWith(
                [ENERGY_TOPIC_RESULT, POWER_TOPIC_RESULT],
                expect.any(Function),
            );
        });
    });

    describe("retrieveEnergyToday", () => {
        it("should publish a message to retrieve energy today", () => {
            retrieveEnergyToday();
            expect(MQTTClient.publish).toHaveBeenCalledWith(CMND_ENERGY_TOPIC, "");
        });
    });

    describe("setupPowerStatisticWatcher", () => {
        it("should start the power statistic worker if there are running instances", () => {
            serverData.runningInstances = ["instance1", "instance2"];
            setupPowerStatisticWatcher();
            expect(powerFetchingWorkerSpy).toHaveBeenCalledTimes(1);
        });

        it("should not start the power statistic worker if there are no running instances", () => {
            serverData.runningInstances = [];
            setupPowerStatisticWatcher();
            expect(powerFetchingWorkerSpy).not.toHaveBeenCalled();
        });
    });

    describe("powerFetchingWorker", () => {
        const mockEnergyTodayData = {
            today: 10,
            apparentPower: 10,
            current: 10,
            factor: 10,
            power: 10,
            reactivePower: 10,
            voltage: 10,
        } as Status10Energy;

        beforeEach(() => {
            serverData.runningInstances = ["instance1", "instance2"];
            instancesData["instance1"] = {

                id: "instance1",
                energy: {
                    initialToday: 0,
                    consumedToday: 0,
                },
            } as InstanceData;
            instancesData["instance2"] = {
                id: "instance2",
                energy: {
                    initialToday: 5,
                    consumedToday: 0,
                },
            } as InstanceData;
            setupPowerStatisticWatcher();
            mqttEventEmitter.emit("energyData", mockEnergyTodayData);
            jest.runAllTimers();
        });

        it("should update the power data if the power is connected", async () => {
            let instance1 = instancesData["instance1"];
            let instance2 = instancesData["instance2"];
            expect(instance1.energy.consumedToday).toBe(
                mockEnergyTodayData.today - instance1.energy.initialToday,
            );
            expect(instance2.energy.consumedToday).toBe(
                mockEnergyTodayData.today - instance2.energy.initialToday,
            );
        });
    });
});
