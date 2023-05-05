import * as express from "express";
import { Application } from "express";
import { registerRoutes } from "./routes";
import { connectToDatabase } from "./db";

export async function setupApi(): Promise<Application> {
  const app = express();
  await connectToDatabase();
  registerRoutes(app);
  process.on("SIGTERM", () => process.exit());
  return app;
}
