const express = require("express");
const router = express.Router();
const {
  initialize,
  getTransactions,
  statistics,
  barchart,
  piechart,
  combinedData,
} = require("../controllers/product.controller");

router.get("/initialize", initialize);
router.get("/transactions", getTransactions);
router.get("/statistics", statistics);
router.get("/barchart", barchart);
router.get("/piechart", piechart);
router.get("/combined", combinedData);

module.exports = router;
