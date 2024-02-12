import { serverData } from "../../store";

type OperationReport = {
    message: string;
};

/**
 * Start socket manually and updates server-wide data accordingly.
 */
export const manualStart = (): OperationReport => {
    const lastPowerStatus =
        serverData.powerStatus[serverData.powerStatus.length - 1];
    if (lastPowerStatus.powerOn === null) {
        serverData.powerStatus[serverData.powerStatus.length - 1].powerOn = {
            instanceId: "<manual>",
            timestamp: new Date(),
        };
    } else {
        serverData.powerStatus.push({
            powerOn: {
                instanceId: "<manual>",
                timestamp: new Date(),
            },
            powerOff: null,
        });
    }


    let report: OperationReport = {
        message: `Server updated accordingly.`,
    };

    return report;
};
