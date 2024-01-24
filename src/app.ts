import express from "express";
import routes from "./routes";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
