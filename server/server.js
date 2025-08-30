import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt, { hash } from 'bcrypt';
import User from './Schema/User.js';
import { nanoid } from 'nanoid';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex: true
})

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

            return res.status(200).json({"message":"User created successfully"})

        })
        .catch(err => {
            
            if(err.code === 11000){   // duplicate key error
                return res.status(403).json({"message":"User with this email already exists"})
            }
            return res.status(500).json({"message":"Internal server error"})
        })

    })

})

server.listen(PORT,() => {
    console.log('listening on port ->' + PORT);
})