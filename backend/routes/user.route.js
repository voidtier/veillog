const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const path = require("path");
const authentify = require("../middlewares/authetication.middleware.js");
const user = require("../models/user.model.js");

const frontendPath = path.join(__dirname, "../../frontend");
router.use(express.static(path.join(frontendPath, "assets")));

// router.use(function (req, res, next) {
//   console.log("userRouter hit:", req.method, req.url);
//   next();
// });

router.get("/", authentify, function (req, res) {
  res.sendFile(path.join(frontendPath, "index.html"));
});

router.post("/signup", async function (req, res) {
  try {
    // log this if you need
    // console.log(req.body);
    const { firstname, lastname, email, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUSer = new user({
      name: {
        firstname: firstname,
        lastname: lastname,
      },
      email,
      username,
      password: hashedPassword,
    });
    await newUSer.save();
    res.status(201).redirect("/signin");
  } catch (error) {
    res.status(500).send("Error saving user: " + error.message);
  }
});

router.get("/signup", function (req, res) {
  res.sendFile(path.join(frontendPath, "signup.html"));
});

router.post("/signin", async function (req, res) {
  // log this if you need
  // console.log(req.body);
  // console.log("signin hit");
  // console.log(req.body);
  try {
    const { email, password } = req.body;
    const foundUser = await user.findOne({ email });

    if (!foundUser) {
      return res.redirect("/signin?logerror=email or password is incorrect");
    }

    const corretPassword = await bcrypt.compare(password, foundUser.password);

    if (!corretPassword) {
      return res.redirect("/signin?logerror=email or password is incorrect");
    }

    const token = jsonwebtoken.sign(
      {
        id: foundUser._id,
        username: foundUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/");
  } catch (error) {
    return res.status(500).send("Error logging in: " + error.message);
  }
});

router.get("/signin", function (req, res) {
  // console.log("hello");
  res.sendFile(path.join(frontendPath, "signin.html"));
});

router.get("/user", authentify, async function (req, res) {
  const userId = req.user._id || req.user.id;
  try {
    const foundUser = await user.findById(userId);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ username: foundUser.username });
  } catch (error) {
    console.log(`:${error}`);
  }
});

router.get("/signout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/signin");
});

module.exports = router;
