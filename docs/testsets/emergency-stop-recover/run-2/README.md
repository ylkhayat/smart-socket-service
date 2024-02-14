# 🧪 Emergency Stop & Recover Testset - Run 2

A run is simply the environment or the setup in which the testset was executed.

## 📊 Process Graph

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/emergency-stop-recover/emergency-stop-recover.svg)

## 📋 Description

Quoting the description from the main `emergency-stop-recover` README:

> ### Literal Description
>
> The testset simulates a situation where the process wants to run the smart socket for a `requiredDurationForPowerOn` in seconds, and branches out parallel branches to trigger a certain scenario. On one branch, the process starts an instance wants to keep this instance running but accounts for unexpected emergency stops to the smart socket. Then it handles it through recovering the system after a wait of 5 seconds and then start a new instance and continues the countdown till that the `requiredDurationForPowerOn` has passed. And further proceeds to stop the instance and potentially power off the smart socket. On the other branch, the testset includes a `emergencyAfterDuration` timeout and then triggers an emergency stop. Then it tries to instantly start an instance but it should fail gracefully as is expected since the server is in emergency mode and needs to be recovered.
>
> ### Real-life Scenario
>
> Imagine you're running a data center with multiple servers. Each server is expected to run continuously for a requiredDurationForPowerOn in hours. However, due to various reasons like maintenance, hardware issues, or power outages, a server might unexpectedly shut down.
>
> In such a scenario, the data center management system branches out into two parallel processes. On one branch, the system starts a server instance and aims to keep it running for the required duration. If an unexpected shutdown occurs, the system waits for 5 seconds, then starts a new instance and continues the countdown until the requiredDurationForPowerOn has passed. After this, it proceeds to stop the instance and potentially power off the server.
>
> On the other branch, the system includes an emergencyAfterDuration timeout and then triggers an emergency stop after this duration. It then tries to instantly start a new instance, but this should fail gracefully as expected, since the server is in emergency mode and needs to be recovered. This could represent a scenario where an immediate restart after a failure is not possible due to cooling requirements or hardware checks.
>
> Once again, refer back to my personal explanation of what is a testset (the `start-wait-stop` one) in the document [start-wait-stop](https://ylkhayat.github.io/smart-socket-service/testsets/#start-wait-stop.pdf) 🚀

For this run, the testset was executed for me, plugging in my personal mobile phone and letting the process control the powering on and off of the smart socket. The `requiredDurationForPowerOn` was 50 seconds and the `emergencyAfterDuration` was 10 seconds.

### Manual Intervention

- Socket was `off` before starting.
- I manually turnt `off` the smart socket sometime after it starting again when the recovery of the system was re-established.

## Results

Check the results through the [energy-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#emergency-stop-recover/run-2/energy-monitor.html) and the [server-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#emergency-stop-recover/run-2/server-monitor.html) files.
