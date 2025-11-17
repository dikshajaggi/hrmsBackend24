import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/") // files will get stored here and create this first
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) //extracting extension 
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}` // adding a unique name to the file along with the extracted extension
    cb(null, uniqueName)
  },
})

// to allow only Excel files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // excel new format .xlxs
      file.mimetype === "application/vnd.ms-excel" || //excel- old format .xls
      file.mimetype === "text/csv" || // .csv
      file.mimetype === "application/csv") {
    cb(null, true)
  } else {
    cb(new Error("Only Excel files are allowed!"), false)
  }
}

export const upload = multer({ storage, fileFilter })
