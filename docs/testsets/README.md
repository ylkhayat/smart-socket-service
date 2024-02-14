# 🧪 Testsets Directory

Welcome to the testsets directory! This is where we store our testsets, which are collections of test cases that verify the functionality of specific parts of our application under different conditions.

## What is a Testset?

A testset is a collection of test cases. Each test case is a specific scenario where a test is conducted to ensure the functionality of a part of our application. It includes the input, expected output, and the process of executing the test. Without further due, please check the handwritten explanation of a simple testset which in our case is the `start-wait-stop`, here it is [start-wait-stop.pdf](https://ylkhayat.github.io/smart-socket-service/testsets/#start-wait-stop.pdf) 🚀

## Our Testsets

We currently have two main testsets in this directory: `parallel-subprocesses` and `start-wait-stop`.

- The `start-wait-stop` testset tests the basic start, wait, and stop functionality of our application. You can find it in the [start-wait-stop](https://ylkhayat.github.io/smart-socket-service/testsets/#start-wait-stop/README.md) directory.

- The `parallel-subprocesses` testset builds upon `start-wait-stop`, testing scenarios where multiple subprocesses are running in parallel. This mirrors real-life usage of our application. You can find it in the [parallel-subprocesses](https://ylkhayat.github.io/smart-socket-service/testsets/#parallel-subprocesses/README.md) directory.

- The `emergency-stop-recover` testset builds upon components of the `start-wait-stop`, testing scenarios where one process is trying to accomplish something and an emergency occurs and the process has to recover to finish working. This mirrors real-life usage of our application. You can find it in the [emergency-stop-recover](https://ylkhayat.github.io/smart-socket-service/testsets/#emergency-stop-recover/README.md) directory.

## Contributing

Feel free to create your own testset and publish it as a reusable subprocess. We would love to see your contributions!
