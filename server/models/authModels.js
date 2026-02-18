const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
     name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        default:null
    },
    profileImage:{
        type:String,
        default:null
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    googleProfile:{
        provider:String,
        id:String,
        displayName:String,
        photos:[{
            value:String
        }]
    },
    role:{
        type:String,
        enum:['user','admin','analyzer'],
        default:'user'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

const User = mongoose.model('User',UserSchema);

module.exports = User;