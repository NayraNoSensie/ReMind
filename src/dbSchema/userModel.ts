
import mongoose , { Schema } from 'mongoose';

const UserSchema= new Schema({
    name : { type: String, required: true },
    email : { type: String, required: true, unique: true },
    password  : { type: String }

})

export const UserModel = mongoose.model('User', UserSchema);