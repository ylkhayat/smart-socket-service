const MQTTClient = {
  connect: jest.fn(),
  on: jest.fn(),
  end: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
};

module.exports = {
  connect: jest.fn(() => MQTTClient),
};
