import { Connect } from "../config/mysql";
import logging from "../config/logging";

export let connection: any = undefined;

export const connectToDB = async () => {
    try {
        connection = await Connect();
        logging.info("Data Base", "Connected to DB");
    } catch (err) {
        logging.error("Data Base", err as string);
    }
};
