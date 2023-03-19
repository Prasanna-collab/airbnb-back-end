const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Places = require("../model/Places");
const { hashing, hashCompare } = require("../library/auth");
const jwt = require("jsonwebtoken");
const jwtd = require("jwt-decode");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");

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
          {},
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
      const { email, id, name } = await User.findById(userInfo.id);
      res.json({ email, id, name });
    });
  } else {
    res.json(null);
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token").json({ message: "User logged out" });
});

// console.log(__dirname)
router.post("/upload-by-link", async (req, res) => {
  try {
    const { link } = req.body;
    const newFilename = Date.now() + ".jpg";
    await imageDownloader.image({
      url: link,
      dest: __dirname + "/uploads/" + newFilename,
    });
    res.json(newFilename);
  } catch (error) {
    console.log("Try Different Url");
    res.json("Try Different Url");
  }
});
const photoMiddleware = multer({ dest: "routes/uploads" }); //existing folder where our all photos whould be stored earlier in upload by link
router.post("/upload", photoMiddleware.array("photos", 100), (req, res) => {
  // console.log(req.files) // will give you the array of data such as path origanlfilename, size, directory and all when the file is uplaoded in the front end.
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i]; // if multiple files are uploaded every files should be converted. thats why files[i] iterated.
    const parts = originalname.split("."); //parts return a array of name and extension.
    const extension = parts[parts.length - 1];
    const newPath = path + "." + extension;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("routes\\uploads\\", "")); //just to remove the prefixes just to send the file name to the front end to show the image in setAddedPhotos.
  }

  res.json(uploadedFiles);
});

router.post("/places", (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addedphotos,
    perks,
    description,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price
  } = req.body;
  jwt.verify(token, process.env.jwt_secret, {}, async (err, userInfo) => {
    if (err) throw err;
    const placesInfo = await Places.create({
      owner: userInfo.id,
      title,
      address,
      addedphotos,
      perks,
      description,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price
    });
    res.json(placesInfo);
  });
});

router.get("/user-places", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.jwt_secret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Places.find({ owner: id }));
  });
});

router.get("/places/:id", async (req, res) => {
  // res.json(req.params)
  const { id } = req.params;
  res.json(await Places.findById(id));
});

router.put("/places", async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedphotos,
    perks,
    description,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price
  } = req.body;
  jwt.verify(token, process.env.jwt_secret, {}, async (err, userInfo) => {
    if (err) throw err;
    const placeDoc = await Places.findById(id);
    if (userInfo.id === placeDoc.owner.toString()) {
        placeDoc.set({
        title,
        address,
        addedphotos,
        perks,
        description,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price
      });
      await placeDoc.save()
      res.json("ok");
    }
  });
});

router.get('/places', async(req,res)=>{
  res.json(await Places.find())
})

module.exports = router;
