"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
//created schemass 
const UserSchema = new mongoose_2.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String }
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
