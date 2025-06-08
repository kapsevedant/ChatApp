import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32);
const iv = Buffer.alloc(16, 0); // Initialization vector

export const signAndEncryptToken = (payload) => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

export const decryptAndVerifyToken = (encryptedToken) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return jwt.verify(decrypted, JWT_SECRET); // returns the payload
}