import express from "express"

import { addDesignation, allDesignations } from "../controllers/DesignationContoller.js"

const router = express.Router()

router.route("/").post(addDesignation).get(allDesignations)

export default router