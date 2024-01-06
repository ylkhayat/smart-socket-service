// src/app.ts
import express from "express";
import routes from "./routes";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api", routes); // Mount your routes under the /api path

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
