import { Request, Response } from "express";
import {
  generateResponse,
  internalServerErrorResponse,
  invalidArgumentsResponse,
} from "../utils/responseGenerator";
import { Transaction } from "../models/transactionModel";
import { generateUUID } from "../services/UUID";
import { findStartAndEndDateForMonth, findStartAndEndDateForYear } from "../utils/dateCalculations";

export async function createTransaction(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const { id } = (req as Request & { user: { id: string } }).user;
    const { amount, type, category, date, description } = req.body;
    if (!amount || !type || !category || !date) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const transactionId = generateUUID();
    const transactionData = new Transaction({
      _id: transactionId,
      userId: id,
      amount,
      type,
      category,
      date,
      ...(description && { description }),
    });
    await transactionData.save();
    res
      .status(200)
      .send({ message: "Transaction addedd successfully", status: 200 });
  } catch (err) {
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}

export async function updateTransaction(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const { id } = (req as Request & { user: { id: string } }).user;
    const { transactionId } = req.params;
    const { amount, type, category, date, description } = req.body;
    if (!transactionId || !amount || !type || !category || !date) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    const transactionData = await Transaction.findOne({
      _id: transactionId,
      userId: id,
      isDeleted: false,
    });
    if (!transactionData) {
      res
        .status(400)
        .send(generateResponse("Transaction not found", 400, "failed"));
      return;
    }
    await Transaction.updateOne(
      { _id: transactionId },
      {
        $set: {
          amount,
          type,
          category,
          date,
          ...(description && { description }),
          updatedAt: new Date(),
        },
      }
    );
    res.status(200).send(generateResponse("Transaction updated successfully", 200, "success"));
  } catch (err) {
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}

export async function getTransactions(req: Request, res: Response){
  try{
    const { id } = (req as Request & { user: { id: string } }).user;
    if(!req.query){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const { type, category, month, year, startDate, endDate } = req.query;
    if(!type || !category){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    if(month && !year){
      res.status(400).send(generateResponse("Year is required when month is provided", 400, "failed"))
      return
    }
    else if((startDate && !endDate) || (!startDate && endDate)){
      res.status(400).send(generateResponse("Start date or end date is missing", 400, "failed"))
      return
    }
    else if(!year){
      res.status(400).send(generateResponse("Year is required", 400, "failed"))
      return
    }
    
    // const pageNumber = parseInt(page as string) || 1;
    // const limitNumber = parseInt(limit as string) || 10;
    // const skip = (pageNumber - 1) * limitNumber;
    const filter: any = {
      userId: id,
      isDeleted: false,
    };
    if(!(type === "all")){
      filter.type = type
    }
    if(!(category === "all")){
      filter.category = category
    }
    if(startDate && endDate){
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    }
    if(month && year){
      const { startDate, endDate } = findStartAndEndDateForMonth(parseInt(month as string), parseInt(year as string));
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }
    if(year && !month){
      const { startDate, endDate } = findStartAndEndDateForYear(parseInt(year as string));
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }
    
    const transactionsData = await Transaction.find(filter).sort({date: -1})
    // .skip(skip).limit(limitNumber);
    res.status(200).send(generateResponse("Transactions fetched successfully", 200, "success", transactionsData));
  }
  catch(err){
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}