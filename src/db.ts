import mongoose from 'mongoose';

import { Schema } from 'mongoose';



//created schemass 
 
const UserSchema= new Schema({
    username : { type: String, required: true, unique: true },
    password  : { type: String }

})


const ConstentSchema = new Schema({
    title: { type: String, required: true },
    link : { type: String, required: true },
    tags : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' } ],
    userId : { type: mongoose.Schema.Types.ObjectId , ref : 'User'  , required: true }

})

export const UserModel = mongoose.model('User', UserSchema);
export const ContentModel = mongoose.model('Content', ConstentSchema);