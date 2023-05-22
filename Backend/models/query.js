const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
  },
  question: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No description Given",
    },
  },
  course: {
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
  responses: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "response",
    default:[]
  },
  time: {
    type: Number
  },
});
const Query = mongoose.model("query", querySchema);
module.exports = Query;
