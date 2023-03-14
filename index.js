const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const db = require("./db/connect");
const userRoutes = require("./routes/User");
const app = express();

db();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
console.log(__dirname+"/routes/uploads")
app.use("/uploads", express.static(__dirname +"/routes/uploads"))
app.use("/api", userRoutes);
const port = process.env.port;

app.listen(port, () => {
  console.log("You're Listening on", port);
});
