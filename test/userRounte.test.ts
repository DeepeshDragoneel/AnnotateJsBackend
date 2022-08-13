// import test, { describe } from "node:test";
import { describe, test, expect } from "@jest/globals";
import { app } from "../src/app";
import request from "supertest";
import * as Mysql from "../src/config/mysql";

describe("Testing Add Users", () => {
    const userList = {
        allowedUsers: ["deepeshash444@gmail.com"],
        domain: "www.deepesh.com",
        adminUsers: ["zoro@gmail.com"],
    };
    test("should have message on successfull addition of users", async () => {
        // const MockAddUsersRequest = jest.fn((): any => userList);
        // jest.spyOn(Mysql, "Query").mockImplementation(() =>
        //     MockAddUsersRequest()
        // );
        const result = await request(app).post("/addUsers").send(userList);
        // expect(Mysql.Query).toHaveBeenCalledTimes(1);
        console.log(result.body);
        expect(result.body).toHaveProperty("message");
    });
});
