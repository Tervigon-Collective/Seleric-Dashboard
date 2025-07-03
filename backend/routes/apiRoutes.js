const express = require("express");
const router = express.Router();
const { getAllAdSpend, getTotalCogs, getNetProfit, getTotalSales, getOrderCount, getRoas } = require("../controller/apiController");
const apiController = require('../controller/apiController');

router.get("/ad_spend", getAllAdSpend);
router.get("/cogs", getTotalCogs);
router.get("/net_profit", getNetProfit);
router.get("/order_count", getOrderCount);
router.get("/sales", getTotalSales);
router.get("/roas" , getRoas)
router.get('/orders/:timeframe', apiController.getOrdersByTimeframe);

module.exports = router;