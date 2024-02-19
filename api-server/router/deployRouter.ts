import { Router } from "express";
import DeployController from "../controllers/deployController";

const deployRouter = Router();

deployRouter.post("/github", DeployController.deployGithubRepo);

export default deployRouter;
