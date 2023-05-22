const express = require("express");
const Query = require("../models/query");
const Response = require("../models/response");
// To validate user's response
const { body, validationResult } = require("express-validator");
const fetchuser = require("../Middleware/fetchuser");
const { response } = require("express");
const router = express.Router();

// Route: 1 Creating new query at /createquery
router.post(
  "/createquery",
  [
    body("title", "Enter Your Question").exists(),
    body("course", "Please! enter course code for quering question").exists(),
  ],
  fetchuser,
  async (req, res) => {
    let success = false;
    // Return bad request on error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res
        .status(400)
        .json({ progress: success, errors: errors.array() });
    }

    try {
      // Creating new query
      const time = new Date() / 1000;
      let query = await Query.create({
        user: req.user.id,
        question: {
          title: req.body.title,
          description: req.body.description,
        },
        course: req.body.course,
        time,
      });

      success = true;
      res.json({ progress: success, query });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Some error Happened");
    }
  }
);

// Route: 2 Getting Queries of same user at /getmyquery
router.get("/getmyquery", fetchuser, async (req, res) => {
  const queries = await Query.find({ user: req.user.id });
  res.json(queries);
});
// Route: 3 Getting all Queries at /getallquery
router.get("/getallquery", fetchuser, async (req, res) => {
  const queries = await Query.find();
  res.json(queries);
});

// Route: 4 Updating a query by changing votes at /updatequery:qID
router.put("/updatequery/:id", fetchuser, async (req, res) => {
  const { vType } = req.body;
  let success = false;
  // Verifying if the query exists
  let query = await Query.findById(req.params.id);
  if (!query) {
    return res.status(404).send("Not Found");
  }
  try {
    let found = false;
    let response = "";
    query.votes.upVotes.map(async (upVote) => {
      if (upVote == req.user.id) {
        found = true;
        if (vType !== "down") {
          success = true;
          response = "removed";
        }
        query = await Query.findByIdAndUpdate(req.params.id, {
          $pull: {
            "votes.upVotes": upVote,
          },
          $set: {
            "votes.count": query.votes.count - 1,
            "votes.total": query.votes.total - 1,
          },
        });
      }
    });

    if (!success) {
      query.votes.downVotes.map(async (downVote) => {
        if (downVote == req.user.id) {
          found = true;
          if (vType !== "up") {
            success = true;
            response = "removed";
          }
          query = await Query.findByIdAndUpdate(req.params.id, {
            $pull: {
              "votes.downVotes": downVote,
            },
            $set: {
              "votes.count": query.votes.count + 1,
              "votes.total": query.votes.total - 1,
            },
          });
        }
      });
    }

    if (!success) {
      if (vType === "up") {
        response = "upVoted";
        query = await Query.findByIdAndUpdate(req.params.id, {
          $push: {
            "votes.upVotes": req.user.id,
          },
          $set: {
            "votes.count": found
              ? query.votes.count + 2
              : query.votes.count + 1,
            "votes.total": query.votes.total + 1,
          },
        });
      } else if (vType === "down") {
        response = "downVoted";
        query = await Query.findByIdAndUpdate(req.params.id, {
          $push: {
            "votes.downVotes": req.user.id,
          },
          $set: {
            "votes.count": found
              ? query.votes.count - 2
              : query.votes.count - 1,
            "votes.total": query.votes.total + 1,
          },
        });
      }
    }
    res.json({ response });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Some error Happened");
  }
});

// Route: 3 Updating a query by Deleting Response ID at /delrID:qID
router.put("/delrID/:id", fetchuser, async (req, res) => {
  try {
    let { response } = req.body;

    // Verifying if the query exists
    let query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).send("Not Found");
    }

    if (response) {
      let reply = await Response.findById(response);
      if (reply.user == req.user.id) {
        query = await Query.findByIdAndUpdate(req.params.id, {
          $pull: {
            responses: response,
          },
        });
        reply = await Response.findByIdAndDelete(response);
        res.json({ progress: "Deleted response Successfully", reply });
      } else {
        res.json({ progress: "Not Allowed" });
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Some error Happened");
  }
});
module.exports = router;
