import { Request, Response } from 'express';
import express = require('express')
import {DocsModel, IDocs } from '../models/model';
import * as dotenv from 'dotenv'

const router = express.Router();
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET
if(!JWT_SECRET){
  console.error("JWT SECRET WAS MISSING")
  process.exit(1);
}
// Insert Into Db
router.post('/', async (req: Request, res: Response) => {
  try {
    const docs: IDocs = new DocsModel(req.body);
    if(!docs.filename || !docs.extractedText || !docs.email){
      console.error("All the requirements Not available")
      return;
    }
    await docs.save();
    return res.status(201).json({success:"Data Inserted Successfully"});
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});
export default router;
