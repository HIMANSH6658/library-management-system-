import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

/* User Registration */
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const newuser = await new User({
      userId: req.body.userId,
      userFullName: req.body.userFullName,
      password: hashedPass,
      isAdmin: req.body.isAdmin || false,
      isActive: req.body.isActive !== false,
    });

    const user = await newuser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/* User Login */
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.body.userId });

    if (!user) {
      return res.status(404).json("User not found");
    }

    if (!user.isActive) {
      return res.status(403).json("User account is inactive");
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).json("Wrong Password");
    }

    // Sign JWT token
    const token = jwt.sign(
        { userId: user.userId, isAdmin: user.isAdmin, _id: user._id }, 
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "5d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.token = token;

    res.status(200).json(userResponse);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
