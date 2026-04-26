const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.route.js");
const veillogRouter = require("./routes/veillog.route.js");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRouter);
app.use("/api", veillogRouter);

module.exports = app;
