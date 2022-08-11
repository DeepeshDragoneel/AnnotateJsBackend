import express from "express";
const router = express.Router();
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql::memory:");
import Domain = require("../models/domains");
import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { connection } from "../db";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
import { SMTPClient } from "emailjs";

type DomainResultType = { domainId: number; domainName: string };
type UserResultType = {
    userId: number;
    userName: string;
    email: string;
    password: string;
    newAccount: number;
};

type DomainToUsersType = {
    domainId: number;
    email: string;
    isAdmin: number;
};

const NAMESPACE = "usersRoute";

router.post(
    "/addUsers",
    async (req: express.Request, res: express.Response) => {
        const allowedUsers = req.body.allowedUsers;
        const adminUsers = req.body.adminUsers;
        const domainName = req.body.domain;
        //logging.info(NAMESPACE, "Adding users and domains to database");
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
            //logging.info(NAMESPACE, "All Domains: ", results);
            if (results.length === 0 || results === undefined) {
                //logging.info(NAMESPACE, "Adding Domain");
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
            console.log(allowedUsers);
            for (let i = 0; i < allowedUsers.length; i++) {
                console.log(allowedUsers[i]);
                // query =
                //     "SELECT * FROM users WHERE email = '" +
                //     allowedUsers[i] +
                //     "'";
                // const results = (await Query(
                //     connection!,
                //     query
                // )) as UserResultType[];
                // //logging.info(NAMESPACE, "User: ", results);
                // if (results.length === 0 || results === undefined) {
                //     //logging.info(NAMESPACE, "Adding User");
                //     query = `INSERT INTO users (userName, email, newAccount) VALUES ('${allowedUsers[i]}', '${allowedUsers[i]}', false)`;
                //     await Query(connection!, query);
                // }
                query = `INSERT INTO domainToUsers (domainId, email, isAdmin) VALUES (${domainId}, '${allowedUsers[i]}', 0)`;
                await Query(connection!, query);
            }

            //Creating or fetching admin users
            for (let i = 0; i < adminUsers.length; i++) {
                // query =
                //     "SELECT * FROM users WHERE email = '" + adminUsers[i] + "'";
                // const results = (await Query(
                //     connection!,
                //     query
                // )) as UserResultType[];
                // //logging.info(NAMESPACE, "Admins: ", results);
                // if (results.length === 0 || results === undefined) {
                //     //logging.info(NAMESPACE, "Adding User");
                //     query = `INSERT INTO users (userName, email) VALUES ('${adminUsers[i]}', '${adminUsers[i]}')`;
                //     await Query(connection!, query);
                // }
                console.log(adminUsers[i]);
                query = `DELETE FROM domainToUsers WHERE domainId = ${domainId} AND email = '${adminUsers[i]}'`;
                await Query(connection!, query);
                query = `INSERT INTO domainToUsers (domainId, email, isAdmin) VALUES (${domainId}, '${adminUsers[i]}', 1)`;
                await Query(connection!, query);
            }
        } catch (err) {
            // logging.error(NAMESPACE, err as string);
            console.log(err);
        }
    }
);

router.post(
    "/userLogin",
    async (req: express.Request, res: express.Response) => {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const domain = req.body.domain;
        // //logging.info("USER LOGIN", "User login");
        try {
            let query = "SELECT * FROM users WHERE email = '" + email + "'";
            let results = (await Query(connection!, query)) as UserResultType[];
            // //logging.info("USER LOGIN", "User: ", results);
            if (results.length == 0) {
                query = "SELECT * FROM users WHERE userName = '" + email + "'";
                results = (await Query(connection!, query)) as UserResultType[];
            }
            if (results.length === 0 || results === undefined) {
                // //logging.info("USER LOGIN", "User not found");
                res.status(200).json({
                    success: false,
                    message: "User not found",
                });
            } else {
                console.log(results[0], results[0].newAccount);
                // if (results[0].newAccount === 0) {
                //     res.status(200).json({
                //         success: false,
                //         message: "User not found",
                //     });
                // }
                if (results[0].password === password) {
                    // //logging.info("USER LOGIN", "User found");
                    const token = jwt.sign(
                        {
                            userId: results[0].userId,
                            userName: results[0].userName,
                            email: results[0].email,
                        },
                        process.env.JWT_SECRET_KEY
                    );
                    query = `SELECT * FROM domainToUsers WHERE email = '${email}' AND domainId = (SELECT domainId FROM registeredDomains WHERE domainName = '${domain}')`;
                    const newResults = (await Query(connection!, query)) as DomainToUsersType[];
                    let temp = 0;
                    console.log(newResults);
                    if (newResults.length !== 0 && newResults !== undefined) {
                        temp = newResults[0].isAdmin;
                    }
                    console.log(temp);
                    res.status(200).json({
                        success: true,
                        message: "User found",
                        token: token,
                        userName: results[0].userName,
                        userId: results[0].userId,
                        email: results[0].email,
                        isAdmin: temp,
                    });
                } else {
                    // //logging.info("USER LOGIN", "Wrong password");
                    res.status(200).json({
                        success: false,
                        message: "Wrong password",
                    });
                }
            }
        } catch (err) {
            //logging.error("USER LOGIN", err as string);
        }
    }
);

router.post(
    "/checkUser",
    async (req: express.Request, res: express.Response) => {
        const token = req.body.AnnotateJsUserToken;
        // //logging.info("CHECK USER", "Checking user");
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // //logging.info("CHECK USER", "User found");
            res.status(200).json({
                success: true,
                message: "User found",
                userName: decoded.userName,
            });
        } catch (err) {
            //logging.error("CHECK USER", err as string);
            res.status(200).json({
                success: false,
                message: "User not found",
            });
        }
    }
);

router.post(
    "/userRegister",
    async (req: express.Request, res: express.Response) => {
        const userName = req.body.userName;
        const email = req.body.email;
        const password = req.body.password;
        // //logging.info("USER REGISTER", "User register");
        try {
            let query = "SELECT * FROM users WHERE email = '" + email + "'";
            const results = (await Query(
                connection!,
                query
            )) as UserResultType[];
            // //logging.info("USER REGISTER", "User: ", results);
            if (results.length === 0 || results === undefined) {
                // //logging.info("USER REGISTER", "Adding User");
                // query = `INSERT INTO users (userName, email, password) VALUES ('${userName}', '${email}', '${password}')`;
                // await Query(connection!, query);
                // //logging.info("USER REGISTER", "User added");
                // res.status(200).json({
                //     success: true,
                //     message: "User added",
                // });
                const token = jwt.sign(
                    {
                        userName: userName,
                        email: email,
                        password: password,
                    },
                    process.env.JWT_SECRET_KEY
                );
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                console.log(decoded);
                console.log(token);
                let transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.GMAIL,
                        pass: process.env.GMAIL_PASSWORD,
                    },
                });
                let info = await transporter.sendMail({
                    from: "annotatejs@gmail.com",
                    to: email,
                    subject: "AnnotateJS Registration",
                    text: "Dont share this link to anyone!",
                    html: `<h2>Please click on the below link to verfiy your Account</h2><br/><a href=${process.env.BACKEND_URL}/verifyUser?token=${token}>Verify Account</a>`,
                });
                res.status(200).json({
                    success: true,
                    message: "Email sent to the user",
                });
            } else {
                // //logging.info("USER REGISTER", "User already exists");
                res.status(200).json({
                    success: false,
                    message: "User already exists",
                });
            }
        } catch (err) {
            //logging.error("USER REGISTER", err as string);
        }
    }
);

router.get(
    "/verifyUser",
    async (req: express.Request, res: express.Response) => {
        const token = req.query.token!;
        console.log(token);
        //logging.info("VERIFY USER", "Verifying user");
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            //logging.info("VERIFY USER", "Adding user");
            const query = `INSERT INTO users (userName, email, password) VALUES ('${decoded.userName}', '${decoded.email}', '${decoded.password}')`;
            await Query(connection!, query);
            //logging.info("VERIFY USER", "User added");
            res.set("Content-Type", "text/html");
            res.send(
                Buffer.from(
                    "<h1>User added</h1><br/><h3>You can now Login with your credentials!</h3>"
                )
            );
        } catch (err) {
            //logging.error("VERIFY USER", err as string);
            res.set("Content-Type", "text/html");
            res.send(Buffer.from("<h1>Error Adding User</h1>"));
        }
    }
);

router.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

exports.routes = router;
