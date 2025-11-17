import { importAttendance } from "../scripts/import-attendance.js"
import { importEmployees } from "../scripts/import-employees.js"
import { importBranch, importDepartment, importDesignation, importProjectSite } from "../scripts/import-masters.js"

async function handleImport(req, res, importFunction, entityName) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log(req.file, "filee")
    const fileName = req.file?.path;
    if (!fileName) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const importedBy = req.user.name;
    const result = await importFunction(fileName, importedBy);

    return res.status(200).json({
      message: `${entityName} import completed`,
      summary: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${entityName} import failed`,
      error: error.message,
    });
  }
}


export const importBranchHandler = (req, res) =>
  handleImport(req, res, importBranch, "Branch");

export const importProjectSiteHandler = (req, res) =>
  handleImport(req, res, importProjectSite, "Project Site");

export const importDepartmentHandler = (req, res) =>
  handleImport(req, res, importDepartment, "Department");

export const importDesignationHandler = (req, res) =>
  handleImport(req, res, importDesignation, "Designation");

export const importEmployeesHandler = (req, res) =>
  handleImport(req, res, importEmployees, "Employee");

export const importAttendanceHandler = (req, res) =>
  handleImport(req, res, importAttendance, "Attendance");



// export const importEmployeesHandler = async(req, res) => {
//   try {
//     if (!req.user) {
//         return res.status(401).json({ message: "User not authenticated" })
//     }

//     console.log(req.file, req.user, "checking userr")

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importEmployees(fileName, importedBy)

//     res.status(200).json({message: "Employee import completed", summary: result})
//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }

// export const importAttendanceHandler = async(req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" })
//     }

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importAttendance(fileName, importedBy)

//     res.status(200).json({message: "Attendance import completed", summary: result})

//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }


// export const importBranchHandler = async(req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" })
//     }

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importBranch(fileName, importedBy)

//     res.status(200).json({message: "Branch import completed", summary: result})
//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }

// export const importProjectSiteHandler = async(req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" })
//     }

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importProjectSite(fileName, importedBy)

//     res.status(200).json({message: "Project Site import completed", summary: result})
//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }

// export const importDesignationHandler = async(req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" })
//     }

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importDesignation(fileName, importedBy)

//     res.status(200).json({message: "Designation import completed", summary: result})
//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }

// export const importDepartmentHandler = async(req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" })
//     }

//     const fileName = req.file.path
//     const importedBy = req.user.name

//     const result = await importDepartment(fileName, importedBy)

//     res.status(200).json({message: "Department import completed", summary: result})
//   } catch (err) {
//     res.status(500).json({
//       message: "Import failed",
//       error: err.message,
//     })
//   }
// }