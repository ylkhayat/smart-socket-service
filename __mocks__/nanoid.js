let count = 0;

module.exports = {
  nanoid: jest.fn(() => `fixed-mock-id-${count++}`),
};
