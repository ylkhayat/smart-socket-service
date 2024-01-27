const client = require("./src/database.js");

const createPowerStatsTable = `
CREATE TABLE IF NOT EXISTS power_stats (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    power_consumption DECIMAL NOT NULL
);
`;

async function setupDatabase() {
  try {
    await client.query(createPowerStatsTable);
    console.log("Power stats table created successfully");
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  }
}

setupDatabase();
