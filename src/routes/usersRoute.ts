import express from "express";
const router = express.Router();
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql::memory:");
import Domain = require("../models/domains");
import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { connection } from "../db";

type DomainResultType = { domainId: number; domainName: string };
type UserResultType = { userId: number; userName: string; email: string };

const NAMESPACE = "usersRoute";

router.post(
    "/addUsers",
    async (req: express.Request, res: express.Response) => {
        const allowedUsers = req.body.allowedUsers;
        const adminUsers = req.body.adminUsers;
        // console.log(allowedUsers);
        const domainName = req.body.domain;
        logging.info(NAMESPACE, "Adding users and domains to database");
        try {
            //creating or fetching domain Id
            let query =
                "SELECT * FROM registeredDomains WHERE domainName = '" +
                domainName +
                "'";
            let domainId: number;
            const results = (await Query(
                connection!,
                query
            )) as DomainResultType[];
            logging.info(NAMESPACE, "All Domains: ", results);
            if (results.length === 0 || results === undefined) {
                logging.info(NAMESPACE, "Adding Domain");
                query =
                    "INSERT INTO registeredDomains (domainName) VALUES ('" +
                    domainName +
                    "')";
                await Query(connection!, query);
            }
            domainId = results[0].domainId;
            //Removing all users from domain
            query = `DELETE FROM domainToUsers WHERE domainId = ${domainId}`;
            await Query(connection!, query);

            //Creating or fetching users
            for (let i = 0; i < allowedUsers.length; i++) {
                query =
                    "SELECT * FROM users WHERE email = '" +
                    allowedUsers[i] +
                    "'";
                const results = (await Query(
                    connection!,
                    query
                )) as UserResultType[];
                logging.info(NAMESPACE, "User: ", results);
                if (results.length === 0 || results === undefined) {
                    logging.info(NAMESPACE, "Adding User");
                    query = `INSERT INTO users (userName, email) VALUES ('${allowedUsers[i]}', '${allowedUsers[i]}')`;
                    await Query(connection!, query);
                }
                query = `INSERT INTO domainToUsers (domainId, userId) VALUES (${domainId}, ${results[0].userId})`;
                await Query(connection!, query);
            }

            //Creating or fetching admin users
            for (let i = 0; i < adminUsers.length; i++) {
                query =
                    "SELECT * FROM users WHERE email = '" + adminUsers[i] + "'";
                const results = (await Query(
                    connection!,
                    query
                )) as UserResultType[];
                logging.info(NAMESPACE, "Admins: ", results);
                if (results.length === 0 || results === undefined) {
                    logging.info(NAMESPACE, "Adding User");
                    query = `INSERT INTO users (userName, email) VALUES ('${adminUsers[i]}', '${adminUsers[i]}')`;
                    await Query(connection!, query);
                }
                query = `INSERT INTO domainToUsers (domainId, userId, admin) VALUES (${domainId}, ${results[0].userId}, 1)`;
                await Query(connection!, query);
            }
        } catch (err) {
            logging.error(NAMESPACE, err as string);
        }
    }
);

router.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

exports.routes = router;
