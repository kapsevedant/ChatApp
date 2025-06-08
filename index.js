import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors"
import cookieParser from 'cookie-parser'
import messageRoutes from "./routes/messageRoutes.js";
import { app, server, getOnlineUsers } from './socket/socket.js';

dotenv.config({})

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.get('',(req,res)=>{
    res.send(`<h1>Welcome to chat app</h1>`)
})
// ✅ Corrected route path
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/message", messageRoutes)

// Optional: Add endpoint to get online users
app.get("/api/v1/online-users", (req, res) => {
    try {
        const onlineUsers = getOnlineUsers();
        res.json({
            success: true,
            onlineUsers: onlineUsers,
            count: onlineUsers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching online users"
        });
    }
});

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    connectDb();
    console.log(`🚀 Server running with socket on http://localhost:${PORT}`);
});