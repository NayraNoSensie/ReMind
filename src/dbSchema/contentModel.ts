import mongoose, { Schema } from 'mongoose';



const ConstentSchema = new Schema({
    title: { type: String, required: true },
    type : { type: String, enum: ['Document', 'Youtube', 'Tweet', 'Links'], required: true },
    link : { type: String, required: true },
    description : { type: String, required: true }, 
    tags : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' } ],
    userId : { type: mongoose.Schema.Types.ObjectId , ref : 'User'  , required: true }

})


export const ContentModel = mongoose.model('Content', ConstentSchema);