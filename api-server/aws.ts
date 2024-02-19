import { ECSClient } from "@aws-sdk/client-ecs";
import { ECSClientConfig } from "./config";

// Configure ECS Client
export const client = new ECSClient(ECSClientConfig);
