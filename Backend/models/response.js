const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
  },
  qID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "query",
  },
  answer: {
    type: String,
    required: true,
  },
  votes: {
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    upVotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "client",
      default:[]
    },
    downVotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "client",
      default:[]
    },
  },
  time: {
    type: Number,
  },
});
const Response = mongoose.model("response", UserSchema);
module.exports = Response;
