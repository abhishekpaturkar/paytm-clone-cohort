import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const protectedRoute = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("error in protectedRoute", error);
        res.status(500).json({ message: error.message });
    }
}