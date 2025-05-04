import express from 'express';
import { validateUser } from '../middlewares/userValidation';
import { createTransaction, getTransactionDataForMonth, getTransactionsList, updateTransaction } from '../controllers/transactionController';

export const transactionRoutes = express.Router();

transactionRoutes.post("/create", validateUser, createTransaction);
transactionRoutes.put("/update", validateUser, updateTransaction);
transactionRoutes.get("/overview", validateUser, getTransactionDataForMonth)
transactionRoutes.get("/list", validateUser, getTransactionsList)