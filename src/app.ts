import express from 'express';
import { Request, Response, NextFunction } from "express";
import { z } from 'zod'; //input validation

// Extend Express Request type
import './config/globalscope'; // to extend the express request type


import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
//environment varibales
import dotenv from 'dotenv';
dotenv.config();
import { ContentModel } from './dbSchema/contentModel'; // Importing the content model
import { UserModel } from './dbSchema/userModel'; // Importing the user model
import { LinkModel } from './dbSchema/linkModel'; // Importing the link model
import { userMiddleware } from './middleware/middleware';
import { RandomString } from './config/utils';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//route for signup  ================================================================================================================


app.post('/api/v1/signup' , async (req,res) =>{

   
  const  username = z.object({
    username: z.string()
    .email()
    .min(3, 'Username must be at least 3 characters long')
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Username can only contain letters, numbers, and underscores'),
  }).parse(req.body).username;

   const  password = z.object({
    password: z.string()
    .min(6)
    .max(20)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;

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




//route for signin ================================================================================================================




app.post('/api/v1/signin' , async (req,res) =>{
   
   const  username = z.object({
    username: z.string()
    .email()
    .min(3, 'Username must be at least 3 characters long')
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Username can only contain letters, numbers, and underscores'),
  }).parse(req.body).username;

   const  password = z.object({
    password: z.string()
    .min(6)
    .max(20)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;
    


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






//content route to post the content     ===================================================================================================================================

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



//delete content route to delete the content   ===============   ================================================================    ===================================\\


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







// cretaing a share brain content route  ================================================================================================================================


app.post('/api/v1/share/brain', userMiddleware, async (req, res) => {
     const share = req.body.share;

     if(share) { 

        const existingLink = await LinkModel.findOne({
            userId: req.userId // 
           
        });
        if (existingLink) {
             res.status(200).json({
                message: 'Share link already exists',
                shareLink: `http://localhost:3000/api/v1/share/brain/${existingLink.hash}`
            });

        const hash = RandomString(10); // Generate a random hash for the share link
        LinkModel.create({
         userId: req.userId ,// Assuming userId is set by middleware
            hash: hash 
        })
        res.json ({
            message: 'Share brain content created successfully',
            shareLink: `http://localhost:3000/api/v1/share/brain/${RandomString(10)}`
        })
     }
    }
     else{
        LinkModel.deleteOne({
            userId: req.userId
        })
        res.json({
            message: 'share lnk is removed successfully'
        })
     }
        
})




//when i shared my link to others , and it goes to link and it hits the backned and get my brain preview content ================================================================================================================================


app.get('/api/v1/share/brain/:sharelink' ,async (req: Request, res: Response) => {

const hash = req.params.sharelink;


const Link = await LinkModel.findOne({
    hash: hash
});


if (!Link) {
     res.status(404).json({
        message: 'Share link not found'
    })
}

const content = await ContentModel.find({
    userId: Link?.userId // Assuming userId is set by middleware
    })

    const user = await UserModel.findOne({
        _id: Link?.userId
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