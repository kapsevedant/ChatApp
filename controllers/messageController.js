import {Conversation} from "../models/conversationModel.js";
import {Message} from './../models/messageModel.js'
import mongoose  from "mongoose";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }

        await gotConversation.save();

        return res.status(201).json({
            status: true,
            message: "Message sent successfully",
            data: {
                _id: newMessage._id,
                senderId: newMessage.senderId,
                receiverId: newMessage.receiverId,
                message: newMessage.message,
                createdAt: newMessage.createdAt  // ✅ send createdAt time
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getMessage = async (req, res) => {
    try {
        const receiverId = req.params.id; // ✅ correct way
        const senderId = req.id; // assuming this is set by isAuthenticated middleware

        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);

        const conversation = await Conversation.findOne({
            participants: {
                $all: [
                    new mongoose.Types.ObjectId(senderId),
                    new mongoose.Types.ObjectId(receiverId)
                ]
            }
        }).populate("messages");

        if (conversation == null) {
            return res.status(200).json({ message: "No conversation found" });
        }

        return res.status(200).json(conversation.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

