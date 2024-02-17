const express = require('express');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');

const app = express();
const PORT = 9000;

const io = new Server({
    cors: '*'
});

io.on('connection', (socket) => {
    socket.on('subscribe', channel => {
        socket.join(channel);
        socket.emit('messaged', `Joined ${channel}`);
    })
});

io.listen(9001, () => console.log(`Socket Server Listening on PORT:9001`))

const subscriber = new Redis(process.env.REDIS_SERVICE_URL);

const client = new ECSClient({
    region: 'ap-sout-1',
    credentials: {
        accessKeyId: process.env.AWS_ECS_CREDS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ECS_CREDS_SECRET_ACCESS_KEY
    }
})

const clusterConfig = {
    CLUSTER: "", // arn of AWS cluster
    TASK: "" // arn of AWS task
}

app.use(express.json());

app.post("/project", async (req, res) => {
    const { gitRepoURL } = req.body;
    const projectSlug = generateSlug();

    // Spin Container
    const command = new RunTaskCommand({
        cluster: clusterConfig.CLUSTER,
        taskDefinition: clusterConfig.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: "ENABLED",
                subnets: ['', '', ''],
                securityGroups: [""]
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image', // built docker image name
                    environment: [
                        {
                            name: 'GIT_REPO_URL', value: gitRepoURL
                        },
                        {
                            name: 'PROJECT_ID', value: projectSlug
                        }
                    ]
                }
            ]
        }
    });

    await client.send(command);

    return res.json({
        status: 'QUEUED',
        data: {
            projectSlug,
            url: `http://${projectSlug}.localhost:8000` // note we are passing 8000, the reverse proxy port
        }
    })
})

function initRedisSubscribe() {
    subscriber.psubscribe('logs:*');
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit(message)
    })
}

initRedisSubscribe();

app.listen(PORT, () => console.log(`API Server Running on PORT:9000`))