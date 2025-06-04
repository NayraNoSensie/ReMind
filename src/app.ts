import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { UserModel } from './db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.post('/api/v1/signup' , async (req,res) =>{
  const  username = req.body.username;
   const  password = req.body.password;


   await UserModel.create({
    username,
    password
   })

  res.json({
    message: 'User created successfully'
  })

})







//function to connect he database and start the server 
async function connect() {
    
 const uri = process.env.MONGO_URI!;
    await mongoose.connect(uri); // Remove the quotes
    console.log('Connected to db');

    app.listen(3000, () => {
        console.log('Server is running on port 3000');}
    );

}
//startiing rthe db and node server 
connect();