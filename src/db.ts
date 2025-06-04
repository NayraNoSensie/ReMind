import mongoose from 'mongoose';

import { Schema } from 'mongoose';



//created schemass 
 
const UserSchema= new Schema({
    username : { type: String, required: true, unique: true },
    password  : { type: String }

})


export const UserModel = mongoose.model('User', UserSchema);