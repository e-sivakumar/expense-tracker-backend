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
    if(!(type == "income" || type == "expense")){
      res.status(400).send(generateResponse("Type should either Income or expense", 400, "failed"))
      return
    }
    const [day, month, year] = date.split('/');
    if(!month || !day || !year){
      res.status(400).send(invalidArgumentsResponse());
      return
    }
    const newDate = new Date(Date.UTC(year, month-1, day));
    const transactionId = generateUUID();
    const transactionData = new Transaction({
      _id: transactionId,
      userId: id,
      amount,
      type,
      category,
      date: newDate.toISOString(),
      ...(description && { description }),
    });
    await transactionData.save();
    res
      .status(200)
      .send(generateResponse("Transaction added successfully", 200, "success"));
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
    const { id: transactionId } = req.params;
    const { amount, type, category, date, description } = req.body;
    if (!transactionId || !amount || !type || !category || !date) {
      res.status(400).send(invalidArgumentsResponse());
      return;
    }
    if(!(type == "income" || type == "expense")){
      res.status(400).send(generateResponse("Type should either Income or expense", 400, "failed"))
      return
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

export async function getTransactionDataForMonth(req: Request, res: Response){
  try{
    if(!req.query){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const { id } = (req as Request & { user: { id: string } }).user;
    const {month, year} = req.query;
    if(!month || !year){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const { startDate, endDate } = findStartAndEndDateForMonth(parseInt(month as string), parseInt(year as string));
    const data = await Transaction.aggregate([
      {
        $match: {
          userId: id,
          date: {$gte: startDate , $lte: endDate},
          isDeleted: false
        }
      },
      {
        $group:{
          _id: "$type",
          total: {$sum : "$amount"}
        }
      },
      {
        $project :{
        type: "$_id", 
        _id:0,
        total: 1,
        amount: "$amount",
        category: 1
      }
    }
    ]);
    let income = 0, expense = 0;
    data.map((obj)=>{
      if(obj.type === "expense"){
        expense = obj.total
      }
      else if(obj.type === "income"){
        income = obj.total
      }
    });
    res.status(200).send(generateResponse("Transaction data fetched", 200, "success", {
      income,
      expense,
      balance: income - expense
    }))
  }
  catch(err){
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse())
  }
}

export async function getTransactionsList(req: Request, res: Response){
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
    else if(!(month || (startDate && endDate)) && !year){
      res.status(400).send(generateResponse("Year is required", 400, "failed"))
      return
    }

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

    const groupBy: any = {};

    let checkFilter = 0;

    if(startDate && endDate){
      const [day1, month1, year1] = String(startDate).split('/');
      if(!month1 || !day1 || !year1){
        res.status(400).send(invalidArgumentsResponse());
        return
      }
      const updatedStartDate = new Date(Date.UTC(parseInt(year1), parseInt(month1)-1, parseInt(day1)));
      const [day2, month2, year2] = String(endDate).split('/');
      if(!month2 || !day2 || !year2){
        res.status(400).send(invalidArgumentsResponse());
        return
      }
      const updatedEndDate = new Date(Date.UTC(parseInt(year2), parseInt(month2)-1, parseInt(day2)));
      filter.date = {
        $gte: updatedStartDate,
        $lte: updatedEndDate,
      }
      groupBy._id = {date:"$date", type: "$type"}
      checkFilter++;
    }
    if(month && year){
      const { startDate, endDate } = findStartAndEndDateForMonth(parseInt(month as string), parseInt(year as string));
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      }
      groupBy._id = {date:"$date", type: "$type"}
      checkFilter++;
    }
    if(year && !month){
      const { startDate, endDate } = findStartAndEndDateForYear(parseInt(year as string));
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      }
      groupBy._id = {month:{$month:"$date"}, type: "$type"}
      checkFilter++;
    }
    if(checkFilter != 1){
      res.status(400).send(generateResponse("Should not select more than one filter", 400, "failed"))
      return
    }
    groupBy.total = {$sum : "$amount"};
    const transactionsData = await Transaction.aggregate([
      {
        $match: filter
      },
      {
        $group: groupBy
      },
      {
        $sort:{
          date: 1,
          month: 1
        }
      }
    ])
    const data = new Map();
    let globalTotal = 0;
    transactionsData.map((transaction)=>{
      const groupedKey = String(transaction._id?.month || new Date(transaction._id?.date).toISOString());
      if(data.has(groupedKey)){
        const temp = data.get(groupedKey);
        let total = temp.total;
        total = transaction._id.type == "expense" ? (total - transaction.total) : (total + transaction.total);
        globalTotal = transaction._id.type == "expense" ? (globalTotal - transaction.total) : (globalTotal + transaction.total);
        temp.transactions = [...(temp.transactions), {type: transaction._id.type, amount: transaction.total } ]
        data.set(groupedKey, {...temp, total})
      }
      else{
        let total = 0;
        total = transaction._id.type == "expense" ? (total - transaction.total) : (total + transaction.total);
        globalTotal = transaction._id.type == "expense" ? (globalTotal - transaction.total) : (globalTotal + transaction.total);
        data.set(groupedKey, {transactions: [{type: transaction._id.type, amount: transaction.total}], total})
      }
    })
    const updatedData = Object.fromEntries(data.entries());
    res.status(200).send(generateResponse("Transactions fetched successfully", 200, "success", {transactionData: updatedData, totalAmount: globalTotal}));
  }
  catch(err){
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse());
  }
}

export async function getTransactionDetail(req: Request, res: Response){
  try{
    if(!req.query){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const {date} = req.query;
    if(!date){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const { id } = (req as Request & { user: { id: string } }).user;

    const data = await Transaction.find({
      userId: id,
      date,
      isDeleted: false
    })
    .select('-userId -isDeleted -createdAt -updatedAt')
    .lean()
    .exec();

    if(!data || data.length == 0){
      res.status(400).send(generateResponse("Transaction not found", 400, "failed"))
      return
    }
    res.status(200).send(generateResponse("Transaction data fetched", 200, "success", data));
  }
  catch(err){
    console.log("err",err)
    res.status(500).send(internalServerErrorResponse())
  }
}

export async function deleteTransaction(req: Request, res: Response){
  try{
    const { id } = (req as Request & { user: { id: string } }).user;
    const { id: transactionId } = req.params;
    if(!transactionId){
      res.status(400).send(invalidArgumentsResponse())
      return
    }
    const transactionData = await Transaction.findOne({
      _id: transactionId,
      userId: id,
      isDeleted: false
    });
    if(!transactionData){
      res.status(400).send(generateResponse("Transaction not found", 400, "failed"))
      return
    }
    await Transaction.updateOne(
      {_id: transactionId},
      {
        $set:{
          isDeleted: true,
          updatedAt: new Date()
        }
      }
    )
    res.status(200).send(generateResponse("Transaction deleted successfully", 200, "success"))
  }
  catch(err){
    console.log("err", err);
    res.status(500).send(internalServerErrorResponse())
  }
}