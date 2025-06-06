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
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//route for signup 
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = zod_1.z.object({
        username: zod_1.z.string()
            .email()
            .min(3, 'Username must be at least 3 characters long')
            .max(30)
            .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Username can only contain letters, numbers, and underscores'),
    }).parse(req.body).username;
    const password = zod_1.z.object({
        password: zod_1.z.string()
            .min(6)
            .max(20)
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;
    try {
        yield db_1.UserModel.create({
            username,
            password
        });
        res.status(200).json({
            message: 'User created successfully'
        });
    }
    catch (error) {
        res.status(403).json({
            message: 'User already exist or there is some ohter issue'
        });
    }
}));
//route for signin 
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = zod_1.z.object({
        username: zod_1.z.string()
            .email()
            .min(3, 'Username must be at least 3 characters long')
            .max(30)
            .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Username can only contain letters, numbers, and underscores'),
    }).parse(req.body).username;
    const password = zod_1.z.object({
        password: zod_1.z.string()
            .min(6)
            .max(20)
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;
    try {
        const user = yield db_1.UserModel.findOne({
            username,
            password
        });
        if (user) {
            const token = jsonwebtoken_1.default.sign({
                id: user._id
            }, process.env.JWT_SECRET);
            res.status(200).json({
                token: token
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
//content route to post the content     ===================================
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const link = req.body.link;
    db_1.ContentModel.create({
        title,
        link,
        //@ts-ignore
        userId: req.userId, // Assuming userId is set by middleware
        tags: []
    });
    res.status(200).json({
        message: 'Content created successfully'
    });
}));
//content route to get the content               ===================================
app.get('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId; // Assuming userId is set by middleware
    try {
        const contents = yield db_1.ContentModel.find({
            userId: userId
        }).populate("userId", "username");
        res.json({
            contents
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}));
//delete content route to delete the content               ===================================\\
app.delete('/api/v1/content/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    try {
        const content = yield db_1.ContentModel.deleteMany({
            contentId: contentId,
            //@ts-ignore
            userId: req.userId // Assuming userId is set by middleware});
        });
        if (content) {
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
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    });
}
//startiing rthe db and node server 
connect();
