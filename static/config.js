const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");

const db = mongoose.connection;

db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDB connected"));

module.exports = db;
