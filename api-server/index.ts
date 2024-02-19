const PORT = process.env.SERVER_PORT || 9000;
const SOCKET_PORT = process.env.SOCKET_PORT || 9001;

import express from "express";

import { httpServer, io } from "./socket";
import { initRedisSubscribe } from "./redis";

import deployRouter from "./router/deployRouter";

const app = express();

app.use(express.json());

app.use("/api/v1/deploy", deployRouter);

io.on("connection", (socket) => {
  socket.on("subscribe", (channel) => {
    socket.join(channel);
    socket.emit("messaged", `Joined ${channel}`);
  });
});

initRedisSubscribe();

httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket Listening on PORT:${SOCKET_PORT}`);
});

app.listen(PORT, () => console.log(`API Server Running on PORT:${PORT}`));
