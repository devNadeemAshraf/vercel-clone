import Redis from "ioredis";
import { io } from "./socket";

const subscriber = new Redis(process.env.REDIS_SERVICE_URL!);

export function initRedisSubscribe() {
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    io.to(channel).emit(message);
  });
}
