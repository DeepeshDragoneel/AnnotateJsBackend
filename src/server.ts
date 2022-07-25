const express = require("express");
import cors from "cors";
const bodyParser = require("body-parser");
import morgan from "morgan";
const { config } = require("./config");
const { Sequelize } = require("sequelize");
const usersRoute = require("./routes/usersRoute");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const sequelize = new Sequelize({
    host: config.mysql.host,
    database: config.mysql.database,
    username: config.mysql.user,
    password: config.mysql.password,
    dialect: "mysql",
    port: 3306,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

app.use(usersRoute.routes);

const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        app.listen(config.server.port, () => {
            console.log("Listening on port: ", config.server.port);
        }).on("error", (e: Error) => {
            console.log("Error happened: ", e.message);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
connectToDB();
