import express from "express";
import swaggerUI from "swagger-ui-express";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../utils/swagger.util.json"), "utf8")
);

const SwaggerRouter = express.Router();

SwaggerRouter.use("/", swaggerUI.serve);

SwaggerRouter.get("/", swaggerUI.setup(swaggerDocument))

export default SwaggerRouter
