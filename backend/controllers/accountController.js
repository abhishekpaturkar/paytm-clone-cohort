import express from "express";
import Account from "../models/accountModel.js";
import { protectedRoute } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/balance", protectedRoute, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.log("error in account controller", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/transfer", protectedRoute, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { amount, receiverId } = req.body;
    const account = await Account.findOne({ userId: req.userId }).session(
      session
    );

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const toAccount = await Account.findOne({ userId: receiverId }).session(
      session
    );

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid Account" });
    }

    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: receiverId },
      { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    console.log("error in transfer controller", error);
    res.status(500).json({ message: error.message });
  }
});

const accountController = router;
export default accountController;
