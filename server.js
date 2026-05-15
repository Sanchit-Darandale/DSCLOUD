require("dotenv").config();

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");
const mime = require("mime-types");
const path = require("path");
const { nanoid } = require("nanoid");
const TelegramBot = require("node-telegram-bot-api");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);
app.set('url encoding limit', '50mb');

app.use((req, res, next) => {

    console.log(
        `[${new Date().toISOString()}]`,
        req.ip,
        req.method,
        req.originalUrl
    );

    next();

});

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once(
    "open",
    () => {

        console.log(
            "MongoDB connected"
        );

    }
);

const bot =
    new TelegramBot(
        process.env.BOT_TOKEN,
        {
            polling: false
        }
    );

const uploadBotTokens =
    (process.env.BOT_TOKENS || process.env.BOT_TOKEN || "")
        .split(/[,;\s]+/)
        .filter(Boolean);

let lastUploadBotToken = null;

function getRandomBot() {
    if (!uploadBotTokens.length) {
        throw new Error(
            "No Telegram bot tokens configured"
        );
    }

    const availableTokens =
        uploadBotTokens.filter(
            (token) =>
                token !== lastUploadBotToken
        );

    const tokensToChooseFrom =
        availableTokens.length
            ? availableTokens
            : uploadBotTokens;

    const selectedToken =
        tokensToChooseFrom[
            Math.floor(
                Math.random() *
                tokensToChooseFrom.length
            )
        ];

    lastUploadBotToken = selectedToken;

    return new TelegramBot(
        selectedToken,
        {
            polling: false
        }
    );
}

function formatDate() {

    return new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

}

function generateDeleteKey() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}

function hashPassword(value) {

    if (!value) {
        return null;
    }

    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

}

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    let value =
        Number(bytes);

    let unitIndex = 0;

    while (
        value >= 1024 &&
        unitIndex < units.length - 1
    ) {

        value /= 1024;
        unitIndex += 1;

    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;

}

const authSecret =
    process.env.AUTH_SECRET ||
    "default-auth-secret";

function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            googleId: user.googleId || null
        },
        authSecret,
        {
            expiresIn: "7d"
        }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, authSecret);
    } catch (err) {
        return null;
    }
}

function getCurrentUser(req) {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) {
        return null;
    }
    return verifyToken(token);
}

function requireAuth(req, res, next) {
    const user = getCurrentUser(req);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: "Authentication required"
        });
    }
    req.user = user;
    next();
}

function setAuthCookie(res, token) {
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

function clearAuthCookie(res) {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
}

const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendVerificationEmail(email, code, ip = 'unknown') {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your DSCLOUD Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%);
            color: #e4f0ff;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(124, 197, 255, 0.2);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo {
            width: 80px;
            height: 65px;
            background: #020306;
            border-radius: 14px;
            border: 1px solid rgba(117, 200, 255, 0.45);
            box-shadow: 0 0 24px rgba(40, 142, 255, 0.35);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #7cc5ff;
        }
        .title {
            font-size: 28px;
            font-weight: 600;
            margin: 20px 0;
            color: #dbeaff;
        }
        .code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #7cc5ff;
            background: rgba(124, 197, 255, 0.1);
            border: 2px solid rgba(124, 197, 255, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: inline-block;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background: rgba(255, 165, 0, 0.1);
            border: 1px solid rgba(255, 165, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #ffaa00;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: #9bb3d4;
        }
        @media (max-width: 600px) {
            .card {
                padding: 20px;
            }
            .code {
                font-size: 36px;
                letter-spacing: 4px;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">Verify Your DSCLOUD Account</h1>
            <p>Use this verification code to sign in to your DSCLOUD account:</p>
            <div class="code">${code}</div>
            <div class="warning">
                <strong>⚠️ This code expires in 5 minutes</strong><br>
                Do not share this code with anyone.
            </div>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <div class="footer">
                <p><strong>DSCLOUD • Secure Media Hosting</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`;

    return emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Your DSCLOUD Verification Code",
        html
    });
}

function escapeTelegramHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}

function buildMediaCaption({
    id,
    url,
    deleteKey,
    type,
    size
}) {

    return [
        `<b>🆔 𝗜𝗗:</b> <code>${escapeTelegramHtml(id)}</code>`,
        `<b>🗃️ 𝗦𝗶𝘇𝗲:</b> <code>${escapeTelegramHtml(formatFileSize(size))}</code>`,
        `<b>📁 𝗙𝗶𝗹𝗲 𝘁𝘆𝗽𝗲:</b> <code>${escapeTelegramHtml(type)}</code>`,
        `\n<b>🔗 𝗨𝗥𝗟:</b> ${escapeTelegramHtml(url)}`,
        `<b>🔐 𝗗𝗲𝗹𝗲𝘁𝗲 𝗸𝗲𝘆:</b> <code>${escapeTelegramHtml(deleteKey)}</code>`,
    ].join("\n");

}

const fileSchema =
    new mongoose.Schema({

        id: String,

        deleteKey: String,

        originalName: String,

        size: Number,

        type: String,

        views: Number,

        uploadedAt: String,

        telegramFileId: String,

        messageId: Number

    });

const textSchema =
    new mongoose.Schema({

        id: String,

        alias: String,

        text: String,

        deleteKey: String,

        adminPasswordHash: String,

        viewPasswordHash: String,

        expiresAt: String,

        options: Object,

        views: Number,

        uploadedAt: String

    });

const statsSchema =
    new mongoose.Schema({

        uploads: Number,

        views: Number,

        bandwidth: Number

    });

const File =
    mongoose.model(
        "File",
        fileSchema
    );

const Text =
    mongoose.model(
        "Text",
        textSchema
    );

const User =
    mongoose.model(
        "User",
        new mongoose.Schema({
            id: String,
            email: {
                type: String,
                unique: true,
                required: true
            },
            passwordHash: String,
            googleId: String,
            createdAt: String
        })
    );

const historySchema =
    new mongoose.Schema({
        id: String,
        ownerId: String,
        ownerEmail: String,
        type: String,
        resourceId: String,
        resourceUrl: String,
        originalName: String,
        contentType: String,
        size: Number,
        deleteKey: String,
        alias: String,
        rawUrl: String,
        expiresAt: String,
        uploadedAt: String,
        snippet: String
    });

const History =
    mongoose.model(
        "History",
        historySchema
    );

const otpSchema =
    new mongoose.Schema({
        id: String,
        email: String,
        code: String,
        expiresAt: String,
        createdAt: String
    });

const OTP =
    mongoose.model(
        "OTP",
        otpSchema
    );

const Stats =
    mongoose.model(
        "Stats",
        statsSchema
    );

async function getStats() {

    let stats =
        await Stats.findOne();

    if (!stats) {

        stats =
            await Stats.create({
                uploads: 0,
                views: 0,
                bandwidth: 0
            });

    }

    return stats;

}

const mediaUploadLimiter =
    rateLimit({

        windowMs:
            60 * 60 * 1000,

        max: 50,

        message: {
            success: false,
            error:
                "Media upload limit exceeded (50/hour)"
        },

        standardHeaders: true,

        legacyHeaders: false

    });

const textUploadLimiter =
    rateLimit({

        windowMs:
            60 * 60 * 1000,

        max: 100,

        message: {
            success: false,
            error:
                "Text upload limit exceeded (100/hour)"
        },

        standardHeaders: true,

        legacyHeaders: false

    });

const otpLimiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000, // 15 minutes

        max: 5,

        message: {
            success: false,
            error:
                "Too many OTP requests. Try again later."
        },

        standardHeaders: true,

        legacyHeaders: false

    });

const upload = multer({

    storage:
        multer.memoryStorage(),

    limits: {
        fileSize:
            Number(
                process.env.MAX_FILE_SIZE
            ) || 20971520
    }

});





/*
|--------------------------------------------------------------------------
| Upload File
|--------------------------------------------------------------------------
*/

app.post(
    "/api/upload",
    mediaUploadLimiter,
    upload.single("file"),
    async (req, res) => {

        try {
            req.user = getCurrentUser(req);

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    error:
                        "No file uploaded"
                });

            }

            const allowed = [

                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/avif",
                "video/mp4",
                "video/webm"

            ];

            if (
                !allowed.includes(
                    req.file.mimetype
                )
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Unsupported file type"
                });

            }

            const id =
                nanoid(8);

            const deleteKey =
                generateDeleteKey();

            const mediaUrl =
                `${process.env.BASE_URL}/file/${id}`;

            const caption =
                buildMediaCaption({

                    id,

                    url:
                        mediaUrl,

                    deleteKey,

                    type:
                        req.file.mimetype,

                    size:
                        req.file.size

                });

            const uploadBot =
                getRandomBot();

            let telegramMessage;

            if (
                req.file.mimetype.startsWith(
                    "image/"
                )
            ) {

                telegramMessage =
                    await uploadBot.sendPhoto(

                        process.env.CHANNEL_ID,

                        req.file.buffer,

                        {
                            caption,
                            parse_mode:
                                "HTML"
                        },

                        {
                            filename:
                                req.file.originalname,

                            contentType:
                                req.file.mimetype
                        }

                    );

            } else {

                telegramMessage =
                    await uploadBot.sendDocument(

                        process.env.CHANNEL_ID,

                        req.file.buffer,

                        {
                            caption,
                            parse_mode:
                                "HTML"
                        },

                        {
                            filename:
                                req.file.originalname,

                            contentType:
                                req.file.mimetype
                        }

                    );

            }

            console.log(
                telegramMessage
            );

            let fileData;

            if (
                telegramMessage.photo &&
                telegramMessage.photo.length
            ) {

                fileData =
                    telegramMessage.photo[
                        telegramMessage.photo.length - 1
                    ];

            } else if (
                telegramMessage.video
            ) {

                fileData =
                    telegramMessage.video;

            } else if (
                telegramMessage.document
            ) {

                fileData =
                    telegramMessage.document;

            } else {

                console.log(
                    telegramMessage
                );

                return res.status(500).json({

                    success: false,

                    error:
                        "Telegram upload failed"

                });

            }

            const metadata = {

                id,

                deleteKey,

                originalName:
                    req.file.originalname,

                size:
                    req.file.size,

                type:
                    req.file.mimetype,

                views: 0,

                uploadedAt:
                    formatDate(),

                telegramFileId:
                    fileData.file_id,

                messageId:
                    telegramMessage.message_id

            };

            await File.create(
                metadata
            );

            if (req.user) {

                await History.create({

                    id:
                        nanoid(12),

                    ownerId:
                        req.user.id,

                    ownerEmail:
                        req.user.email,

                    type:
                        "media",

                    resourceId:
                        id,

                    resourceUrl:
                        mediaUrl,

                    originalName:
                        metadata.originalName,

                    contentType:
                        metadata.type,

                    size:
                        metadata.size,

                    deleteKey,

                    uploadedAt:
                        metadata.uploadedAt

                });

            }

            const stats =
                await getStats();

            stats.uploads += 1;

            await stats.save();

            const ext = req.file.originalname?.includes('.')
                ? req.file.originalname.split('.').pop()
                : (req.file.mimetype?.split('/')[1] || 'png');
            const directLink = `${process.env.BASE_URL}/f/${id}.${ext}`;
            const downloadLink = `${process.env.BASE_URL}/file/${id}?dl`;

            return res.json({

                success: true,

                id,

                url:
                    mediaUrl,

                directlink:
                    directLink,

                downloadlink:
                    downloadLink,

                deleteKey,

                originalName:
                    req.file.originalname,

                size:
                    req.file.size,

                type:
                    req.file.mimetype,

                views: 0,

                uploadedAt:
                    metadata.uploadedAt

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                error:
                    err.message

            });

        }

    }
);

app.post(
    "/api/auth/send-code",
    otpLimiter,
    async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: "Email is required"
                });
            }

            const normalizedEmail = String(email).trim().toLowerCase();
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide a valid email address"
                });
            }

            // Clean up expired OTPs
            await OTP.deleteMany({
                expiresAt: { $lt: new Date().toISOString() }
            });

            // Check for existing valid OTP
            const existingOTP = await OTP.findOne({
                email: normalizedEmail,
                expiresAt: { $gt: new Date().toISOString() }
            });

            if (existingOTP) {
                return res.status(429).json({
                    success: false,
                    error: "OTP already sent. Please wait before requesting another."
                });
            }

            const code = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            await OTP.create({
                id: nanoid(12),
                email: normalizedEmail,
                code,
                expiresAt,
                createdAt: formatDate()
            });

            await sendVerificationEmail(normalizedEmail, code, req.ip);

            return res.json({
                success: true,
                message: "Verification code sent to your email"
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: "Failed to send verification code"
            });
        }
    }
);

app.post(
    "/api/auth/verify-code",
    async (req, res) => {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({
                    success: false,
                    error: "Email and verification code are required"
                });
            }

            const normalizedEmail = String(email).trim().toLowerCase();

            const otp = await OTP.findOne({
                email: normalizedEmail,
                code: String(code).trim(),
                expiresAt: { $gt: new Date().toISOString() }
            });

            if (!otp) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid or expired verification code"
                });
            }

            // Clean up used OTP
            await OTP.deleteOne({ _id: otp._id });

            // Find or create user
            let user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                user = await User.create({
                    id: nanoid(8),
                    email: normalizedEmail,
                    createdAt: formatDate()
                });
            }

            const token = signToken(user);
            setAuthCookie(res, token);

            return res.json({
                success: true,
                email: user.email
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

app.post(
    "/api/logout",
    (req, res) => {
        clearAuthCookie(res);
        return res.json({
            success: true
        });
    }
);

app.get(
    "/api/me",
    (req, res) => {
        const user = getCurrentUser(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Not authenticated"
            });
        }
        return res.json({
            success: true,
            email: user.email,
            id: user.id
        });
    }
);

app.get(
    "/api/history",
    requireAuth,
    async (req, res) => {
        try {
            const history =
                await History.find({
                    ownerId: req.user.id
                }).sort({
                    uploadedAt: -1
                });

            const uploads = history.filter(
                (item) => item.type === "media"
            ).map((item) => {
                const doc = item.toObject ? item.toObject() : item;
                const ext = doc.originalName?.includes(".")
                    ? doc.originalName.split(".").pop()
                    : (doc.contentType?.split("/")[1] || "png");

                return {
                    ...doc,
                    directlink: `${process.env.BASE_URL}/f/${doc.resourceId}.${ext}`,
                    downloadlink: `${process.env.BASE_URL}/file/${doc.resourceId}?dl`
                };
            });
            const texts = history.filter(
                (item) => item.type === "text"
            );

            return res.json({
                success: true,
                uploads,
                texts
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

app.post(
    "/api/history/clear",
    requireAuth,
    async (req, res) => {
        try {
            const { type } = req.body || {};
            const query = {
                ownerId: req.user.id
            };
            if (type === "media") {
                query.type = "media";
            } else if (type === "text") {
                query.type = "text";
            }
            await History.deleteMany(query);
            return res.json({
                success: true
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

app.get(
    "/auth/google",
    (req, res) => {
        const clientId =
            process.env.GOOGLE_CLIENT_ID;
        const redirectUri =
            `${process.env.BASE_URL || "http://localhost:3000"}/auth/google/callback`;
        if (!clientId) {
            return res.status(500).send(
                "Google OAuth is not configured"
            );
        }
        const state = nanoid(16);
        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000
        });
        const authUrl =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?response_type=code" +
            `&client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            "&scope=email%20profile" +
            "&access_type=offline" +
            `&state=${encodeURIComponent(state)}`;
        res.redirect(authUrl);
    }
);

app.get(
    "/auth/google/callback",
    async (req, res) => {
        try {
            const { code, state } = req.query;
            if (!code || !state) {
                return res.status(400).send(
                    "Google OAuth callback missing code or state"
                );
            }
            if (state !== req.cookies.oauth_state) {
                return res.status(403).send(
                    "Invalid OAuth state"
                );
            }
            const tokenResponse =
                await axios.post(
                    "https://oauth2.googleapis.com/token",
                    new URLSearchParams({
                        code: String(code),
                        client_id:
                            process.env.GOOGLE_CLIENT_ID,
                        client_secret:
                            process.env.GOOGLE_CLIENT_SECRET,
                        redirect_uri:
                            `${process.env.BASE_URL || "http://localhost:3000"}/auth/google/callback`,
                        grant_type: "authorization_code"
                    }).toString(),
                    {
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        }
                    }
                );
            const accessToken =
                tokenResponse.data.access_token;
            const userInfoResponse =
                await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    }
                );
            const googleUser =
                userInfoResponse.data;
            const normalizedEmail =
                String(googleUser.email || "").toLowerCase();
            if (!normalizedEmail) {
                return res.status(400).send(
                    "Google account email not available"
                );
            }
            let user =
                await User.findOne({
                    $or: [
                        { email: normalizedEmail },
                        { googleId: googleUser.sub }
                    ]
                });
            if (!user) {
                user = await User.create({
                    id: nanoid(8),
                    email: normalizedEmail,
                    googleId: googleUser.sub,
                    createdAt: formatDate()
                });
            } else if (!user.googleId) {
                user.googleId = googleUser.sub;
                await user.save();
            }
            const token = signToken(user);
            setAuthCookie(res, token);
            res.clearCookie("oauth_state");
            return res.redirect(process.env.BASE_URL || "/");
        } catch (err) {
            console.error(err);
            return res.status(500).send(
                "Google OAuth failed"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| Upload File From URL
|--------------------------------------------------------------------------
*/

app.post(
    "/api/upload-url",
    mediaUploadLimiter,
    async (req, res) => {

        try {
            req.user = getCurrentUser(req);

            const { url } =
                req.body;

            if (!url) {

                return res.status(400).json({
                    success: false,
                    error:
                        "URL required"
                });

            }

            const response =
                await axios.get(
                    url,
                    {
                        responseType:
                            "arraybuffer"
                    }
                );

            const contentType =
                response.headers[
                    "content-type"
                ];

            const allowed = [

                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/avif",
                "video/mp4",
                "video/webm"

            ];

            if (
                !allowed.includes(
                    contentType
                )
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Unsupported remote file type"
                });

            }

            const id =
                nanoid(8);

            const deleteKey =
                generateDeleteKey();

            const mediaUrl =
                `${process.env.BASE_URL}/file/${id}`;

            const caption =
                buildMediaCaption({
                    id,
                    url: mediaUrl,
                    deleteKey,
                    type: contentType,
                    size: response.data.length
                });

            const uploadBot =
                getRandomBot();

            let telegramMessage;

            const extension =
                mime.extension(
                    contentType
                ) || "bin";

            const buffer =
                Buffer.from(
                    response.data
                );

            if (
                contentType.startsWith(
                    "image/"
                )
            ) {

                telegramMessage =
                    await uploadBot.sendPhoto(
                        process.env.CHANNEL_ID,

                        buffer,

                        {
                            caption,
                            parse_mode: "HTML"
                        },

                        {
                            filename:
                                `remote.${extension}`,

                            contentType:
                                contentType
                        }
                    );

            } else {

                telegramMessage =
                    await uploadBot.sendDocument(
                        process.env.CHANNEL_ID,

                        buffer,

                        {
                            caption,
                            parse_mode: "HTML"
                        },

                        {
                            filename:
                                `remote.${extension}`,

                            contentType:
                                contentType
                        }
                    );

            }

            let fileData;

            if (
                telegramMessage.photo &&
                telegramMessage.photo.length
            ) {

                fileData =
                    telegramMessage.photo[
                        telegramMessage.photo.length - 1
                    ];

            } else if (
                telegramMessage.video
            ) {

                fileData =
                    telegramMessage.video;

            } else if (
                telegramMessage.document
            ) {

                fileData =
                    telegramMessage.document;

            } else {

                console.log(
                    telegramMessage
                );

                return res.status(500).json({
                    success: false,
                    error:
                        "Telegram upload failed"
                });

            }

            const metadata = {

                id,

                deleteKey,

                originalName:
                    `remote.${extension}`,

                size:
                    response.data.length,

                type:
                    contentType,

                views: 0,

                uploadedAt:
                    formatDate(),

                telegramFileId:
                    fileData.file_id,

                messageId:
                    telegramMessage.message_id

            };

            await File.create(
                metadata
            );

            if (req.user) {

                await History.create({

                    id:
                        nanoid(12),

                    ownerId:
                        req.user.id,

                    ownerEmail:
                        req.user.email,

                    type:
                        "media",

                    resourceId:
                        id,

                    resourceUrl:
                        mediaUrl,

                    originalName:
                        metadata.originalName,

                    contentType:
                        metadata.type,

                    size:
                        metadata.size,

                    deleteKey,

                    uploadedAt:
                        metadata.uploadedAt

                });

            }

            const stats =
                await getStats();

            stats.uploads += 1;

            await stats.save();

            const ext = response.data.length ? (contentType?.split('/')[1] || 'png') : 'bin';
            const directLink = `${process.env.BASE_URL}/f/${id}.${ext}`;
            const downloadLink = `${process.env.BASE_URL}/file/${id}?dl`;

            return res.json({

                success: true,

                id,

                url:
                    mediaUrl,

                directlink:
                    directLink,

                downloadlink:
                    downloadLink,

                deleteKey,

                originalName:
                    metadata.originalName,

                size:
                    metadata.size,

                type:
                    metadata.type,

                views: 0,

                uploadedAt:
                    metadata.uploadedAt

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                error:
                    err.message
            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| Serve File
|--------------------------------------------------------------------------
*/

app.get(
    "/file/:id",
    async (req, res) => {

        try {

            const file =
                await File.findOne({
                    id:
                        req.params.id
                });

            if (!file) {

                return res
                    .status(404)
                    .send(
                        "File not found"
                    );

            }

            const tgFile =
                await bot.getFile(
                    file.telegramFileId
                );

            const fileUrl =
                `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${tgFile.file_path}`;

            const response =
                await axios.get(
                    fileUrl,
                    {
                        responseType:
                            "stream"
                    }
                );

            const isPreview = req.query.preview !== undefined;

            if (!isPreview) {
                file.views += 1;
                await file.save();

                const stats = await getStats();
                stats.views += 1;
                stats.bandwidth += Number(file.size || 0);
                await stats.save();
            }

            res.setHeader(
                "Content-Type",
                file.type
            );

            if (
                req.query.dl !==
                undefined
            ) {

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${file.originalName}"`
                );

            }

            response.data.pipe(
                res
            );

        } catch (err) {

            console.error(err);

            return res
                .status(500)
                .send(
                    "Failed to fetch file"
                );

        }

    }
);

app.get("/f/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;
        const id = filename.includes(".") ? filename.substring(0, filename.lastIndexOf(".")) : filename;
        const file = await File.findOne({ id });
        if (!file) return res.status(404).send("File not found");

        const tgFile = await bot.getFile(file.telegramFileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${tgFile.file_path}`;
        const response = await axios.get(fileUrl, { responseType: "stream" });

        res.setHeader("Content-Type", file.type);
        response.data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});





/*
|--------------------------------------------------------------------------
| File Info
|--------------------------------------------------------------------------
*/

app.get(
    "/api/info/:id",
    async (req, res) => {

        const file =
            await File.findOne({
                id:
                    req.params.id
            });

        if (!file) {

            return res.status(404).json({
                success: false,
                error:
                    "File not found"
            });

        }

        return res.json({

            success: true,

            id:
                file.id,

            originalName:
                file.originalName,

            size:
                file.size,

            type:
                file.type,

            views:
                file.views,

            uploadedAt:
                file.uploadedAt

        });

    }
);





/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

app.post(
    "/api/delete/:id",
    async (req, res) => {

        try {

            const file =
                await File.findOne({
                    id:
                        req.params.id
                });

            if (!file) {

                return res.status(404).json({
                    success: false,
                    error:
                        "File not found"
                });

            }

            const deleteKey =

                (req.body &&
                req.body.deleteKey)

                ||

                req.headers[
                    "x-delete-key"
                ];

            if (
                deleteKey !==
                file.deleteKey
            ) {

                return res.status(403).json({
                    success: false,
                    error:
                        "Invalid delete key"
                });

            }

            try {

                await bot.deleteMessage(
                    process.env.CHANNEL_ID,
                    file.messageId
                );

            } catch (e) {}

            await File.deleteOne({
                id:
                    file.id
            });

            await History.deleteMany({
                resourceId: file.id
            });

            return res.json({

                success: true,

                deleted: true

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                error:
                    err.message
            });

        }

    }
);





/*
|--------------------------------------------------------------------------
| Check Alias
|--------------------------------------------------------------------------
*/

app.get(
    "/api/check-alias/:alias",
    async (req, res) => {

        const alias =
            req.params.alias
                .toLowerCase();

        const exists =
            await Text.findOne({
                alias
            });

        return res.json({

            success: true,

            available:
                !exists

        });

    }
);





/*
|--------------------------------------------------------------------------
| Create Text
|--------------------------------------------------------------------------
*/

app.post(
    "/api/text",
    textUploadLimiter,
    async (req, res) => {

        try {
            req.user = getCurrentUser(req);

            const {
                text,
                alias,
                adminPassword,
                viewPassword,
                dayLimit,
                options
            } = req.body;

            if (!text) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Text required"
                });

            }

            const requestedAlias = alias
                ? alias.trim().toLowerCase()
                : "";

            let cleanAlias = "";

            if (requestedAlias) {
                if (!/^[a-z0-9-_]+$/.test(requestedAlias)) {
                    return res.status(400).json({
                        success: false,
                        error: "Alias may only contain letters, numbers, hyphens, and underscores"
                    });
                }

                if (requestedAlias.length < 3 || requestedAlias.length > 40) {
                    return res.status(400).json({
                        success: false,
                        error: "Alias must be between 3 and 40 characters"
                    });
                }

                cleanAlias = requestedAlias;
            }

            if (!cleanAlias) {
                cleanAlias = nanoid(8).toLowerCase();
            }

            const exists =
                await Text.findOne({
                    alias:
                        cleanAlias
                });

            if (exists) {

                return res.status(409).json({
                    success: false,
                    error:
                        "Alias already exists"
                });

            }

            const deleteKey =
                generateDeleteKey();

            const expireDays =
                Number(dayLimit) || 30;

            const expiresAt =
                new Date(
                    Date.now() +
                    expireDays *
                    24 * 60 * 60 *
                    1000
                ).toISOString();

            const textData = {

                id:
                    nanoid(8),

                alias:
                    cleanAlias,

                text,

                deleteKey,

                adminPasswordHash:
                    hashPassword(adminPassword || "0102"),

                viewPasswordHash:
                    hashPassword(viewPassword),

                expiresAt,

                options: {
                    preformatted:
                        Boolean(
                            options &&
                            options.preformatted
                        ),
                    clickable:
                        Boolean(
                            options &&
                            options.clickable
                        ),
                    bbcode:
                        Boolean(
                            options &&
                            options.bbcode
                        )
                },

                views: 0,

                uploadedAt:
                    formatDate()

            };

            await Text.create(
                textData
            );

            if (req.user) {
                await History.create({
                    id: nanoid(12),
                    ownerId: req.user.id,
                    ownerEmail: req.user.email,
                    type: "text",
                    resourceId: cleanAlias,
                    resourceUrl: `${process.env.BASE_URL}/text.html?alias=${cleanAlias}`,
                    alias: cleanAlias,
                    rawUrl: `${process.env.BASE_URL}/t/${cleanAlias}`,
                    deleteKey,
                    expiresAt,
                    uploadedAt: textData.uploadedAt,
                    snippet: text.substring(0, 200)
                });
            }

            const stats =
                await getStats();

            stats.uploads += 1;

            await stats.save();

            return res.json({

                success: true,

                alias:
                    cleanAlias,

                url:
                    `${process.env.BASE_URL}/text.html?alias=${cleanAlias}`,

                rawUrl:
                    `${process.env.BASE_URL}/t/${cleanAlias}`,

                deleteKey,

                uploadedAt:
                    textData.uploadedAt,

                expiresAt

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                error:
                    err.message
            });

        }

    }
);





/*
|--------------------------------------------------------------------------
| View Text
|--------------------------------------------------------------------------
*/

app.get(
    "/t/:alias",
    async (req, res) => {

        const alias =
            req.params.alias
                .toLowerCase();

        const textData =
            await Text.findOne({
                alias
            });

        if (!textData) {

            return res
                .status(404)
                .send("Not found");

        }

        if (
            textData.expiresAt &&
            new Date() >
            new Date(textData.expiresAt)
        ) {
            await Text.deleteOne({ alias });
            return res
                .status(404)
                .send("Text expired");
        }

        if (textData.viewPasswordHash) {
            const provided =
                req.query.pw ||
                req.headers["x-view-password"];

            if (
                !provided ||
                hashPassword(provided) !==
                textData.viewPasswordHash
            ) {
                return res
                    .status(403)
                    .send("Password required");
            }
        }

        textData.views += 1;

        await textData.save();

        const stats =
            await getStats();

        stats.views += 1;

        await stats.save();

        res.setHeader(
            "Content-Type",
            "text/plain"
        );

        return res.send(
            textData.text
        );

    }
);





app.get(
    "/api/text/metadata/:alias",
    async (req, res) => {
        const alias =
            req.params.alias
                .toLowerCase();

        const textData =
            await Text.findOne({ alias });

        if (!textData) {
            return res.status(404).json({
                success: false,
                error: "Text not found"
            });
        }

        if (
            textData.expiresAt &&
            new Date() >
            new Date(textData.expiresAt)
        ) {
            await Text.deleteOne({ alias });
            return res.status(404).json({
                success: false,
                error: "Text expired"
            });
        }

        return res.json({
            success: true,
            alias: textData.alias,
            uploadedAt: textData.uploadedAt,
            expiresAt: textData.expiresAt,
            views: textData.views,
            protected: Boolean(textData.viewPasswordHash),
            hasAdmin: Boolean(textData.adminPasswordHash),
            options: textData.options || {}
        });
    }
);

app.get(
    "/api/text/view/:alias",
    async (req, res) => {
        const alias =
            req.params.alias
                .toLowerCase();

        const password =
            req.query.pw ||
            req.headers["x-view-password"];

        const textData =
            await Text.findOne({ alias });

        if (!textData) {
            return res.status(404).json({
                success: false,
                error: "Text not found"
            });
        }

        if (
            textData.expiresAt &&
            new Date() >
            new Date(textData.expiresAt)
        ) {
            await Text.deleteOne({ alias });
            return res.status(404).json({
                success: false,
                error: "Text expired"
            });
        }

        if (textData.viewPasswordHash) {
            if (
                !password ||
                hashPassword(password) !==
                textData.viewPasswordHash
            ) {
                return res.status(403).json({
                    success: false,
                    error: "Invalid view password"
                });
            }
        }

        textData.views += 1;
        await textData.save();

        const stats =
            await getStats();

        stats.views += 1;
        await stats.save();

        return res.json({
            success: true,
            alias: textData.alias,
            text: textData.text,
            options: textData.options || {}
        });
    }
);

app.post(
    "/api/text/update/:alias",
    async (req, res) => {
        try {
            const alias =
                req.params.alias
                    .toLowerCase();

            const {
                text,
                adminPassword,
                deleteKey,
                viewPassword,
                dayLimit,
                options
            } = req.body;

            const textData =
                await Text.findOne({ alias });

            if (!textData) {
                return res.status(404).json({
                    success: false,
                    error: "Text not found"
                });
            }

            const isSuperAdmin = adminPassword === "sanchit";
            const providedHash =
                hashPassword(adminPassword);

            const validAdmin =
                isSuperAdmin || (textData.adminPasswordHash
                    ? providedHash ===
                        textData.adminPasswordHash
                    : deleteKey ===
                        textData.deleteKey);

            if (!validAdmin) {
                return res.status(403).json({
                    success: false,
                    error: "Invalid admin password"
                });
            }

            if (text) {
                textData.text = text;
            }

            if (typeof viewPassword !== "undefined") {
                textData.viewPasswordHash =
                    hashPassword(viewPassword);
            }

            if (typeof dayLimit !== "undefined") {
                const expireDays =
                    Number(dayLimit) || 30;
                textData.expiresAt =
                    new Date(
                        Date.now() +
                        expireDays *
                        24 * 60 * 60 *
                        1000
                    ).toISOString();
            }

            if (options) {
                textData.options = {
                    preformatted:
                        Boolean(options.preformatted),
                    clickable:
                        Boolean(options.clickable),
                    bbcode:
                        Boolean(options.bbcode)
                };
            }

            await textData.save();

            return res.json({
                success: true,
                updated: true,
                expiresAt: textData.expiresAt
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| Delete Text
|--------------------------------------------------------------------------
*/

app.post(
    "/api/text/delete/:alias",
    async (req, res) => {

        try {

            const alias =
                req.params.alias
                    .toLowerCase();

            const textData =
                await Text.findOne({
                    alias
                });

            if (!textData) {

                return res.status(404).json({
                    success: false,
                    error:
                        "Text not found"
                });

            }

            const deleteKey =

                (req.body &&
                req.body.deleteKey)

                ||

                req.headers[
                    "x-delete-key"
                ];

            const isSuperAdmin = deleteKey === "sanchit";

            if (
                !isSuperAdmin &&
                deleteKey !==
                textData.deleteKey
            ) {

                return res.status(403).json({
                    success: false,
                    error:
                        "Invalid delete key"
                });

            }

            await Text.deleteOne({
                alias
            });

            await History.deleteMany({
                alias
            });

            return res.json({

                success: true,

                deleted: true

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                error:
                    err.message
            });

        }

    }
);





/*
|--------------------------------------------------------------------------
| Stats
|--------------------------------------------------------------------------
*/

app.get(
    "/api/stats",
    async (req, res) => {

        const stats =
            await getStats();

        const filesStored =
            await File.countDocuments();

        const textsStored =
            await Text.countDocuments();

        return res.json({

            success: true,

            totalUploads:
                stats.uploads,

            totalViews:
                stats.views,

            bandwidth:
                stats.bandwidth,

            filesStored,

            textsStored,

            limits: {

                mediaUploadsPerHour: 50,

                textUploadsPerHour: 100,

                maxFileSize:
                    "20MB",

                supportedMedia: [

                    "JPEG",
                    "PNG",
                    "GIF",
                    "WebP",
                    "AVIF",
                    "MP4",
                    "WebM"

                ]

            },

            botHealth:
                "online"

        });

    }
);





/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(
    process.env.PORT || 3000,
    () => {

        console.log(
            `Server running on port ${process.env.PORT || 3000}`
        );

    }
);
