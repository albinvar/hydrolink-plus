import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { initWebSocketServer } from "./services/websocket.js";
import { startDisplayWebSocketServer } from "./services/websocketDisplay.js";
import apiRoutes from "./routes/api.js";
import { setupSwaggerDocs } from "./utils/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const DISPLAY_WS_PORT = process.env.DISPLAY_WS_PORT || 8081; // New WebSocket port

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

// Create an HTTP server for REST API and WebSocket
const server = createServer(app);

// Initialize WebSocket for **device communication**
initWebSocketServer(server);

// Start the **ESP32 display WebSocket server on a separate port**
startDisplayWebSocketServer(DISPLAY_WS_PORT);

// Start the API server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
