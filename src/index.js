
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require("./routes/route.product")
const app = express();
const cors = require("cors");
const PORT = process.env.PORT ;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
    app.use(express.json());
    app.use(cors());

app.use("/product",router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


