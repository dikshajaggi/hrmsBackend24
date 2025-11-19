import express from "express"
import { getBranches } from "../controllers/BranchController.js"


const router = express.Router()

router.route("/").get(getBranches)

export default router