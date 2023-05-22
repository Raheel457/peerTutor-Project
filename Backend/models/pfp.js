const mongoose = require("mongoose");

const UserPFP = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
  },
  Name: {
    type: String,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});
const Pfp = mongoose.model("pfp", UserPFP);
module.exports = Pfp;
