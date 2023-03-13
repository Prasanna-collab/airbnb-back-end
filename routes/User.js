const express = require("express");
const router = express.Router();
const User = require("../model/User");
const { hashing, hashCompare } = require("../library/auth");
const jwt = require("jsonwebtoken");
const jwtd = require("jwt-decode");
const Cookies = require("js-cookie");

router.get("/", (req, res) => {
  res.send({ message: "Welcome to Backend" });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json("User already exists. Try Login.");
    } else {
      const hash = await hashing(password);
      req.body.password = hash;
      await User.insertMany({ name: name, email: email, password: hash });
      res.status(200).json("User Registered Successfully");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const passwordOk = await hashCompare(password, user.password);
      if (passwordOk) {
        // chhecks for hashed password matching and if so, token will be stored into cookies.
        jwt.sign(
          { email: user.email, id: user._id },
          process.env.jwt_secret,
          { },
          (error, token) => {
            if (error) console.log(error);
            res.cookie("token", token).json(user);
          }
        );
      } else {
        res.status(400).json("nook");
      }
    } else {
      res.status(400).json("User doesn't exists");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
});

router.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.jwt_secret, {}, async (err, userInfo) => {
      if (err) throw err;
      const {email, id, name} = await User.findById(userInfo.id);
      res.json({email,id,name});
    });
  } else {
    res.json(null);
  }
});


router.post('/logout', async (req,res)=>{
  res.clearCookie('token').json({ message: 'User logged out' });
});







module.exports = router;
