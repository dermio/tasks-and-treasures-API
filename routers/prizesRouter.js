const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Prize } = require("../models/prizeModel");


// GET prize (prizes), for Parent and Child User with particular family code.
router.get("/:familyCode", (req, res) => {
  Prize.find({ familyCode: req.params.familyCode })
       .then((prizes) => {
         res.json(prizes.map(prize => prize.serialize()));
         /* either or
         res.json({
           prizes: prizes.map(prize => prize.serialize())
         });
         */
       })
       .catch(err =>{
         console.error(err);
         res.status(500).json({error: "Internal server error"});
       });
});

// POST prize, for Parent User
router.post("/", jsonParser, (req, res) => {
  //console.log(req.body);
  let requiredFields = ["prizeName", "familyCode"];

  for (let i = 0; i < requiredFields.length; i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\`in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Prize.create({
        prizeName: req.body.prizeName,
        familyCode: req.body.familyCode
      })
      .then(prize => res.status(201).json(prize.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
});

module.exports = router;
