import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

dotenv.config();

import { connectToDatabase } from './config/db';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { transactionRoutes } from './routes/transactionRoutes';

const swaggerFile = fs.readFileSync('./src/config/swaggerDocument.yaml', 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/transaction', transactionRoutes)

app.use('/test',(req, res)=>{
    console.log("Request received:", req.method, req.url);
    res.send("App is working fine");
})


app.listen(port, async()=>{
    console.log("server listening to port:", port);
    await connectToDatabase();
})