import {decryptAndVerifyToken} from "../utils/jwt.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: false,
                message: 'User not authenticated'
            });
        }

        const encryptedToken = authHeader.split(' ')[1];

        const token = decryptAndVerifyToken(encryptedToken); // Your custom function

        if (!token) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }

        req.id = token.userId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};


export default isAuthenticated;