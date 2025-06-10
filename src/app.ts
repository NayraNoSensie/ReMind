import express from 'express';
import { Request, Response, NextFunction } from "express";
import { z } from 'zod'; //input validation

// Extend Express Request type
import './config/globalscope'; // to extend the express request type

import cors from 'cors';
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
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: ["http://localhost:3009", "https://remind-rust.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Add this before your routes

//route for signup  ================================================================================================================

app.post('/api/v1/signup',  async (req, res) => {
  try {
    const name = z.object({
      name: z.string()
        .min(3, 'Name must be at least 3 characters long')
        .max(30)
        .regex(/^[a-zA-Z]/, 'Name can only contain letters'),
    }).parse(req.body).name;

    const email = z.object({
      email: z.string()
        .email()
        .min(3, 'Email must be at least 3 characters long')
        .max(30)
        .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Invalid email format'),
    }).parse(req.body).email;

    const password = z.object({
      password: z.string()
        .min(6)
        .max(20)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    }).parse(req.body).password;

    //  Check if user already exists
   //checking is email already exist or not 
  const checkEmail =await UserModel.findOne({
    email: email
  })
  if(checkEmail){
     res.status(409).json({ message: 'User with this email already exists' });
    return;
  }

    // ✅ Create new user
    await UserModel.create({ 
        name : name, 
        email : email,
         password : password  });

     res.status(201).json({ message: 'User created successfully' });

     return;

  } catch(err: unknown){
    if (err instanceof Error) {
      console.log("Something went wrong while receving data", err.message);
    } else {
      console.log("Something went wrong while receving data", err);
    }
    res.status(500).send({
      message : "Something went wrong while receving data"
    })
    return;
  }
});

//route for signin ================================================================================================================

app.post('/api/v1/signin' , async (req,res) =>{
   
   const  email = z.object({
    email: z.string()
    .min(3, 'email must be at least 3 characters long')
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'email can only contain letters, numbers, and underscores'),
  }).parse(req.body).email;

   const  password = z.object({
    password: z.string()
    .min(6)
    .max(20)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).parse(req.body).password;
    


     try {
        const user = await UserModel.findOne({
            email,
            password
        })
    
        if(user){
            const token = jwt.sign({
                id: user._id
            }, process.env.JWT_SECRET! , { expiresIn: '1h' });

            res.status(200).json({
               
                token: token,
                userId: user._id // Adding userId to response
                
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
    const type = req.body.type;
    const title = req.body.title;
    const link = req.body.link;
    const description = req.body.description;
    const tags = req.body.tags;



    ContentModel.create({
        type  : type,
        title : title,
         link : link , 
        description : description,
        tags : tags,


        
        //@ts-ignore
        userId: req.userId ,// Assuming userId is set by middleware
        
    })

    res.status(200).json({
        message: 'Content created successfully'
    })

})

//content route to get the content               ===================================

app.get('/api/v1/content', userMiddleware , async (req, res) => {
    //@ts-ignore
    /* `const userId = req.userId;` is extracting the `userId` from the `req` object. In this code
    snippet, it is assumed that the `userId` is set by middleware before reaching the route handler.
    This extracted `userId` can then be used within the route handler to perform operations specific
    to the user associated with that `userId`, such as fetching content belonging to that user or
    performing user-specific actions. */
    const userId = req.userId; // Assuming userId is set by middleware
   try {
     const contents = await ContentModel.find({ 
         userId : userId
      })
 
   res.json({
            contents : contents
     })
   } catch (error) {
         res.status(500).json({
              message: 'Internal server error'
         })
    
   }
   
})

//delete content route to delete the content   ===============   ================================================================    ===================================\\

app.delete('/api/v1/content/:id', userMiddleware, async (req, res) => {
    const contentId = req.params.id; // Get ID from URL parameters instead of body

    try {
        const content = await ContentModel.deleteOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });

        if (content.deletedCount > 0) {
            res.status(200).json({
                message: 'Content deleted successfully'
            });
        } else {
            res.status(404).json({
                message: 'Content not found'
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// cretaing a share brain content route  ================================================================================================================================

app.post('/api/v1/share/brain', userMiddleware, async (req, res) => {
     const share = req.body.share;

     if(share) { 

        const existingLink = await LinkModel.findOne({
            userId: req.userId // 
           
        });
        if (existingLink) {
             res.status(200).json({
               hash: existingLink.hash
            });

        const hash = RandomString(10); // Generate a random hash for the share link
        LinkModel.create({
         userId: req.userId ,// Assuming userId is set by middleware
            hash: hash 
        })
        res.json ({
            hash : hash
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

try{

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

    }catch(e){
        
        res.status(500).json({
            message: 'Internal server error'
        })
    }
})

// Add root route handler
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Remind API' });
});

//function to connect he database and start the server 
async function connect() {
    
 const uri = process.env.MONGO_URI!;
    await mongoose.connect(uri); // Remove the quotes
    console.log('Connected to db');

    app.listen(8080, () => {
        console.log('Server is running on port 8080');}
    );

}
//startiing rthe db and node server 
connect();

// Update the server start section at the bottom of the file
const PORT = process.env.PORT ;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();