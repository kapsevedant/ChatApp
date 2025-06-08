import {VerificationCodeModel} from './../models/verificationCodeModel.js'

export const storeVerificationCode = async (email, code) => {
    // Remove any existing codes for this email
    await VerificationCodeModel.deleteMany({ email });

    // Create new verification code with 5 minute expiration
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes from now
    await VerificationCodeModel.create({ email, code, expiresAt });
}

export const verifyCode = async (email, code) => {
    // Find and delete the code in one operation
    const result = await VerificationCodeModel.findOneAndDelete({
        email,
        code,
        expiresAt: { $gt: new Date() } // Only if not expired
    });

    return !!result; // Returns true if code was found and valid
}
