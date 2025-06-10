"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod"); //input validation
// Extend Express Request type
require("./config/globalscope"); // to extend the express request type
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//environment varibales
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const contentModel_1 = require("./dbSchema/contentModel"); // Importing the content model
const userModel_1 = require("./dbSchema/userModel"); // Importing the user model
const linkModel_1 = require("./dbSchema/linkModel"); // Importing the link model
const middleware_1 = require("./middleware/middleware");
const utils_1 = require("./config/utils");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3009",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Add this before your routes
//route for signup  ================================================================================================================
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = zod_1.z.object({
            name: zod_1.z.string()
                .min(3, 'Name must be at least 3 characters long')
                .max(30)
                .regex(/^[a-zA-Z]/, 'Name can only contain letters'),
        }).parse(req.body).name;
        const email = zod_1.z.object({
            email: zod_1.z.string()
                .email()
                .min(3, 'Email must be at least 3 characters long')
                .max(30)
                .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Invalid email format'),
        }).parse(req.body).email;
        const password = zod_1.z.object({
            password: zod_1.z.string()
                .min(6)
                .max(20)
                .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
        }).parse(req.body).password;
        //  Check if user already exists
        //checking is email already exist or not 
        const checkEmail = yield userModel_1.UserModel.findOne({
            email: email
        });
        if (checkEmail) {
            res.status(409).json({ message: 'User with this email already exists' });
            return;
        }
        // ✅ Create new user
        yield userModel_1.UserModel.create({
            name: name,
            email: email,
            password: password
        });
        res.status(201).json({ message: 'User created successfully' });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            console.log("Something went wrong while receving data", err.message);
        }
        else {
            console.log("Something went wrong while receving data", err);
        }
        res.status(500).send({
            message: "Something went wrong while receving data"
        });
        return;
    }
}));
//route for signin ================================================================================================================
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = zod_1.z.object({
        email: zod_1.z.string()
            .min(3, 'email must be at least 3 characters long')
            .max(30)
            .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'email can only contain letters, numbers, and underscores'),
    }).parse(req.body).email;
    const password = zod_1.z.object({
        password: zod_1.z.string()
            .min(6)
            .max(20)
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;
    try {
        const user = yield userModel_1.UserModel.findOne({
            email,
            password
        });
        if (user) {
            const token = jsonwebtoken_1.default.sign({
                id: user._id
            }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({
                token: token,
                userId: user._id // Adding userId to response
            });
        }
        else {
            res.status(403).json({
                message: 'Invalid credentials'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}));
//content route to post the content     ===================================================================================================================================
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const title = req.body.title;
    const link = req.body.link;
    const description = req.body.description;
    const tags = req.body.tags;
    contentModel_1.ContentModel.create({
        type: type,
        title: title,
        link: link,
        description: description,
        tags: tags,
        //@ts-ignore
        userId: req.userId, // Assuming userId is set by middleware
    });
    res.status(200).json({
        message: 'Content created successfully'
    });
}));
//content route to get the content               ===================================
app.get('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    /* `const userId = req.userId;` is extracting the `userId` from the `req` object. In this code
    snippet, it is assumed that the `userId` is set by middleware before reaching the route handler.
    This extracted `userId` can then be used within the route handler to perform operations specific
    to the user associated with that `userId`, such as fetching content belonging to that user or
    performing user-specific actions. */
    const userId = req.userId; // Assuming userId is set by middleware
    try {
        const contents = yield contentModel_1.ContentModel.find({
            userId: userId
        });
        res.json({
            contents: contents
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}));
//delete content route to delete the content   ===============   ================================================================    ===================================\\
app.delete('/api/v1/content/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.params.id; // Get ID from URL parameters instead of body
    try {
        const content = yield contentModel_1.ContentModel.deleteOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });
        if (content.deletedCount > 0) {
            res.status(200).json({
                message: 'Content deleted successfully'
            });
        }
        else {
            res.status(404).json({
                message: 'Content not found'
            });
        }
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}));
// cretaing a share brain content route  ================================================================================================================================
app.post('/api/v1/share/brain', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield linkModel_1.LinkModel.findOne({
            userId: req.userId // 
        });
        if (existingLink) {
            res.status(200).json({
                hash: existingLink.hash
            });
            const hash = (0, utils_1.RandomString)(10); // Generate a random hash for the share link
            linkModel_1.LinkModel.create({
                userId: req.userId, // Assuming userId is set by middleware
                hash: hash
            });
            res.json({
                hash: hash
            });
        }
    }
    else {
        linkModel_1.LinkModel.deleteOne({
            userId: req.userId
        });
        res.json({
            message: 'share lnk is removed successfully'
        });
    }
}));
//when i shared my link to others , and it goes to link and it hits the backned and get my brain preview content ================================================================================================================================
app.get('/api/v1/share/brain/:sharelink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.sharelink;
    try {
        const Link = yield linkModel_1.LinkModel.findOne({
            hash: hash
        });
        if (!Link) {
            res.status(404).json({
                message: 'Share link not found'
            });
        }
        const content = yield contentModel_1.ContentModel.find({
            userId: Link === null || Link === void 0 ? void 0 : Link.userId // Assuming userId is set by middleware
        });
        const user = yield userModel_1.UserModel.findOne({
            _id: Link === null || Link === void 0 ? void 0 : Link.userId
        });
    }
    catch (e) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}));
//function to connect he database and start the server 
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = process.env.MONGO_URI;
        yield mongoose_1.default.connect(uri); // Remove the quotes
        console.log('Connected to db');
        app.listen(8080, () => {
            console.log('Server is running on port 8080');
        });
    });
}
//startiing rthe db and node server 
connect();
