var express = require('express');
var router = express.Router();

const db = require("../models");
const User = db.user;
const userSchema = require("../utils/joiUserSchema");

const passport = require('passport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//GET request
router.get("/sign-up", (req,res)=> {
    res.render('sign-up');
});

router.get("/sign-in", (req,res)=> {
    res.render('sign-in');
});

router.get('/sign-out', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/home");
    });
});

//post
router.post("/sign-in", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {

        if (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        if (!user) {
            return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            return res.status(200).json({ message: '로그인 성공' });
        });
    })(req, res, next);
});

router.post("/register", async (req,res)=>{

    if(req.body.isEncrypted){
        const PRIVATE_KEY = process.env.REGISTER_SECRET;

        const PEM = "-----BEGIN PRIVATE KEY-----\n" + PRIVATE_KEY + "\n-----END PRIVATE KEY-----";

        const key = crypto.createPrivateKey({
            key: PEM,
            format: 'pem',
            type: 'pkcs8',
        });

        let decrypted = crypto.privateDecrypt(
            {
                key: key,
                oaepHash: "sha256",
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(req.body.data, 'base64')
        );

        decrypted = decrypted.toString('utf8');

        req.body = JSON.parse(decrypted);
    } else {
        req.body = req.body.data;
    }



    const { error } = userSchema.registerSchema.validate(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // id 중복 확인 ( mongoose)
    const user = await User.findOne({id: req.body.id});
    if(user) {
        return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }

    //trim
    req.body.id = req.body.id.trim();
    req.body.name = req.body.name.trim();





    const password = bcrypt.hashSync(req.body.password, 10);
    User.create({
        id: req.body.id,
        name: req.body.name,
        password: password
    })
    .then(user=> {
        res.status(201).json(user);
    })
    .catch(err=> {
        console.log(err);
        res.status(500).json({ error: err.message });
    });
});

// Check for duplicate ID
router.post("/check-id", async (req, res) => {
    try {
        const user = await User.findOne({id: req.body.id });
        if (user) {
            return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
        }
        res.status(200).json({ message: "사용 가능한 아이디입니다." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
