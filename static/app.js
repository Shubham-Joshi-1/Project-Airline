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
const { compileFunction } = require("vm");
mongoose.connect("mongodb+srv://Ansh:airline123@cluster0.zycn0.mongodb.net/");
const db = mongoose.connection;


db.on("error", () => console.log("Error connecting to the database"));
db.once("open", () => console.log("MongoDb connected"));


const seat_layout_schema=new mongoose.Schema({ 
  row: Number,
  cols:Number,
  member_type: String,  
  ticket_id: String,
  p_id:String,
  status:String
  });
const Seat = mongoose.model('Seat', seat_layout_schema, 'SeatAlloted');


const partial_ticket_schema=new mongoose.Schema({
  departure: String,
  arrival: String,
  departureDate: Date,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  dob: Date,
  sessionId: String,
  tripType:String,
  flight_name: String,
  flight_no: Number,
  flight_price:Number,
  row:Number,
  col:Number    
});
const pTicket = mongoose.model('pTicket', partial_ticket_schema, 'TemporaryTicket');

const final_ticket_schema=new mongoose.Schema({
  departure: String,
  arrival: String,
  depart_date: Date,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  dob: Date,
  session_id: String,
  tripType:String,
  flight_name: String,
  flight_no: Number,
  flight_price:Number,

  ticket_id:String,
  priority:Number
    });
const fTicket = mongoose.model('fTicket', final_ticket_schema, 'Tickets');

const seat_alloted_schema=new mongoose.schema({
  p_id:String,
  status:String
    )};



const admin_authentication_schema=new mongoose.Schema({
  email: String,
  password: String

    });
const Admin = mongoose.model('Admin', admin_authentication_schema, 'admin_authentication');
const priority_schema=new mongoose.Schema({
  priority_vip_count: Number,
  priority_regular_count: Number
    });
const Priority = mongoose.model('Priority', priority_schema, 'PriorityCount');
  
  
                                              
  
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
function checkAdminlogin(req, res, next){
  if(req.session.adminLoggedIn){
    next();
  }else{
    res.redirect("/admin_login")
  }

}
function generateTicketID(seatClass, row, col, priority) {
  let ticketID = seatClass.charAt(0); 
  
  if (priority === "VIP") {
      ticketID += `VIP_R${row}C${col}`;
  } else {
      ticketID += `_R${row}C${col}`;
  }

  return ticketID;
}
app.post("/available_flights", async (req, res) => {
  const sessionId = req.session.sessionId;
  const {tripType,departure,arrival,departureDate} = req.body;
  
  const newTicket = new pTicket({
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
          {tripType, departure, arrival, departureDate ,price:getRandomNumber(5000, 10000)}
          
      ]);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error inserting record" });
  }
});


app.post("/user_info", async (req, res) => {
    const { email,first_name, last_name, gender,dob} = req.body; 
    const sessionId = req.session.sessionId;


    try {
      let ticket = await pTicket.findOneAndUpdate(
        { sessionId }, 
        { 
            $set: { email, first_name, last_name, gender,dob} 
        }, 
        { new: true } 
    );
    await ticket.save();
    console.log("Record inserted");

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
  const { seat} = req.body;
  console.log(seat);
  const sessionId = req.session.sessionId;

  const { row, col } = parseSeat(seat);

  try {
    const seat = await Seat.findOne(p_id);
    if (seat && seat.status === "available") {
      seat.status = "booked";
      await seat.save();
      res.json({ success: true, message: "Seat booked!" });
    } else {
      res.status(400).json({ success: false, message: "Seat already booked" });
    }
    await pTicket.findOneAndUpdate(
      { sessionId },
      { $set: { row:row ,col:col } },
      { new: true }
    );
    res.redirect("/")
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


      if (password==user.password){
        req.session.adminLoggedIn = true;
         return res.redirect("/admin");
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
  app.get("/admin",checkAdminlogin ,(req, res) => {
    res.sendFile("/admin.html", { root: staticPath });
  });
  app.get("/admin_login", (req, res) => {
    res.sendFile("/admin_login.html", { root: staticPath });
  });
  app.get("/seats", async (req, res) => {
    try {
        const seats = await Seat.find();
        
        // Organizing seats into rows
        const seatGrid = [];
        seats.forEach(seat => {
            if (!seatGrid[seat.row]) {
                seatGrid[seat.row] = [];
            }
            seatGrid[seat.row].push({
                id: `${seat.row}-${seat.cols}`,
                row: seat.row,
                col: seat.cols,
                status: seat.ticket_id ? "booked" : "available"
            });
        });

        res.json(seatGrid);
    } catch (err) {
        console.error("Error fetching seats:", err);
        res.status(500).json({ error: "Server error" });
    }
});

  
  // API to book a seat
  app.post("/book", async (req, res) => {
     
  });


app.listen(3002, () => {
        console.log("Listening on localhost:3002");

});
