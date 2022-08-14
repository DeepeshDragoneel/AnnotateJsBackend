import { describe, test, expect } from "@jest/globals";
import { connection, connectToDB } from "../src/database/db";

describe("Testing Connection and Start of the Backend", () => {
    test("should have message on successfull connection", async () => {
        await connectToDB();
        expect(connection).toBeDefined();
        connection.end();
    });
});
