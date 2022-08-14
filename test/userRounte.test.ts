// import test, { describe } from "node:test";
import { describe, test, expect } from "@jest/globals";
import { app } from "../src/app";
import request from "supertest";
import * as dataBaseQueries from "../src/database/dataQueries";

describe("Testing Add Users to the Domian", () => {
    const userList = {
        allowedUsers: ["deepeshash444@gmail.com"],
        domain: "www.deepesh.com",
        adminUsers: ["zoro@gmail.com"],
    };
    test("should have message on successfull addition of users", async () => {
        // jest.spyOn(dataBaseQueries, "findDomain");
        // const result = await request(app).post("/addUsers").send(userList);
        // expect(dataBaseQueries.findDomain).toHaveBeenCalledTimes(1);
        // console.log(result.body);
        // expect(result.body).toHaveProperty("message");
        
    });
});
