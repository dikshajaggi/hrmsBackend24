import express from "express"
import { importAttendanceHandler, importBranchHandler, importDepartmentHandler, importDesignationHandler, importEmployeesHandler, importHolidayHandler, importProjectSiteHandler } from "../controllers/ImportController.js"
import { upload } from "../middlewares/upload.js"
import { isImportAuthorized } from "../middlewares/isImportAuthorized.js"
import {verifyMicrosoftToken} from "../middlewares/verifyMicrosoftToken.js"

const router = express.Router()

// master data ----- essential for foreign key lookups of import employee controller
router.route("/master/branch-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importBranchHandler )
router.route("/master/project-site-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importProjectSiteHandler )
router.route("/master/department-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importDepartmentHandler)
router.route("/master/designation-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importDesignationHandler)
router.route("/master/holidays-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importHolidayHandler)

router.route("/emp-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importEmployeesHandler)
router.route("/attendance-data").post(upload.single("file"), verifyMicrosoftToken, isImportAuthorized, importAttendanceHandler)


export default router