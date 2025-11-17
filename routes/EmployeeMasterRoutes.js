import express from "express"
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../controllers/EmployeeMasterController.js"

const router = express.Router()

router.route("/").post(createEmployee).get(getEmployees)
router.route("/:id").put(updateEmployee).delete(deleteEmployee)

export default router