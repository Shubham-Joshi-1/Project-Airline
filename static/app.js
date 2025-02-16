const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const staticPath = path.join(__dirname, "../static");
const { spawn } = require("child_process");
const { Console } = require("console");
let JsonOutput="";
mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");
const db = mongoose.connection;

db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDb connected"));



const TicketsSchema = new mongoose.Schema({
  ticketID: String,
  first_name: String,
  last_name: String,
  gender: String,
  email: String,
  seat_class: String,
  member_type: String,
  row: Number,
  col: Number,
  priority: Number,
  departure: String, 
  arrival: String, 
  departureDate: Date,
  tripType: String
});
app.use(cors());
app.use(express.static(staticPath));
console.log("Departure:");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/available_flights", async (req, res) => {
  console.log("Received request:", req.body);
  const Tickets = mongoose.model('Tickets', TicketsSchema);

  const { tripType, departure, arrival, departureDate } = req.body; 

  const newTicket = new Tickets({
      tripType,
      departure,
      arrival,
      departureDate
  });

  try {
      await newTicket.save();
      console.log("Record inserted");

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
      res.json([
          {tripType, departure, arrival, departureDate ,price:getRandomNumber(5000, 10000)},
          
      ]);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error inserting record" });
  }
});

app.post("/user_info", async (req, res) => {
    const { email,first_name, last_name, gender,seat_class,member_type} = req.body; 
    // res.json(req.body);
    // const child = spawn("c:\\all_codes\\Project-Airline\\src\\main.exe");
    // child.stdin.write(`${first_name} ${gender}\n`);
    // child.stdin.end();



    // child.stdout.on("data", (data) => {
    //   JsonOutput += data.toString();
    //   console.log(JsonOutput);
    // });


    
    // child.stderr.on("data", (data) => {
    //   console.error("C++ Error:", data.toString());
    // });

    // child.on("close", (code) => {
    //   console.log(`C++ process exited with code ${code}`)
    //   res.redirect("/seat-layout");
    // });
    // child.on("close", async (code) => {
    //   console.log(`C++ process exited with code ${code}`);
  
    //   try {
    //     const customers = JSON.parse(jsonData);
  
    //     // Store each customer in MongoDB
    //     for (const ticketID in customers) {
    //       await TicketsSchema.create({ ticketID, ...customers[ticketID] });
    //     }
  
    //     res.json({ message: "Customers stored in MongoDB", data: customers });
    //   } catch (err) {
    //     console.error("Error parsing JSON:", err);
    //     res.status(500).send("Invalid JSON data from C++");
    //   }
    // });
    const Tickets = mongoose.model('Tickets', TicketsSchema);
    const   tickets= new Tickets({
      email,
      first_name,
      last_name,
      gender,
      seat_class,
      member_type

  });
  console.log(tickets);
  try {
    await tickets.save();
    console.log("Record inserted");
    res.redirect("seat-layout.html");
} catch (err) {
    console.error(err);
    res.status(500).send("Error inserting record");
}
  });






app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  Console.log("reQUEST");
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
  app.get("/admin", (req, res) => {
    res.sendFile("/admin.html", { root: staticPath });
  });


app.listen(3002, () => {
        console.log("Listening on localhost:3002");

});
