const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const JWT_SECRET = "jsdfgk@jmzxckv#bm&&poiajjdKLFJM'adsfjk]fkldas;lkf";

mongoose.connect("mongodb://localhost:27017/login-app-db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// register
app.post("/api/register", async (req, res) => {
  const {
    email,
    password: plainTextPassword,
    fname,
    lname
  } = req.body;

  if (!email || typeof email !== "string") {
    return res.json({ status: "error", error: "Invalid Email" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await User.create({
      email,
      password,
      fname,
      lname
    });
    console.log("User created successfully: ", response);
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: "error", error: "Email already in use" });
    }
    throw error;
  }

  res.json({ status: "ok" });
});

// login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();

  if (!user) {
    return res.json({ status: "error", error: "Invalid Email/password" });
  }

  //if the Email, password combination is successful
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ status: "ok", token: token });
  }

  res.json({ status: "error", error: "Invalid Email/password" });
});

// Authorization
app.post("/api/authen", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ status: "ok", decoded });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.listen(7777, () => {
  console.log("Server start!, Listening On Port 7777");
});
