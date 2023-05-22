require("dotenv").config();
const express = require("express");
var jwt = require("jsonwebtoken");
const Client = require("../models/client");
const Pfp = require("../models/pfp");
const fs = require("fs");
// To validate user's response
const { body, validationResult } = require("express-validator");
const router = express.Router();
const fetchuser = require("../Middleware/fetchuser");
const multer = require("multer");
// JWT key
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Route: 1 Login user who exists at /login
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res
        .status(400)
        .json({ progress: success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Checking if email exists in db
      let client = await Client.findOne({ email });
      if (!client) {
        return res.status(400).json({ progress: success });
      }

      // Checking if password matches in db
      if (!password) {
        return res.status(400).json({ progress: success });
      }
      if (password !== client.password) {
        return res.status(400).json({ progress: success });
      }
      // Creating JWT token using data's id
      const data = {
        user: {
          id: client._id,
        },
      };
      // Signing token
      success = true;
      const jwtData = jwt.sign(data, JWT_SECRET, { expiresIn: "6005s" });
      res.json({ progress: success, jwtData, client });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Some error Happened");
    }
  }
);

// Route: 2 Creating new user at /createuser
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").exists(),
    body("semester", "Enter Your semester").exists(),
    body("course", "Enter Courses").exists(),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // Return bad request on error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res
        .status(400)
        .json({ progress: success, errors: errors.array() });
    }

    try {
      let client = await Client.findOne({ email: req.body.email });
      // Checking if email already exists
      if (client) {
        return res
          .status(400)
          .json({ progress: success, errors: "Email Already exists" });
      }

      // Creating new user
      client = await Client.create({
        name: req.body.name,
        course: req.body.course,
        semester: req.body.semester,
        score: req.body.score ? req.body.score : 0,
        email: req.body.email,
        password: req.body.password,
        status: req.body.status ? req.body.status : "student",
      });

      // Creating JWT token using data's id
      const data = {
        user: {
          id: client._id,
        },
      };
      // Signing token
      success = true;
      const jwtData = jwt.sign(data, JWT_SECRET, { expiresIn: "6005s" });
      res.json({ progress: success, jwtData });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Some error Happened");
    }
  }
);

// Route: 3 Give user details after login /getuser
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.body.userId });
    res.json(client);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Some error Happened");
  }
});

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: Storage,
}).single("profileImage");

//Route: 4 Upload or Change user profile picture at /setPfp
router.post("/setPfp", fetchuser, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) console.log(err);
      else {
      
        var img = fs.readFileSync(req.file.path);
        var encode_img = img.toString("base64");

        if (req.body.current === "true") {
          const UserPfp = await Pfp.findOneAndUpdate(
            { user: req.user.id },
            {
              $set: {
                image: {
                  data: Buffer.from(encode_img, "base64"),
                  contentType: "image/png",
                },
              },
            }
          );
          res.status(200).send({ message: "Uploaded Successfully"});
        } else {
          const UserPfp = await Pfp.create({
            user: req.user.id,
            Name: req.body.name,
            image: {
              data: Buffer.from(encode_img, "base64"),
              contentType: "image/png",
            },
          });
          res.status(200).send({ message: "Changed Successfully"});
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Some error Happened");
  }
});

//Route:5 get user picture if any at /getPfp
router.post("/getPfp", fetchuser, async (req, res) => {
  try {
    const img = await Pfp.findOne({ user: req.body.userID });
    if (img) {
      res.json({ status: true, img });
    } else {
      res.json({ status: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Some error Happened");
  }
});

//Route:6 delete user picture if any at /delPfp
router.put("/delPfp", fetchuser, async (req, res) => {
  try {
    const img = await Pfp.findOneAndDelete({ user: req.user.id });
    if (img) {
      res.status(200).json({ status: true });
    } else {
      res.status(400).json({ status: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Some error Happened");
  }
});
module.exports = router;
