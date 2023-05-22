const mongoose  = require("mongoose");

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    course:{
        type:[String],
        required:true,
    },
   
    semester:{
        type:Number,
        required:true,
    },
    score:{
        type:Number,
        default:0
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"student"
    },
    date:{
        type:Date,
        default:Date.now
    }
})
const Client = mongoose.model("client",UserSchema);
module.exports = Client;