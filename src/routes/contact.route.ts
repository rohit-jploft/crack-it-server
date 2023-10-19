import express, { Router } from "express";

import { createContactLead, getAllContactUs } from "../controllers/Contact/contact.controller";


const router: Router = express.Router();

router.post("/create",  createContactLead);
router.get("/get/all",  getAllContactUs);


export default router;
