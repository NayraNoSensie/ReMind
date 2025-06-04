import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { ContentModel, UserModel } from './db';
import { userMiddleware } from './middleware';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//route for signup 
app.post('/api/v1/signup' , async (req,res) =>{
  const  username = req.body.username;
   const  password = req.body.password;

try {

   await UserModel.create({
    username,
    password
   })

  res.status(200).json({
    message: 'User created successfully'
  })
    
} catch (error) {
    res.status(403).json({
        message: 'User already exist or there is some ohter issue'
    })
    
}

})






//route for signin 
app.post('/api/v1/signin' , async (req,res) =>{
    const  username = req.body.username;
     const  password = req.body.password;
    
     try {
        const user = await UserModel.findOne({
            username,
            password
        })
    
        if(user){
            const token = jwt.sign({
                id: user._id
            }, process.env.JWT_SECRET!)

            res.status(200).json({
               
                token: token
            })
            
        }else{
            res.status(403).json({
                message: 'Invalid credentials'
            })
        }
        
     } catch (error) {
         res.status(500).json({
             message: 'Internal server error'
         })
     }

})






//content route to post the content     ===================================

app.post ('/api/v1/content', userMiddleware, async (req, res) => {
    const title = req.body.title;
    const link = req.body.link;


    ContentModel.create({
        title,
        link,
        
        //@ts-ignore
        userId: req.userId ,// Assuming userId is set by middleware
        tags : []
    })

    res.status(200).json({
        message: 'Content created successfully'
    })

})









//content route to get the content               ===================================

app.get('/api/v1/content', userMiddleware , async (req, res) => {
    //@ts-ignore
    const userId = req.userId; // Assuming userId is set by middleware
   try {
     const contents = await ContentModel.find({ 
         userId : userId
      }).populate("userId", "username");
 
   res.json({
            contents
     })
   } catch (error) {
         res.status(500).json({
              message: 'Internal server error'
         })
    
   }
   
})



//delete content route to delete the content               ===================================\\


app.delete('/api/v1/content/:id', userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    try {
        const content = await ContentModel.deleteMany({
            contentId: contentId,
            //@ts-ignore

            userId: req.userId // Assuming userId is set by middleware});
        })
        if (content) {
            res.status(200).json({
                message: 'Content deleted successfully'
            });
        } else {
            res.status(404).json({
                message: 'Content not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }


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