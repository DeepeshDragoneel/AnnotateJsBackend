import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { config } from "./config/config";
import { Sequelize } from "sequelize";
const usersRoute = require("./routes/usersRoute");
const commentRoute = require("./routes/commentsRoutes");
import mysql from "mysql";
import { connectToDB } from "./db";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// const sequelize = new Sequelize({
//     host: config.mysql.host,
//     database: config.mysql.database,
//     username: config.mysql.user,
//     password: config.mysql.password,
//     dialect: "mysql",
//     port: 3306,
//     logging: console.log,
//     dialectOptions: {
//         ssl: "Amazon RDS",
//     },
//     pool: { maxConnections: 5, maxIdleTime: 30 },
//     language: "en",
// });

// const connection = mysql.createConnection({
//     host: config.mysql.host,
//     user: config.mysql.user,
//     password: config.mysql.password,
//     database: config.mysql.database,
//     port: 3306,
//     ssl: "Amazon RDS",
// });

// connection.connect((err: Error) => {
//     if (err) {
//         console.log(err);
//     }
// });

// connection.query(
//     "SELECT * FROM registeredDomains",
//     function (error: Error, results: any, fields: any) {
//         if (error) throw error;
//         console.log("The solution is: ", results);
//     }
// );

app.use(usersRoute.routes);
app.use(commentRoute.routes);

const startApp = async () => {
    try {
        // await sequelize.authenticate();
        // console.log("Connection has been established successfully.");
        // await sequelize.sync();
        connectToDB();
        app.listen(config.server.port, () => {
            console.log("Listening on port: ", config.server.port);
        }).on("error", (e: Error) => {
            console.log("Error happened: ", e.message);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

startApp();
