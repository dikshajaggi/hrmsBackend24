import express from "express"
import EmployeeMasterRoutes from "./EmployeeMasterRoutes.js"
import designationRoutes from "./DesignationRoutes.js"
import departmentRoutes from "./DepartmentRoutes.js"
import importRoutes from "./ImportRoutes.js"
import branchRoutes from "./BranchRoutes.js"
import projectSiteRoutes from "./ProjectSiteRoutes.js"
import holidayLeaveRoutes from "./HolidayLeaveRoutes.js"
import saturdayOffRoutes from "./SaturdayOffRoutes.js"


const router = express.Router()

router.use("/api/emp", EmployeeMasterRoutes)
router.use("/api/branch", branchRoutes)
router.use("/api/projectSite", projectSiteRoutes)
router.use("/api/designation", designationRoutes)
router.use("/api/department", departmentRoutes)
router.use("/api/import", importRoutes)
router.use("/api/holidays", holidayLeaveRoutes)
router.use("/api/saturdayOffs", saturdayOffRoutes)


export default router