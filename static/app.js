const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const staticPath = path.join(__dirname, "../static");
const { spawn } = require("child_process");
let output="";
mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");
const db = mongoose.connection;

db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDb connected"));



const TicketsSchema = new mongoose.Schema({
  tripType:String,
  from:String,
  to:String,
  departureDate:Date,
  passengers:Number
});


app.use(express.static(staticPath));
console.log("Departure:");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/available_flights", async (req, res) => {
    const { tripType,from, to, departureDate, passengers } = req.body; 
    const Tickets = mongoose.model('Tickets', TicketsSchema);

    const   tickets= new   Tickets({
      tripType,
      from,
      to,
      departureDate,
      passengers
  });
  try {
    await tickets.save();
    console.log("Record inserted");
    res.redirect("/available_flights");
} catch (err) {
    console.error(err);
    res.status(500).send("Error inserting record");
}
           
});
app.post("/user_info", async (req, res) => {
    console.log("Departure:1");
    const { email,first_name, last_name, month, day, year,gender} = req.body; 
    console.log(req.body); 
    res.redirect("/user_info"); 
    const child = spawn("C:\\Users\\Shreshth Manu Shukla\\OneDrive\\Desktop\\Airplane_ticket\\Project-Airline\\src\\main.exe");
    child.stdin.write(`${first_name} ${last_name} ${email} ${month} ${day} ${year} ${gender}\n`);
    child.stdin.end();

    child.stdout.on("data", (data) => {
      output = data.toString();
      console.log(output);
    });

    

    child.stderr.on("data", (data) => {
      console.error("C++ Error:", data.toString());
    });

    child.on("close", (code) => {
      console.log(`C++ process exited with code ${code}`)
    });
  
       
});






app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: staticPath });
  });
  app.get("/available_flights", (req, res) => {
    res.sendFile("/available_flights.html", { root: staticPath });
  });
  app.get("/seat-layout", (req, res) => {
    res.sendFile("/seat-layout.html", { root: staticPath });
  });
  app.get("/user_info", (req, res) => {
    res.sendFile("/user_info.html", { root: staticPath });
  });

app.listen(4003, () => {
        console.log("Listening on port 4003");
});
