import {
    MQTTClient,
    Status10Energy,
    subscribeToTopics,
} from "../../mqtt/setupMQTT";
import {
    InstanceData,
    instancesData,
    resetAllData,
    serverData,
} from "../../store";
import * as powerMonitor from "./powerMonitor";
import mqttEventEmitter from "../../events/eventEmitter";

jest.mock("../../store");
jest.mock("mqtt");

jest.useFakeTimers();

const powerFetchingWorkerSpy = jest
    .spyOn(powerMonitor, "powerFetchingWorker")
    .mockImplementation(async () => {
        for (let i = 0; i < 2; i++) {
            powerMonitor.energyFetch();
        }
        if (serverData.runningInstances.length === 0) {
            powerMonitor.setupPowerStatisticWatcher();
        }
    });

jest
    .spyOn(powerMonitor, "setupPowerStatisticWatcher")
    .mockImplementation(async () => {
        if (serverData.runningInstances.length > 0) {
            powerMonitor.powerFetchingWorker();
        }
    });

describe("Power Monitor", () => {
    beforeEach(() => {
        resetAllData();
    });

    describe("subscribeToPowerStatistics", () => {

        beforeEach(() => {
            // jest.resetAllMocks();
            resetAllData();
        });


        it("should subscribe to power statistics topics", () => {
            subscribeToTopics();
            expect(MQTTClient.subscribe).toHaveBeenCalledWith(
                [
                    powerMonitor.ENERGY_TOPIC_RESULT,
                    powerMonitor.POWER_TOPIC_RESULT,
                    powerMonitor.STATUS_TOPIC_RESULT,
                ],
                expect.any(Function),
            );
        });
    });

    describe("retrieveEnergyToday", () => {
        it("should publish a message to retrieve energy today", () => {
            powerMonitor.retrieveEnergyToday();
            expect(MQTTClient.publish).toHaveBeenCalledWith(
                powerMonitor.CMND_STATUS_TOPIC,
                "10",
            );
        });
    });

    describe("setupPowerStatisticWatcher", () => {

        beforeEach(() => {
            jest.clearAllMocks();
            resetAllData();
        });

        it("should start the power statistic worker if there are running instances", () => {
            serverData.runningInstances = ["instance1", "instance2"];
            powerMonitor.setupPowerStatisticWatcher();
            expect(powerFetchingWorkerSpy).toHaveBeenCalledTimes(1);
        });

        it("should not start the power statistic worker if there are no running instances", () => {
            serverData.runningInstances = [];
            powerMonitor.setupPowerStatisticWatcher();
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
                    today: [0],
                },
            } as InstanceData;
            instancesData["instance2"] = {
                id: "instance2",
                energy: {
                    today: [5],
                },
            } as InstanceData;
            powerMonitor.setupPowerStatisticWatcher();
            mqttEventEmitter.emit("energyData", mockEnergyTodayData);
            jest.runAllTimers();
        });

        it("should update the power data if the power is connected", async () => {
            let instance1 = instancesData["instance1"];
            let instance2 = instancesData["instance2"];
            expect(instance1.energy.today).toStrictEqual([0, 10, 10, 10, 10]);
            expect(instance2.energy.today).toStrictEqual([5, 10, 10, 10, 10]);
        });
    });
});
