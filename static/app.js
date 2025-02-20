const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const staticPath = path.join(__dirname, "../static");
const { spawn } = require("child_process");
const { Console } = require("console");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid"); 
mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");
const db = mongoose.connection;

db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDb connected"));



const TicketsSchema = new mongoose.Schema({
  ticketID: String,
  sessionId: String,
  first_name: String,
  last_name: String,
  gender: String,
  email: String,
  seat_class: String,
  member_type: String,
  priority: Number,
  departure: String, 
  arrival: String, 
  departureDate: Date,
  tripType: String,
  seat:String
});
app.use(cors());
app.use(express.static(staticPath));
console.log("Departure:");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "HelloWorld",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));
app.use((req, res, next) => {
  if (!req.session.sessionId) {
      req.session.sessionId = uuidv4(); 
      console.log("New session ID assigned:", req.session.sessionId);
  }
  next();
});
app.use((req, res, next) => {
  if (req.path === "/favicon.ico") {
      return res.status(204).end(); 
  }
  next();
});

app.post("/available_flights", async (req, res) => {
  const Tickets = mongoose.model('Tickets', TicketsSchema);

  const { tripType, departure, arrival, departureDate } = req.body; 
  const sessionId = req.session.sessionId;
  

  const newTicket = new Tickets({
      sessionId,
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
    const sessionId = req.session.sessionId;

    const Tickets = mongoose.model('Tickets', TicketsSchema);

    try {
      let ticket = await Tickets.findOneAndUpdate(
        { sessionId }, 
        { 
            $set: { email, first_name, last_name, gender, seat_class, member_type } 
        }, 
        { new: true } 
    );

    res.redirect("/seat_layout");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error inserting or updating record");
    }
});


app.post("/seat_layout", async (req, res) => {
  const { seat } = req.body;
  console.log(seat);
  const sessionId = req.session.sessionId;
  const Tickets = mongoose.model("Tickets", TicketsSchema);

  try {
    await Tickets.findOneAndUpdate(
      { sessionId },
      { $set: { seat } },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error inserting or updating record");
  }

  let JsonOutput = "";
  try {
    const users = await Tickets.findOne(
      { sessionId },
      { member_type: 1, seat_class: 1, _id: 0 }
    );

    if (!users) {
      return res.status(404).send("User not found");
    }

    let seat_class = users.seat_class;
    let member_type = users.member_type;
    console.log("Users:", users);

    const child = spawn("c:\\all_codes\\Project-Airline\\src\\main.exe");

    child.stdin.write(` ${seat_class} ${member_type} 1 2\n`);
    child.stdin.end();

    child.stdout.on("data", async (data) => {
      JsonOutput = data.toString().trim();
      console.log("Result from C++:", JsonOutput);

      try {
        let updatedTicket = await Tickets.findOneAndUpdate(
          { sessionId },
          { $set: { ticketID: JsonOutput } },
          { new: true }
        );

        console.log("ticketID stored in MongoDB:", updatedTicket);
        res.redirect("/seat_layout");
      } catch (err) {
        console.error("Error updating ticketID in MongoDB:", err);
        res.status(500).send("Error updating ticketID in MongoDB");
      }
    });

    child.stderr.on("data", (data) => {
      console.error("C++ Error:", data.toString());
    });

    child.on("close", (code) => {
      console.log(`C++ process exited with code ${code}`);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching user data");
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

  app.get("/seat_layout", (req, res) => {
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
