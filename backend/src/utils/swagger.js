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
  },
  apis: ["./src/routes/*.js"], // Path to REST API annotations
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export const setupSwaggerDocs = (app) => {
  app.use("/api-docs", (req, res, next) => {
    // Get request protocol and host dynamically
    const protocol = req.protocol;
    const host = req.get("host");

    // Modify servers dynamically before serving the docs
    swaggerSpec.servers = [
      { url: `${protocol}://${host}`, description: "Dynamic Server" },
    ];

    next();
  });

  app.use("/api-docs", swaggerUi.serve, (req, res) =>
    swaggerUi.setup(swaggerSpec)(req, res)
  );

  console.log("Swagger UI available at /api-docs");
};
