import express from "express"
import { getProjectSites } from "../controllers/ProjectSiteController.js"


const router = express.Router()

router.route("/").get(getProjectSites)

export default router