
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



export const userMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const headers = req.headers["authorization"];
    const decoded  = jwt.verify(headers as string, process.env.JWT_SECRET!);
    if(decoded){
        // @ts-ignore
        req.userId = decoded.id;
        next();
    }
    else{
      res.status(403).json({
        message: 'You are not authorized to access this resource'
      });
    }
}