const express = require("express");
const { json, urlencoded } = require("express");
const mongoose = require("mongoose");

const userRouter = require("./routes/users");

const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));

const mongoUrl = "mongodb+srv://admin:qwerty001@cluster0.r1oratx.mongodb.net/nodeClass";

mongoose.connect(mongoUrl, (err) => {
    if (err) console.log(err);
    else console.log("DB connected");
})

app.use("/users",userRouter);

app.listen(4000, () => console.log("server running as port 4000"))