import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import { setupSwaggerDocs } from "./utils/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger UI
setupSwaggerDocs(app);

// Routes
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the HydroLink Plus Backend");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
