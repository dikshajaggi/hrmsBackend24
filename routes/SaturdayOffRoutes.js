import express from "express"
import { getSaturdayOffs, setSaturdayRule } from "../controllers/SaturdayOffController.js";



const router = express.Router()

router.route("/").get(getSaturdayOffs)
router.route("/rule").post(setSaturdayRule);


export default router