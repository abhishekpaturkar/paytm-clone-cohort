import express from "express";
import zod from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { protectedRoute } from "../middleware/authMiddleware.js";
import Account from "../models/accountModel.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const signupSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});
router.post("/signup", async (req, res) => {
  try {
    const user = await signupSchema.safeParse(req.body);

    if (!user.success) {
      return res.status(400).json({ msg: "Invalid Data" });
    }

    const alreadyExists = await User.findOne({ username: user.data.username });

    if (alreadyExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      username: user.data.username,
      password: user.data.password,
      firstName: user.data.firstName,
      lastName: user.data.lastName,
    });

    if (!newUser) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    await Account.create({
      userId: newUser._id,
      balance: 1 + Math.floor(Math.random() * 1000),
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

    res.status(201).json({
      message: "User created successfully",
      token: token,
    });
  } catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({ message: error.message });
  }
});

const loginSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  try {
    const user = await loginSchema.safeParse(req.body);
    if (!user.success) {
      return res.status(400).json({ msg: "Invalid Data" });
    }

    const userExists = await User.findOne({
      username: user.data.username,
      password: user.data.password,
    });
    if (!userExists) {
      return res
        .status(400)
        .json({ error: "Username or Password is incorrect" });
    }
    const userId = userExists._id;

    const token = jwt.sign({ userId }, JWT_SECRET);

    res
      .status(200)
      .json({ messae: "User logged in successfully", token: token });
  } catch (error) {
    console.log("error in login controller", error);
    res.status(500).json({ message: error.message });
  }
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.put("/", protectedRoute, async (req, res) => {
  try {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        message: "Error while updating information",
      });
    }

    await User.updateOne({ _id: req.userId }, req.body);

    res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log("error in update controller", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/bulk", async (req, res) => {
  try {
    const filter = req.query.filter || "";
    const users = await User.find({
      $or: [
        {
          firstName: {
            $regex: filter,
          },
        },
        {
          lastName: {
            $regex: filter,
          },
        },
      ],
    });

    req.status(200).json({
      user: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (error) {
    console.log("error in bulk controller", error);
    res.status(500).json({ message: error.message });
  }
});

const userController = router;
export default userController;
