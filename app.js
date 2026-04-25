const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRouter = require("./backend/routes/user.route.js");
const veillogRouter = require("./backend/routes/veillog.route.js");
const connectToDB = require("./backend/config/db.js");
dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRouter);
app.use("/api", veillogRouter);

async function startServer() {
  try {
    await connectToDB();
    app.listen(process.env.PORT, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("server could start", error);
  }
}

startServer();
