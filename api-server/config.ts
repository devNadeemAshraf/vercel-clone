import { ECSClientConfigType } from "@aws-sdk/client-ecs";

export const ECSClientConfig: ECSClientConfigType = {
  region: process.env.AWS_ECS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ECS_CREDS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_ECS_CREDS_SECRET_ACCESS_KEY!,
  },
};

export const clusterConfig = {
  CLUSTER: process.env.AWS_ARN_CONFIG_CLUSTER!, // ARN of AWS cluster
  TASK: process.env.AWS_ARN_CONFIG_TASK!, // ARN of AWS task
};
