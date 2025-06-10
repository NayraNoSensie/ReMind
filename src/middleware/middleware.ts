
import { Request, Response, NextFunction } from 'express';
import jwt , { JwtPayload } from 'jsonwebtoken';



export const userMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const headers = req.headers["authorization"];
    const decoded  = jwt.verify(headers as string, process.env.JWT_SECRET!);
    
   
     if (decoded) {
        if (typeof decoded === "string") {
            res.status(403).json({
                message: "You are not logged in"
            })
            return;    
        }
        req.userId = (decoded as JwtPayload).id;
        next()
    }
    else{
      res.status(403).json({
        message: 'You are not authorized to access this resource'
      });
    }
}
