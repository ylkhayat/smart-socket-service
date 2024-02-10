import { subscribeToPowerStatistics, retrieveEnergyToday, setupPowerStatisticWatcher } from "./powerMonitor";
import { MQTTClient } from "../../mqtt/setupMQTT";
import { waitForEventEmitterData } from "../../events/eventEmitter";
import { serverData, instancesData } from "../../store";

jest.mock("../../mqtt/setupMQTT");
jest.mock("../../events/eventEmitter");
jest.mock("../../store");

describe("Power Monitor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("subscribeToPowerStatistics", () => {
        it("should subscribe to power statistics topics", () => {
            subscribeToPowerStatistics();
            expect(MQTTClient.subscribe).toHaveBeenCalledWith(
                ["stat/${TOPIC}/RESULT", "stat/${TOPIC}/POWER"],
                expect.any(Function)
            );
        });
    });

    describe("retrieveEnergyToday", () => {
        it("should publish a message to retrieve energy today", () => {
            retrieveEnergyToday();
            expect(MQTTClient.publish).toHaveBeenCalledWith(
                "cmnd/${TOPIC}/EnergyToday",
                ""
            );
        });
    });

    describe("setupPowerStatisticWatcher", () => {
        it("should start the power statistic worker if there are running instances", () => {
            serverData.runningInstances = ["instance1", "instance2"];
            instancesData["instance1"] = { initialEnergyToday: 0 };
            instancesData["instance2"] = { initialEnergyToday: 0 };

            setupPowerStatisticWatcher();

            expect(setInterval).toHaveBeenCalledTimes(1);
            expect(setInterval).toHaveBeenCalledWith(
                expect.any(Function),
                2000
            );
        });

        it("should not start the power statistic worker if there are no running instances", () => {
            serverData.runningInstances = [];

            setupPowerStatisticWatcher();

            expect(setInterval).not.toHaveBeenCalled();
        });

        it("should not start the power statistic worker if it is already running", () => {
            serverData.runningInstances = ["instance1"];
            instancesData["instance1"] = { initialEnergyToday: 0 };
            setInterval.mockReturnValue(123);

            setupPowerStatisticWatcher();

            expect(setInterval).not.toHaveBeenCalled();
        });
    });
});