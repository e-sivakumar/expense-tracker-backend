import { Request, Response } from "express";
import { User } from "../models/userModel";
import { generateResponse, internalServerErrorResponse, invalidArgumentsResponse } from "../utils/responseGenerator";
import { hashPassword, verifyPassword } from "../services/bcrypt";
import { generateUUID } from "../services/UUID";
import { generateAccessToken } from "../services/JWT";


export async function createUser(req: Request, res: Response){
    try{
        if(!req.body){
            res.status(400).send(invalidArgumentsResponse())
            return
        }
        const {firstName, lastName, email, password} = req.body;
        if(!firstName || !lastName || !email || !password){
            res.status(400).send(invalidArgumentsResponse())
            return
        }
        const existingUser = await User.findOne({email, isDeleted: false});
        if(existingUser){
            res.status(400).send(generateResponse("User already exists", 400, "failed"))
            return
        }
        const userId = generateUUID();
        const hashedPassword = await hashPassword(password);
        const userData = new User({
            _id: userId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            categories: []
        });
        await userData.save();
        const { password: _, ...user} = req.body;
        const accessToken = generateAccessToken({id: userData._id});
        res.status(200).send(generateResponse("User created successfully", 200, "success", {...user, _id: userId, accessToken}))
    }
    catch(err){
        console.log("err", err)
        res.status(500).send(internalServerErrorResponse());
    }
}

export async function login(req: Request, res: Response){
    try{
        if(!req.body){
            res.status(400).send(invalidArgumentsResponse());
            return
        }
        const { email, password } = req.body;
        console.log("login request:", email, password);
        if(!email || !password){
            res.status(400).send(invalidArgumentsResponse())
            return
        }
        const userData = await User.findOne({email: email, isDeleted: false}, {_id: 1, password: 1, firstName:1, lastName: 1, email: 1});
        if(!userData){
            res.status(400).send(generateResponse("Invalid credentials", 400, "failed"))
            return
        }
        const isPasswordMatched = await verifyPassword(userData.password || "", password);
        if(!isPasswordMatched){
            res.status(400).send(generateResponse("Invalid credentials", 400, "failed"))
            return
        }
        const accessToken = generateAccessToken({id: userData._id});
        res.status(200).send(generateResponse("Login successful", 200, "success", {accessToken}))
    }
    catch(err){
        res.status(500).send(internalServerErrorResponse());
    }
}

export async function resetPassword(req: Request, res: Response){
    try{
        const {id} = (req as Request & {user:{id: string}}).user;
        if(!req.body){
            res.status(400).send(invalidArgumentsResponse())
            return
        }
        const { oldPassword, newPassword } = req.body;
        if(!oldPassword || !newPassword){
            res.status(400).send(invalidArgumentsResponse())
            return
        }
        const userData = await User.findOne({_id: id, isDeleted: false}, {password: 1});
        if(!userData){
            res.status(400).send(generateResponse("Invalid credentials", 400, "failed"))
            return
        }
        const isPasswordMatched = await verifyPassword(userData.password || "", oldPassword);
        if(!isPasswordMatched){
            res.status(400).send(generateResponse("Invalid old Password", 400, "failed"))
            return
        }
        const hashedPassword = await hashPassword(newPassword);
        await User.updateOne({_id: id}, {password: hashedPassword, updatedAt: new Date()});
        res.status(200).send(generateResponse("Password changed successfully", 200, "success"))
    }
    catch(err){
        res.status(500).send(internalServerErrorResponse())
    }
}
