import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HydroLink Plus API",
      version: "1.0.0",
      description: "API documentation for HydroLink Plus backend",
      contact: {
        name: "Your Team",
        email: "team@hydrolinkplus.in",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: "Local server",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to REST API annotations
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export const setupSwaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at /api-docs");
};
