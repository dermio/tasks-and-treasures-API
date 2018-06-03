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

module.exports = router;
