import express from "express";
const router = express.Router();
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql::memory:");
import logging from "../config/logging";
import { Connect, Query } from "../config/mysql";
import { connection } from "../db";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
import { SMTPClient } from "emailjs";

type UserResultType = {
    userId: number;
    userName: string;
    email: string;
    password: string;
};

type DomainResultType = {
    domainId: number;
    domainName: string;
};

type PageOfDomainType = {
    id: number;
    domainId: number;
    pageName: string;
};

type CommentType = {
    commentsId: number;
    pageOfDomainId: number;
    userId: number;
    message: string;
    elementIdentifier: string;
};

router.post(
    "/postComment",
    async (req: express.Request, res: express.Response) => {
        try {
            const {
                comment,
                itemBeingCommented,
                pageOfDomain,
                userToken,
                domain,
            } = req.body;
            const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
            const userId = decoded.userId;
            let query = `SELECT * FROM users WHERE userId = ${userId}`;
            const userResults = (await Query(
                connection!,
                query
            )) as UserResultType[];
            if (userResults.length === 0) {
                res.json({
                    success: false,
                    message: "User not found",
                });
            } else {
                query = `SELECT * FROM registeredDomains WHERE domainName = '${domain}'`;
                const domainResult = (await Query(
                    connection!,
                    query
                )) as DomainResultType[];
                if (domainResult.length === 0) {
                    res.json({
                        success: false,
                        message: "Domain not found",
                    });
                }
                query = `SELECT * FROM pagesOfDomain WHERE pageName = '${pageOfDomain}'`;
                let pageResult = (await Query(
                    connection!,
                    query
                )) as PageOfDomainType[];
                if (pageResult.length === 0) {
                    query = `INSERT INTO pagesOfDomain (pageName, domainId) VALUES ('${pageOfDomain}', ${domainResult[0].domainId})`;
                    pageResult = (await Query(
                        connection!,
                        query
                    )) as PageOfDomainType[];
                }
                console.log(pageResult);
                query = `INSERT INTO comments (pageOfDomainId, userId, message, elementIdentifier) VALUES (${pageResult[0].id}, ${userId}, '${comment}', '${itemBeingCommented}')`;
                const commentResult = (await Query(
                    connection!,
                    query
                )) as CommentType[];
                res.json({
                    success: true,
                    message: "Comment posted",
                });
            }
        } catch (err) {
            // logging.error("Comments", err as string);
            console.log(err);
            res.status(500).send(err);
        }
    }
);

exports.routes = router;
