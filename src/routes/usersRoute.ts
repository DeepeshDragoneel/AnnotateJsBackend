import express from "express";
const router = express.Router();

router.post("/addUsers", (req: express.Request, res: express.Response) => {
    const allowedUsers = req.body.allowedUsers;
    console.log(allowedUsers);
});

router.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

exports.routes = router;