// jshint esversion:6
const express = require('express')
const cors = require('cors');
const connectToMongo = require("./db");


const app = express();

// allow cors origin requests
app.use(cors());


// Connecting to database
connectToMongo();
// Getting Json in body
app.use(express.json());

// Available Rotes
app.use("/api/auth",require("./routes/auth"))
app.use("/api/query",require("./routes/question"))
app.use("/api/response",require("./routes/answer"))

app.get('/', (req, res) => {
  res.send('hello Raheel')
})
// Listening to port
app.listen(5000, ()=>{
    console.log("Connected to server");
})