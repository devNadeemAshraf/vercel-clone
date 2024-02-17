const { exec } = require('child_process')
const path = require("path");
const fs = require('fs');
const Redis = require("ioredis");

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require("mime-types");

const PROJECT_ID = process.env.PROJECT_ID;

// Should Come from ENV Variables
const publisher = new Redis(process.env.REDIS_SERVICE_URL)

const awsS3Client = new S3Client({
    region: "ap-south-1", // Change the region if required
    credentials: {
        accessKeyId: process.env.AWS_S3_CREDS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_CREDS_SECRET_ACCESS_KEY
    }
})

function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log));
}


async function init() {
    console.log('Executing script.js');
    publishLog('Executing script.js');
    publishLog('Building Project');

    const outDirPath = path.join(__dirname, "output");

    const process = exec(`cd ${outDirPath} && npm install && npm run build`); // After Clone, Install Packages in the folder

    process.stdout.on('data', (data) => {
        console.log('Data: ', data.toString())
        publishLog('Data: ', data.toString());
    })

    process.stdout.on('error', (err) => {
        console.log('Error: ', err.toString())
        publishLog('Error: ', err.toString());
    })

    process.on('close', async () => {
        console.log('Build Complete');
        publishLog('Build Complete');

        const distFolderPath = path.join(__dirname, 'output', 'dist');
        const distContents = fs.readFileSync(distFolderPath, { recursive: true }); // recursive means every nested content

        console.log('Starting File Uploads');
        publishLog('Starting File Uploads');

        for (const file of distContents) {
            // Path of Current File
            const filePath = path.join(distFolderPath, file);

            // Should not upload Folders to S3 so skip any directories
            // We Only Need Files to be uploaded
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('Uploading: ', filePath);
            publishLog('Uploading: ', filePath);

            const command = new PutObjectCommand({
                Bucket: "demo-vercel-clone", // Change the name as per your S3 Bucket
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            });

            await awsS3Client.send(command);
        }

        console.log('Finished Uploading Files');
        publishLog('Finished Uploading Files');
    })
}

init();