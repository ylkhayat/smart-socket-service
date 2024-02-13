# 🧪 Parallel Subprocesses Testset

This directory contains all the runs for the Parallel Subprocesses testset.

This process uses instances of the previously defined `Start Wait Stop` testset!

## 💡 Explanation

Unlike the `smart-wait-stop`, this one assumes many people want to control the exact same smart socket concurrently. A real-life scenario could be a shared office space where different teams want to use the same projector. Each team wants to turn on the projector, use it for a certain duration, and then turn it off. However, if one team's usage overlaps with another, the projector should stay on. Thus, we want to start the projector, wait for it to be used for a certain duration, and then stop it. If the projector is already on, we don't need to do anything - as long as it stays on for the duration needed.

Once again, refer back to my personal explanation of what is a testset (the `start-wait-stop` one) in the document [start-wait-stop](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/start-wait-stop.pdf) 🚀

## 📊 Process Graph

![Process Diagram](https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/parallel-subprocesses/parallel-subprocesses.svg)

## 📊 HTML Reports

Please click on each [`run-<x>/README.md`] to view what is happening in each run and further information on why is a run different from another.

- [Run 1](run-1/README.md)
- [Run 2](run-2/README.md)
- [Run 3](run-3/README.md)
- [Run 4](run-4/README.md)
- [Run 5](run-5/README.md)

## Run the thing online!

You can start a process through this link which will take you to cpee.org and start the process for you! [Click me to create a process and get started!](https://cpee.org/flow/graph.html?load=https://raw.githubusercontent.com/ylkhayat/smart-socket-service/main/docs/testsets/parallel-subprocesses/parallel-subprocesses.xml)
