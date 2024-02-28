import express from "express";
import userController from "../controllers/userController.js";
import accountController from "../controllers/accountController.js";

const router = express.Router();

router.use("/user", userController);
router.use("/account", accountController);
export default router;
