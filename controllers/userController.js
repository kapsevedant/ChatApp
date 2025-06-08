import {User} from "./../models/userModel.js"
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import {generateVerificationCode,sendVerificationEmail} from './../utils/emailService.js'
import {storeVerificationCode,verifyCode} from './../utils/verificationStore.js'
import {signAndEncryptToken} from './../utils/jwt.js'

export const register = async (req,res) => {
    try{
        const {fullName,username,email,password,confirmPassword,gender,profilePhoto} = req.body;
        if(!fullName || !username || !email || !password || !confirmPassword || !gender){
            return res.status(400).json({
                success:false,
                message:"Please fill the required fields"
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Confirm password does not match"
            })
        }

        const user = await User.findOne({username});

        if(user){
            return res.status(400).json({
                success:false,
                message:"username already exists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            fullName,
            username,
            email,
            password:hashedPassword,
            gender,
            profilePhoto
        })

        return res.status(200).json({
            success:true,
            message:"User registered successfully"
        })
    }catch (error){
        console.log("error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate and send verification code
        const verificationCode = generateVerificationCode();
        await storeVerificationCode(email, verificationCode);

        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email",
            email: email
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const verifyLoginController = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required"
            });
        }

        // Verify the code
        const isCodeValid = await verifyCode(email, verificationCode);
        if (!isCodeValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        // Get user details
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Generate token
        const encryptedToken = signAndEncryptToken({ userId: user._id });

        return res.status(200).json({
            success:true,
            message:"Logged in successfully",
            data: {
                _id:user._id,
                username:user.username,
                fullName:user.fullName,
                profilePhoto:user.profilePhoto,
                token:encryptedToken
            }
        })

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        console.log()
        const loggedInUserId = req.id; // or req.user.id depending on your auth setup

        if(!loggedInUserId) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const profile = await User.findById(loggedInUserId).select('-password'); // Exclude sensitive data

        if(!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Details fetched successfully",
            data: profile
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const updateProfile = async (req,res) => {
    try {
        const loggedInUserId = req.id;
        const { fullName, username, profilePhoto, gender } = req.body;

        // Validate required fields if needed
        if (!fullName) {
            return res.status(400).json({success:false,message:"fullName is required"});
        }

        if (!username) {
            return res.status(400).json({success:false,message:"username is required"});
        }

        if(!gender){
            return res.status(400).json({ error: "fullName and username are required" });
        }
        // Update user document
        const updatedUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { fullName, username, profilePhoto, gender },
            { new: true, runValidators: true } // return updated doc & validate fields
        );

        if (!updatedUser) {
            return res.status(404).json({ success:false,message: "User not found" });
        }

        return res.status(200).json({ status:true,message: "Profile updated successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;

        const userData = await User.findById(loggedInUserId).select("-password");
        // Correct way to create ObjectId in Mongoose v6+
        const otherUsers = await User.find({
            _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) }
        }).select("-password");

        return res.status(200).json({
            status:true,
            userData,
            otherUsers
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

