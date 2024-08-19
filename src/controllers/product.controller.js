const Product = require("../models/product.model");
const httpStatus = require("http-status");
const axios = require("axios");
require("dotenv").config();
const PORT = process.env.PORT;

const initialize = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Product.deleteMany({});
    await Product.insertMany(response.data);
    res.status(httpStatus.OK).send("Database initialized with seed data.");
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send("Error initializing database.");
  }
};

const getTransactions = async (req, res) => {
  try {
    const { search = "", page = 1, perPage = 10, month } = req.query;
    const skip = (page - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    const query = {};
    if (!isNaN(search)) {
      const price = parseFloat(search);
      query.price = price;
    }else{
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    const transactions = await Product.find(query).skip(skip).limit(limit);
    if (month) {
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthNum = months.findIndex((item) => item === month);
      const filteredTransactions = transactions.filter(({ dateOfSale }) => {
        const date = new Date(dateOfSale);
        return date.getMonth() === monthNum;
      });
      return res.status(httpStatus.OK).json(filteredTransactions);
    }
    res.status(httpStatus.OK).json(transactions);
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send("Error fetching transactions");
  }
};

const statistics = async (req, res) => {
  try {
    const { month } = req.query;
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNum = months.findIndex((item) => item === month);

    const transactions = await Product.find({});

    const filteredTransactions = transactions.filter(({ dateOfSale }) => {
      const date = new Date(dateOfSale);
      return date.getMonth() === monthNum;
    });

    const totalSaleAmount = filteredTransactions.reduce(
      (sum, { price }) => sum + price,
      0
    );
    const totalSoldItems = filteredTransactions.filter(
      ({ sold }) => sold
    ).length;
    const totalNotSoldItems = filteredTransactions.length - totalSoldItems;

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).send("Error fetching statistics.");
  }
};

const barchart = async (req, res) => {
  try {
    const { month } = req.query;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNum = months.findIndex((item) => item === month);

    const transactions = await Product.find({});

    const filteredTransactions = transactions.filter(({ dateOfSale }) => {
      const date = new Date(dateOfSale);
      return date.getMonth() === monthNum;
    });

    if (filteredTransactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for the specified month." });
    }

    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: Number.MAX_SAFE_INTEGER },
    ];

    const barChartData = priceRanges.map((range) => {
      const count = filteredTransactions.filter(
        ({ price }) => price >= range.min && price <= range.max
      ).length;
      return { range: range.range, count };
    });

    res.status(200).json({ barChartData });
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).json({
      message: "Error fetching bar chart data.",
      error: error.message,
    });
  }
};

const piechart = async (req, res) => {
  try {
    const { month } = req.query;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNum = months.findIndex((item) => item === month);

    const transactions = await Product.find({});

    const filteredTransactions = transactions.filter(({ dateOfSale }) => {
      const date = new Date(dateOfSale);
      return date.getMonth() === monthNum;
    });

    if (filteredTransactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for the specified month." });
    }
    const categoryCounts = new Map();
    transactions.forEach(({ category }) => {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    const pieChartArray = Array.from(categoryCounts, ([category, count]) => ({
      category,
      count,
    }));
    res.status(httpStatus.OK).json(pieChartArray);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({
      message: "Error fetching pie chart data.",
      error: error.message,
    });
  }
};

const combinedData = async (req, res) => {
  try {
    const { month } = req.query;

    const [statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:${PORT}/product/statistics?month=${month}`),
      axios.get(`http://localhost:${PORT}/product/barchart?month=${month}`),
      axios.get(`http://localhost:${PORT}/product/piechart?month=${month}`),
    ]);

    const combinedResponse = {
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    };

    res.status(httpStatus.OK).json(combinedResponse);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send("Error fetching combined data.");
  }
};

module.exports = {
  initialize,
  getTransactions,
  statistics,
  barchart,
  piechart,
  combinedData,
};
