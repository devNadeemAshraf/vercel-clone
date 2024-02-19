import { Request, Response } from "express";
import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { generateSlug } from "random-word-slugs";

import { clusterConfig } from "../config";
import { client } from "../aws";

export default class DeployContoller {
  static async deployGithubRepo(req: Request, res: Response) {
    const { githubURL } = req.body;
    const projectSlug = generateSlug();

    // Add Slug and body Validation

    // Spin Container Command
    const spinContainerCommand = new RunTaskCommand({
      cluster: clusterConfig.CLUSTER,
      taskDefinition: clusterConfig.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: ["", "", ""],
          securityGroups: [""],
        },
      },
      overrides: {
        containerOverrides: [
          {
            // Docker image name
            name: "builder-image",

            // Set Environment Variables
            environment: [
              {
                name: "GIT_REPO_URL",
                value: githubURL,
              },
              {
                name: "PROJECT_ID",
                value: projectSlug,
              },
            ],
          },
        ],
      },
    });

    // Spin Docker Container UP
    await client.send(spinContainerCommand);

    // Generate URL
    const reverseProxyHost = process.env.REVERSE_PROXY_HOST!;
    const protocol = reverseProxyHost.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${projectSlug}.${reverseProxyHost}`;

    // Send back the response
    return res.status(200).json({
      status: "QUEUED",
      message: "Your Deployment is in queue. Please wait until its done.",
      data: {
        slug: projectSlug,
        url,
      },
    });
  }
}
