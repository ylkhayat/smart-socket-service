let count = 0;

module.exports = {
  generate: jest.fn(() => `fixed-mock-id-${count++}`),
};
