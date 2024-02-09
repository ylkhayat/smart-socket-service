import express from "express";
import routes from "./routes";

const PORT = 40111;

const app = express();

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
