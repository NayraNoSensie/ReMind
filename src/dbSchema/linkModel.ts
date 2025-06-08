
import mongoose, { Schema } from 'mongoose';



const LinkSchema = new Schema({
 hash : {type : String, required: true, unique: true },
  userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})


export const LinkModel = mongoose.model('Link' , LinkSchema);