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



// const TicketsSchema = new mongoose.Schema({
//   ticketID: String,
//   sessionId: String,
//   first_name: String,
//   last_name: String,
//   gender: String,
//   email: String,
//   seat_class: String,
//   member_type: String,
//   priority: Number,
//   departure: String, 
//   arrival: String, 
//   departureDate: Date,
//   tripType: String,
//   row:Number,
//   col:Number
// });

const seat_layout_schema=new mongoose.Schema({ 
  row: Number,
  cols:Number,
  member_type: String,  
  ticket_id: String
  });

const partial_ticket_schema=new mongoose.Schema({
  from: String,
  to: String,
  depart_date: Date,
  f_name: String,
  l_name: String,
  email: String,
  gender: String,
  dob: Date,
  session_id: String,
  trip_type:String,
  flight_name: String,
  flight_no: Number,
  flight_price:Number    
});
const final_ticket_schema=new mongoose.Schema({
  from: String,
  to: String,
  depart_date: Date,
  f_name: String,
  l_name: String,
  email: String,
  gender: String,
  dob: Date,
  session_id: String,
  trip_type:String,
  flight_name: String,
  flight_no: Number,
  flight_price:Number,

  ticket_id:String,
  priority:Number
    });
const admin_authentication_schema=new mongoose.Schema({
  username: String,
  password: String

    });
const priority_schema=new mongoose.Schema({
  priority_vip_count: Number,
  priority_regular_count: Number
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
  const Tickets = mongoose.model('Tickets' , TicketsSchema);

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
    const { email,first_name, last_name, gender} = req.body; 
    const sessionId = req.session.sessionId;

    const Tickets = mongoose.model('Tickets', TicketsSchema);

    try {
      let ticket = await Tickets.findOneAndUpdate(
        { sessionId }, 
        { 
            $set: { email, first_name, last_name, gender} 
        }, 
        { new: true } 
    );

    res.redirect("/seat_layout");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error inserting or updating record");
    }
});
function parseSeat(seatString) {
  const [row, col] = seatString.split("-").map(Number);
  return { row, col };
}


app.post("/seat_layout", async (req, res) => {
  const { seat,member_type,seat_class } = req.body;
  console.log(seat);
  const sessionId = req.session.sessionId;
  const Tickets = mongoose.model("Tickets", TicketsSchema);

  const { row, col } = parseSeat(seat);

  try {
    await Tickets.findOneAndUpdate(
      { sessionId },
      { $set: { row:row ,col:col } },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error inserting or updating record");
  }

  
});

app.post('/admin_login', async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await Admin.findOne({ email });

      if (!user) {
          return res.status(500).json({ message: "Admin not found" });
          
      }

      const isMatch = await compare(password, user.password);

      if (isMatch) {
         return res.redirect("admin.html");
      } else {
        return res.status(500).json({ message: "Password didn't match" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
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

  app.get("/seat_layout", (req, res) => {
    res.sendFile("/seat-layout.html", { root: staticPath });
  });
  app.get("/user_info", (req, res) => {
    res.sendFile("/user_info.html", { root: staticPath });
  });
  app.get("/admin", (req, res) => {
    res.sendFile("/admin.html", { root: staticPath });
  });
  app.get("/admin_login", (req, res) => {
    res.sendFile("/admin_login.html", { root: staticPath });
  });


app.listen(3002, () => {
        console.log("Listening on localhost:3002");

});
