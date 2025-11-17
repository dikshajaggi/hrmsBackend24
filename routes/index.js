import express from "express"
import EmployeeMasterRoutes from "./EmployeeMasterRoutes.js"
import designationRoutes from "./DesignationRoutes.js"
import importRoutes from "./ImportRoutes.js"


const router = express.Router()

router.use("/api/emp", EmployeeMasterRoutes)
router.use("/api/designation", designationRoutes)
router.use("/api/import", importRoutes)

export default router