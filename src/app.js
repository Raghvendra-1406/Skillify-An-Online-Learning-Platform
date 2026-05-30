const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(require("./routes/authRoutes"));
app.use(require("./routes/userRoutes"));
app.use(require("./routes/courseRoutes"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "pages", "index.html"));
});

app.use(require("./middleware/notFound"));
app.use(require("./middleware/errorHandler"));

module.exports = app;