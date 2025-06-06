"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
//created schemass 
const UserSchema = new mongoose_2.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String }
});
const ConstentSchema = new mongoose_2.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    tags: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true }
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
exports.ContentModel = mongoose_1.default.model('Content', ConstentSchema);
