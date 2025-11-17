import "dotenv/config"
import express from "express"
import cors from "cors";
import router from "./routes/index.js"
import { verifyMicrosoftToken } from "./middlewares/verifyMicrosoftToken.js"

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,              // allows cookies/auth headers if needed
}));

app.use((req, res, next) => {
  req.user = { username: "admin" };
  next();
});


app.use(express.json())

// dummy user
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    if (!req.headers.authorization) {
      req.user = { username: "admin" };
    }
    next();
  });
}

app.get("/api/protected", verifyMicrosoftToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.name}! Verified via Microsoft.`,
  });
});


app.use(router)

app.listen(PORT, () => console.log('server is running'))