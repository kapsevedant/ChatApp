import mongoose  from "mongoose";

const userModel = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true
    },
    profilePhoto:{
        type:String,
        default:"https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg"
    },
    gender:{
        type:String,
        enum:["male","female","other"],
        required:true
    }
},{timestamps:true})

export const User = mongoose.model("User",userModel)