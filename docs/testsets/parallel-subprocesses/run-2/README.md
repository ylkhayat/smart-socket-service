# 🧪 Parallel Subprocesses Testset - Run 2

A run is simply the environment or the setup in which the testset was executed.

## 📊 Process Graph

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/parallel-subprocesses/parallel-subprocesses.svg)

## 📋 Description

Quoting the description from the main `parallel-subprocesses` README:

> ### Literal Description
>
> The testset simulates a loop that is of 7 iterations. Each iteration starts with a script that generates 3 data element numbers, the first is the duration of the `toggleDuration` (the time we have to wait between starting and closing) for the first subprocess. The second is the duration of the `toggleDuration` for the second subprocess. The third is the duration of the timeout that is placed behind the second subprocess. This was done to achieve some kind of randomness in the testset, where subprocesses are harmonically communicating with the smart socket.
>
> ### Real-life Scenario
>
> Unlike the `smart-wait-stop`, this one assumes many people want to control the exact same smart socket concurrently. A real-life scenario could be a shared office space where different teams want to use the same projector. Each team wants to turn on the projector, use it for a certain duration, and then turn it off. However, if one team's usage overlaps with another, the projector should stay on. Thus, we want to start the projector, wait for it to be used for a certain duration, and then stop it. If the projector is already on, we don't need to do anything - as long as it stays on for the duration needed.
>
> Once again, refer back to my personal explanation of what is a testset (the `start-wait-stop` one) in the document [start-wait-stop](https://ylkhayat.github.io/smart-socket-service/testsets/#start-wait-stop.pdf) 🚀

For this run, the testset was executed for me, plugging in my personal laptop and letting the process control the powering on and off of the smart socket. The toggle durations and timeout duration were generated at random at each iteration.

### Manual Intervention

- Socket was `off` before starting.
- I manually turnt `off` and `on` the smart socket at different irregular intervals.

## Results

Check the results through the [energy-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#parallel-processes/run-2/energy-monitor.html) and the [server-monitor.html](https://ylkhayat.github.io/smart-socket-service/testsets/#parallel-processes/run-2/server-monitor.html) files.
