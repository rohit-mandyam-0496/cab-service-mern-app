const express = require("express");
const router = express.Router();
const __ = require('../utils/responseUtil');

router.get("/healthCheck", (req, res) => {
    console.log("Server is up and running");
    return __.successMsg(req, res, 200, "Server is up and running");
})

router.use("/admin", require("./admin"));
router.use("/customer", require("./customer"));
router.use("/driver", require("./driver"));
router.use('/booking', require('./booking'));
router.use('/area', require('./area'));
router.use('/sessions', require('./sessions'));

module.exports = router;