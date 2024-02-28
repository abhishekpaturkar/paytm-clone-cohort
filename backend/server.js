import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connect } from "./database/connectDB.js";
import router from "./routes/router.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connect();
});
