import { NextFunction, Request, Response } from "express";
import { generateResponse } from "../utils/responseGenerator";
import { verifyAccessToken } from "../services/JWT";

export function validateUser(req: Request, res: Response, next: NextFunction){
    try{
        const token = req.headers["authorization"] as string;
        if(!token){
            res.status(401).send(generateResponse("Unauthorized user", 401, "failed"))
            return
        }
        if(token.startsWith("Bearer ")){
            const accessToken = token.split(" ")[1];
            const data = verifyAccessToken(accessToken);
            if(!data){
                res.status(403).send(generateResponse("User forbidden", 403, "failed"))
                return
            }
            const userId = (data as {id: string}).id;
            (req as Request & {user:{}}).user = {id: userId}
            next()
        }
        else{
            res.status(401).send(generateResponse("Unauthorized user", 401, "failed"))
        }
    }
    catch(err){
        res.status(403).send(generateResponse("Invalid user", 403, "failed"))
    }
}

