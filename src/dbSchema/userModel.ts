
import mongoose , { Schema } from 'mongoose';

const UserSchema= new Schema({
    username : { type: String, required: true, unique: true },
    password  : { type: String }

})

export const UserModel = mongoose.model('User', UserSchema);