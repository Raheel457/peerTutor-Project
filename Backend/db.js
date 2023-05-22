const mongoose  = require("mongoose");
const mongURL = "mongodb://localhost:27017/peerTutor";

const connectToMongo = async () => {
   await mongoose.connect(mongURL, ()=> {
        console.log("Connect to db successfully");
    })
}

module.exports = connectToMongo;