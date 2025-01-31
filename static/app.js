const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const staticPath = path.join(__dirname, "../static");

mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");
const db = mongoose.connection;

db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDb connected"));



app.use(express.static(staticPath));
console.log("Departure:");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/available_flights", async (req, res) => {
    const { tripType,from, to, departureDate, passengers } = req.body; 
    console.log(req.body); 
    res.redirect("available_flights");
           
});
app.post("/user_info", async (req, res) => {
    console.log("Departure:1");
    const { email,first_name, last_name, month, day, year,gender} = req.body; 
    console.log(req.body); 
    res.redirect("/user_info");         
});

// app.use((req, res, next) => {
//   console.log(`${req.method} request to ${req.url}`);
//   next();
// });

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: staticPath });
  });
  app.get("/available_flights", (req, res) => {
    res.sendFile("/available_flights.html", { root: staticPath });
  });
  app.get("/user_info", (req, res) => {
    res.sendFile("/user_info.html", { root: staticPath });
  });

app.listen(4001, () => {
        console.log("Listening on port 4001");
});