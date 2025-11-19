import express from "express"
import { getHolidays } from "../controllers/HolidayLeaveController.js"


const router = express.Router()

router.route("/").get(getHolidays)

export default router