
const express = require("express");
const mongoose = require("mongoose");
const userFormRouter = require("./userForm"); 
const userGridRouter = require("./userGrid"); 

mongoose
  .connect("mongodb+srv://sivaprakash:Siva12345@cluster0.b0a71xd.mongodb.net/sample")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const app = express();

app.use("/", userFormRouter);
app.use("/", userGridRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});