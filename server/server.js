import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt, { hash } from 'bcrypt';
import User from './Schema/User.js';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex: true
})

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({id:user._id},process.env.SECRET_ACCESS_KEY)

    return{
        access_token,
        profile_img: user.personal_info.profile_img,
        fullname: user.personal_info.fullname,
        username: user.personal_info.username,
    }
}
const generateUsername = async(email) => {
    let username = email.split('@')[0];        // getting username from email as@gmail -> [as,gmail] -> as

    let username_exists = await User.exists({"personal_info.username": username});

    username_exists ? username += nanoid().substring(0,5) :"";   // if username exists add random 5 letter string to it

    return username;
}

server.use(express.json())      // accepts json data from frontend


server.post("/signup",(req,res) => {
    let {fullname,email,password} = req.body;

    // validating the data from frontend
    if(fullname.length < 3){
        return res.status(403).json({"message":"Fullname must be at least 3 characters long"})
    }

    if(!email.length){
        return res.status(403).json({"message":"Enter a valid email"})
    }

    if(!emailRegex.test(email)){
        return res.status(403).json({"message":"Email is invalid"})
    }

    if(!passwordRegex.test(password)){
        return res.status(403).json({"message":"Password is invalid"})
    }

    bcrypt.hash(password,10,async (err,hashed_password) => {

        let username = await generateUsername(email);     // getting username from email as@gmail -> [as,gmail] -> as
        
        let user = User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        })

        user.save().then((u) => {

            return res.status(200).json(formatDatatoSend(u))

        })
        .catch(err => {
            
            if(err.code === 11000){   // duplicate key error
                return res.status(403).json({"message":"User with this email already exists"})
            }
            return res.status(500).json({"message":"Internal server error"})
        })

    })

})

server.post("/signin",(req,res) => {

    let{email,password} = req.body;

    User.findOne({"personal_info.email": email})
    .then((user) => {
        if(!user){
            return res.status(403).json({"message":"User with this email does not exist"})
        }

        bcrypt.compare(password,user.personal_info.password,(err,result) => {
            if(err){
                return res.status(500).json({"message":"error occured while login please try again"})
            }

            if(!result){
                return res.status(403).json({"message":"Incorrect password"})
            }else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })
    })
        .catch(err => {
            console.log(err.message)
            return res.status(500).json({"error": err.message})
        })
    })


server.listen(PORT,() => {
    console.log('listening on port ->' + PORT);
})