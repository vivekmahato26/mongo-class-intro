const express = require("express");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRouter = new express.Router();

userRouter.post("/createUser", async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        const checkEmail = await userModel.find({ email: email });
        const checkPhone = await userModel.find({ phone });
        if (checkEmail.length) {
            res.send({ err: "Email already registered" });
            res.end();
        }
        else if (checkPhone.length) {
            res.send({ err: "Phone already registered" });
            res.end();
        }
        else {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt);
            const userData = await userModel.create({
                ...req.body,
                password: hashedPassword
            });
            res.send(userData);
            res.end();
        }
    } catch (error) {
        res.send(error);
        res.end();
    }
})

userRouter.get("/users", async (req, res) => {
    try {
        const userData = await userModel.find({});
        console.log(userData);
        res.send(userData);
        res.end();
    } catch (error) {
        res.send(error);
        res.end();
    }
})
userRouter.get("/update", async (req, res) => {
    try {
        const userData = await userModel.findByIdAndUpdate("639d63ccefdbbf63cb5c203e", {
            email: "prasanna@gmail.com",
            phone: "1234567890",
            name: "PK"
        });
        console.log(userData);
        res.send(userData);
        res.end();
    } catch (error) {
        res.send(error);
        res.end();
    }
})

userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const checkEmail = await userModel.find({ email: email });
        if (checkEmail.length) {
            const checkPass = await bcrypt.compare(password, checkEmail[0].password);
            if (checkPass) {
                const token = jwt.sign({
                    userId: checkEmail[0]._id,
                    email: checkEmail[0].email,
                }, "secretKey", { expiresIn: "1 days" });
                console.log(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()));
                res.send({
                    token,
                    userId: checkEmail[0]._id,
                    email: checkEmail[0].email,
                })
            } else {
                const err = new Error("Wrong credentials")
                res.send({ err: err.message })
                res.end();
            }

        } else {
            res.send({ err: "Email not registered" });
            res.end();
        }
    } catch (error) {
        const err = new Error("login Error");
        res.send({ err: err.message });
        res.end();
    }
})


userRouter.post("/updatePassword", async (req, res) => {
    try {
        const auth = req.get("Authorization");// req.headers.authorization
        const token = auth.split(" ")[1];
        const verify = jwt.verify(token, "secretKey");
        if (verify) {
            const data = jwt.decode(token);
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const update = await userModel.findByIdAndUpdate(data.userId, { password: hashedPassword });
            res.send({ msg: "Password updated" });
            res.end();
        } else {
            res.send({ err: "invalid token" })
        }
    } catch (error) {
        res.send({ err: error.message });
        res.end();
    }
})


module.exports = userRouter;