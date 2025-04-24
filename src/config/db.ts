import mongoose from "mongoose";

const mongoDbURI = process.env.MONGODB_URI || "";
console.log("mondbURI:", mongoDbURI);

export async function connectToDatabase() {
    try{
        await mongoose.connect(mongoDbURI)
        console.log("Database connected successfully");
    }
    catch(err){
        console.error("Error while connect to database:", err);
    }
}