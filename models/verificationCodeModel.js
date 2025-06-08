import mongoose  from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '5m' } // Automatically delete after 5 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCodeModel = mongoose.model("VerificationCodeModel",verificationCodeSchema)