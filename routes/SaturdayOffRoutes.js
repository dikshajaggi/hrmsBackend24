import express from "express"
import { getCustomSaturdayOverrides, getSaturdayOffs, getSaturdayRule, saveCustomSaturdayOverrides, setSaturdayRule } from "../controllers/SaturdayOffController.js";



const router = express.Router()

router.route("/").get(getSaturdayOffs)
router.route("/rule").post(setSaturdayRule).get(getSaturdayRule)
router.route("/rule/custom").post(saveCustomSaturdayOverrides).get(getCustomSaturdayOverrides)

export default router