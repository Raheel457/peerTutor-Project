const express = require("express");
const Response = require("../models/response");
const Query = require("../models/query");
// To validate user's response
const { body, validationResult } = require("express-validator");
const fetchuser = require("../Middleware/fetchuser");
const router = express.Router();

// Route: 1 Adding response to the query at /addresponse
router.post(
  "/addresponse",
  [body("answer", "Answer is empty").exists()],
  fetchuser,
  [body("qID", "Question id is empty").exists()],
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
      // Adding the response
      const time = new Date() / 1000;
      let response = await Response.create({
        user: req.user.id,
        answer: req.body.answer,
        qID: req.body.qID,
        time,
      });

      // Adding response id to question array
      let query = await Query.findByIdAndUpdate(req.body.qID, {
        $push: {
          responses: response._id,
        },
      });
      success = true;
      res.json({ progress: success, response, query });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Some error Happened");
    }
  }
);

// Route: 2(a) Getting response at /getresponse
router.post("/getresponse", fetchuser, async (req, res) => {
  try {
    const response = await Response.findOne({ _id: req.body.id });
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send("Some error Happened");
  }
});
// Route: 2(b) Getting all reponses with the help of array  at /getallresponses
router.post("/getallresponses", fetchuser, async (req, res) => {
  try {
    const responsesId = req.body.responsesId;

    var Responses = [];
    responsesId.map(async (rId) => {
      const newResponse = await Response.findOne({ _id: rId });
      if (newResponse) {
        Responses = [...Responses, newResponse];
      }

      if (Responses.length === responsesId.length) {
        res.status(200).json({ Responses });
      }
    });
  } catch (error) {
    res.status(500).send("Some error Happened");
  }
});

// Route: 3 Updating votes of responses at /updateResVotes
router.put("/updateResVotes/:id", fetchuser, async (req, res) => {
  const { vType } = req.body;
  let success = false;
  // Verifying if the response exists
  let response = await Response.findById(req.params.id);
  if (!response) {
    return res.status(404).send("Not Found");
  }
  try {
    let found = false;
    let status = "";
    response.votes.upVotes.map(async (upVote) => {
      if (upVote == req.user.id) {
        found = true;
        if (vType === "up") {
          success = true;
          status = "removed";
        }
        response = await Response.findByIdAndUpdate(req.params.id, {
          $pull: {
            "votes.upVotes": upVote,
          },
          $set: {
            "votes.count": response.votes.count - 1,
          },
        });
      }
    });

    if (!success) {
      response.votes.downVotes.map(async (downVote) => {
        if (downVote == req.user.id) {
          found = true;
          if (vType === "down") {
            success = true;
            status = "removed";
          }
          response = await Response.findByIdAndUpdate(req.params.id, {
            $pull: {
              "votes.downVotes": downVote,
            },
            $set: {
              "votes.count": response.votes.count + 1,
            },
          });
        }
      });
    }

    if (!success) {
      if (vType === "up") {
        status = "upVoted";
        response = await Response.findByIdAndUpdate(req.params.id, {
          $push: {
            "votes.upVotes": req.user.id,
          },
          $set: {
            "votes.count": found
              ? response.votes.count + 2
              : response.votes.count + 1,
          },
        });
      } else if (vType === "down") {
        status = "downVoted";
        response = await Response.findByIdAndUpdate(req.params.id, {
          $push: {
            "votes.downVotes": req.user.id,
          },
          $set: {
            "votes.count": found
              ? response.votes.count - 2
              : response.votes.count - 1,
          },
        });
      }
    }
    res.json({ status });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Some error Happened");
  }
});
module.exports = router;
