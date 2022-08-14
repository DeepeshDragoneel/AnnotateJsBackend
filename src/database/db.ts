import * as redis from "redis";
import { Connect } from "../config/mysql";
import logging from "../config/logging";

export let connection: any = undefined;
export let redisClient: any = undefined;

export const connectToDB = async () => {
    try {
        connection = await Connect();
        logging.info("Data Base", "Connected to REDIS and MYSQL DB");
        redisClient = redis.createClient();

        redisClient.on("error", (error: any) =>
            console.error(`Error : ${error}`)
        );

        await redisClient.connect();
        return connection;
    } catch (err) {
        logging.error("Data Base", err as string);
    }
};
