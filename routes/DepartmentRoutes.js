import express from "express"
import { getDepartments } from "../controllers/DepartmentController.js"


const router = express.Router()

router.route("/").get(getDepartments)

export default router
