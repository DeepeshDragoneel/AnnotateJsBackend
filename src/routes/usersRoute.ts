import express from "express";
const router = express.Router();
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql::memory:");
import Domain = require("../models/domains");
import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { connection } from "../db";
const jwt = require("jsonwebtoken");

type DomainResultType = { domainId: number; domainName: string };
type UserResultType = {
    userId: number;
    userName: string;
    email: string;
    password: string;
};

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

router.post(
    "/userLogin",
    async (req: express.Request, res: express.Response) => {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        logging.info("USER LOGIN", "User login");
        try {
            const query = "SELECT * FROM users WHERE email = '" + email + "'";
            const results = (await Query(
                connection!,
                query
            )) as UserResultType[];
            logging.info("USER LOGIN", "User: ", results);
            if (results.length === 0 || results === undefined) {
                logging.info("USER LOGIN", "User not found");
                res.status(200).json({
                    success: false,
                    message: "User not found",
                });
            } else {
                if (results[0].password === password) {
                    logging.info("USER LOGIN", "User found");
                    const token = jwt.sign(
                        {
                            userId: results[0].userId,
                            userName: results[0].userName,
                            email: results[0].email,
                        },
                        process.env.JWT_SECRET_KEY
                    );
                    res.status(200).json({
                        success: true,
                        message: "User found",
                        token: token,
                        userName: results[0].userName,
                    });
                } else {
                    logging.info("USER LOGIN", "Wrong password");
                    res.status(200).json({
                        success: false,
                        message: "Wrong password",
                    });
                }
            }
        } catch (err) {
            logging.error("USER LOGIN", err as string);
        }
    }
);

router.post("/checkUser", (req: express.Request, res: express.Response) => {
    const token = req.body.AnnotateJsUserToken;
    logging.info("CHECK USER", "Checking user");
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        logging.info("CHECK USER", "User found");
        res.status(200).json({
            success: true,
            message: "User found",
            userName: decoded.userName,
        });
    } catch (err) {
        logging.error("CHECK USER", err as string);
        res.status(200).json({
            success: false,
            message: "User not found",
        });
    }
});

router.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

exports.routes = router;
