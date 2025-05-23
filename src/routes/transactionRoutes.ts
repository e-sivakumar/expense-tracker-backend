import express from 'express';
import { validateUser } from '../middlewares/userValidation';
import { createTransaction, deleteTransaction, getTransactionDataForMonth, getTransactionDetail, getTransactionsList, updateTransaction } from '../controllers/transactionController';

export const transactionRoutes = express.Router();

transactionRoutes.post("/create", validateUser, createTransaction);
transactionRoutes.put("/update", validateUser, updateTransaction);
transactionRoutes.get("/overview", validateUser, getTransactionDataForMonth)
transactionRoutes.get("/list", validateUser, getTransactionsList)
transactionRoutes.get("/detail", validateUser, getTransactionDetail)
transactionRoutes.delete("/:id", validateUser, deleteTransaction)