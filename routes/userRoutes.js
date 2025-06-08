import express from "express";
import {
    register,
    loginController,
    verifyLoginController,
    getOtherUsers,
    updateProfile, getProfile
} from "../controllers/userController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register)
router.route("/login").post(loginController)
router.route("/verify-code").post(verifyLoginController)
router.route("/").get(isAuthenticated,getOtherUsers)
router.route('/getProfile').get(isAuthenticated,getProfile)
router.route('/updateProfile').post(isAuthenticated,updateProfile)

export default router;