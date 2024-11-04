const express = require("express");
const router = express.Router();
const createError = require('http-errors');



const db = require("../models");
const Market = db.Market;

router.get("/map-example" ,(req, res) => {
    res.render(`market/detail/kakaomap`,{
        marketId: "map-example"
    });
});
router.get("/detail", (req, res) => {
    res.send("market detail")
});
router.get("/detail/:id", async (req, res, next) => {
    const marketId = req.params.id;

    //@todo 해결해야함
    // const data = await Market.get뭐시기ById("marketId")
    const data ={};
    if(!data) {
        createError(400);
        next();
    }

    res.render(`market/detail/template`, {
        marketId,
        data
    });
});
module.exports = router;