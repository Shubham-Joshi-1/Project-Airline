const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const staticPath = path.join(__dirname, "../static");
const { Console } = require("console");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid"); 
require("./config");
const mongoose = require("mongoose");

const {
  Seat,
  pTicket,
  fTicket,
  Admin,
  Priority
} = require('./models.js')                                           
  
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
  if (req.path === "/favicon.ico") {
      return res.status(204).end(); 
  }
  next();
});

// All functions here
function checkAdminlogin(req, res, next){
  if(req.session.adminLoggedIn){
    next();
  }else{
    res.redirect("/admin_login")
  }
}

function generateTicketID(seatClass, row, col, priority) {
  let ticketId= seatClass.charAt(0); 
  
  if (priority >26 && priority<=36) {
      ticketId += `VIP_R${row}C${col}`;
  }else if (priority >0 && priority<=26){
      ticketId += `_R${row}C${col}`;
  }
  return ticketId;
}

function parseSeat(seatString) {
  const [row, col] = seatString.split("-").map(Number);
  return { row, col };
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignPriority(memberType,vipCounter,regularCounter){
  let priority;
  if (memberType=="vip"){
   priority=vipCounter;
  }else{
    priority=regularCounter;
  }
  return priority;
}

// Modified to store flight data in session instead of database
app.post("/available_flights", async (req, res) => {
  const sessionId = req.session.sessionId || uuidv4();
  req.session.sessionId = sessionId;
  
  const {tripType, departure, arrival, departureDate} = req.body;
  
  // Store data in session instead of database
  req.session.bookingData = {
    tripType,
    departure,
    arrival,
    departureDate,
    price: getRandomNumber(5000, 10000)
  };
  
  console.log("Flight data stored in session:", req.session.bookingData);
  
  res.json([
    {tripType, departure, arrival, departureDate, price: req.session.bookingData.price},
    {tripType, departure, arrival, departureDate, price: getRandomNumber(5000, 10000)}
  ]);
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
      return res.status(500).json({ message: "Password didn't match" }) 
    } 
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// Modified to store seat data in session, but still update seat status in database
app.post("/seat_layout", async (req, res) => {
  const { seat, memberType, seatClass } = req.body;
  console.log(req.body);
  
  if (!seat) {
    return res.status(400).json({ message: "Please select a seat" });
  }
  
  try {
    const { row, col } = parseSeat(seat);
    const priority = await Priority.findOne();
    console.log("fetched till here");
    
    const assignedPriority = assignPriority(
      memberType,
      priority.priority_vip_count,
      priority.priority_regular_count
    );
    
    const ticketId = generateTicketID(seatClass, row, col, assignedPriority);
    
    // Mark seat as booked in database
    const updateSeat = await Seat.findOneAndUpdate(
      { p_id: seat },
      { $set: { status: "booked", ticketId: ticketId } },
      {new:true}
    );
    
    if (!updateSeat) {
      console.error("No Seat found for p_id:", seat);
    }
    
    // Update priority count
    if (memberType === "vip") {
      await Priority.findByIdAndUpdate(
        "67cdc95889809dd3ee59ed02",
        { $inc: { priority_vip_count: -1 } }
      );
    } else {
      await Priority.findByIdAndUpdate(
        "67cdc95889809dd3ee59ed02",
        { $inc: { priority_regular_count: -1 } }
      );
    }
    
    // Store seat data in session
    if (!req.session.bookingData) {
      req.session.bookingData = {};
    }
    
    req.session.bookingData = {
      ...req.session.bookingData,
      seatClass,
      memberType,
      seat,
      ticketId,
      assignedPriority,
      row,
      col
    };
    const bookingData = req.session.bookingData;

    const tempTicket = new pTicket({
      sessionId: req.session.sessionId,
      tripType: bookingData.tripType,
      departure: bookingData.departure,
      arrival: bookingData.arrival,
      departureDate: bookingData.departureDate,
      first_name: bookingData.first_name,
      last_name: bookingData.last_name,
      email: bookingData.email,
      gender: bookingData.gender,
      dob: bookingData.dob,
      ticketId: bookingData.ticketId,
      assignedPriority: bookingData.assignedPriority,
      memberType: bookingData.memberType,
      flight_price: bookingData.price
    });
    // Save the temporary ticket
    await tempTicket.save();
    console.log('Temporary ticket created:', tempTicket);
    console.log("one ticket must be in temp ticket");
    
    console.log("Seat data stored in session:", req.session.bookingData);
    
    return res.redirect("/final_ticket");
  } catch (err) {
    console.error("Error in seat_layout:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get('/api/final_ticket', async (req, res) => {
  try {
      const sessionId = req.session.sessionId;
      if (!sessionId) {
          return res.status(400).json({ error: 'No session ID found' });
      }

      const ticket = await pTicket.findOne({ sessionId });
      if (!ticket) {
          return res.status(404).json({ error: 'Final ticket not found for session' });
      }
      console.log("sent confirmation data");
      res.json(ticket);
  } catch (err) {
      console.error("Error fetching final ticket:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Modified to store user info in session instead of database
app.post("/user_info", async (req, res) => {
  const { email, first_name, last_name, gender, dob } = req.body; 
  console.log(req.body);
  
  // Store user info in session
  if (!req.session.bookingData) {
    req.session.bookingData = {};
  }
  
  req.session.bookingData = {
    ...req.session.bookingData,
    email,
    first_name,
    last_name,
    gender,
    dob
  };
  
  console.log("User info stored in session:", req.session.bookingData);
  
  res.redirect("/seat_layout");
});

// Modified to create pTicket from session data before confirming
app.post('/api/confirm-ticket', async (req, res) => {
  try {
    const { ticketId } = req.body;
    const bookingData = req.session.bookingData;
    if (!bookingData) {
      return res.status(404).json({ error: "No booking data found in session" });
    }
    
    console.log('Using booking data from session:', bookingData);

    
    
     const  tempTicket =  await pTicket.findOne();
    
    // Create a new final ticket from the temporary ticket data
    const finalTicket = new fTicket({
      departure: tempTicket.departure,
      arrival: tempTicket.arrival,
      depart_date: tempTicket.departureDate,
      first_name: tempTicket.first_name,
      last_name: tempTicket.last_name,
      email: tempTicket.email,
      gender: tempTicket.gender,
      dob: tempTicket.dob,
      session_id: tempTicket.sessionId,
      tripType: tempTicket.tripType || 'Economy',
      flight_name: 'Team S Airline',
      flight_no: Math.floor(Math.random() * 1000),
      flight_price: tempTicket.flight_price || 0,
      ticketId: tempTicket.ticketId,
      assignedPriority: tempTicket.assignedPriority || 50
    });
    
    // Save the final ticket
    await finalTicket.save();
    console.log('Final ticket created:', finalTicket);
    
    // Delete the temporary ticket
    await pTicket.findOneAndDelete({ ticketId: tempTicket.ticketId });
    console.log('Temporary ticket deleted');
    
    // Clear session booking data

    
    // Return success response
    res.json({
      success: true,
      message: "Ticket confirmed successfully",
      ticket: {
        id: finalTicket.ticketId,
        class: finalTicket.tripType,
        name: `${finalTicket.first_name} ${finalTicket.last_name}`,
        from: finalTicket.departure,
        to: finalTicket.arrival,
        date: finalTicket.depart_date ? new Date(finalTicket.depart_date).toISOString().split('T')[0] : 'N/A',
        assignedPriority: finalTicket.assignedPriority
      }
    });
    
  } catch (err) {
    console.error('Error confirming ticket:', err);
    res.status(500).json({ error: "Error confirming ticket: " + err.message });
  }
});

// Modified to handle multiple tickets from session data
app.post('/api/confirm-tickets', async (req, res) => {
  try {
    const { ticketIds } = req.body;
    const bookingData = req.session.bookingData;
    
    if (!bookingData) {
      return res.status(404).json({ error: "No booking data found in session" });
    }
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: "Invalid or empty ticket IDs array" });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each ticket ID
    for (const ticketId of ticketIds) {
      try {
        // Create a temporary ticket from session data
        const tempTicket = new pTicket({
          sessionId: req.session.sessionId,
          tripType: bookingData.tripType,
          departure: bookingData.departure,
          arrival: bookingData.arrival,
          departureDate: bookingData.departureDate,
          first_name: bookingData.first_name,
          last_name: bookingData.last_name,
          email: bookingData.email,
          gender: bookingData.gender,
          dob: bookingData.dob,
          ticketId: ticketId,
          assignedPriority: bookingData.assignedPriority,
          memberType: bookingData.memberType,
          flight_price: bookingData.price
        });
        
        await tempTicket.save();
        
        // Create a new final ticket
        const finalTicket = new fTicket({
          departure: tempTicket.departure,
          arrival: tempTicket.arrival,
          depart_date: tempTicket.departureDate,
          first_name: tempTicket.first_name,
          last_name: tempTicket.last_name,
          email: tempTicket.email,
          gender: tempTicket.gender,
          dob: tempTicket.dob,
          session_id: tempTicket.sessionId,
          tripType: tempTicket.tripType || 'Oneway',
          flight_name: 'Team S Airline',
          flight_no: Math.floor(Math.random() * 1000),
          flight_price: tempTicket.flight_price || 0,
          ticketId: ticketId,
          assignedPriority: tempTicket.assignedPriority || 50
        });
        
        // Save the final ticket
        await finalTicket.save();
        
        // Delete the temporary ticket
        await pTicket.findByIdAndDelete(tempTicket._id);
        
        results.success.push({
          id: ticketId,
          finalTicketId: finalTicket.ticketId
        });
        
      } catch (err) {
        console.error(`Error processing ticket ${ticketId}:`, err);
        results.failed.push({ id: ticketId, reason: err.message });
      }
    }
    
    // Clear session booking data
    req.session.bookingData = {};
    
    res.json({
      summary: {
        total: ticketIds.length,
        succeeded: results.success.length,
        failed: results.failed.length
      },
      results
    });
    
  } catch (err) {
    console.error('Error confirming multiple tickets:', err);
    res.status(500).json({ error: "Error confirming tickets: " + err.message });
  }
});
app.delete('/api/tickets/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  if (!ticketId) {
    return res.status(400).json({ error: "Ticket ID is required" });
  }

  try {
    const deleted = await pTicket.findOneAndDelete({ ticketId });
    const freeSeat = await Seat.findOneAndUpdate(
       {ticketId},
      {$set:{status:"available"}},
      {new:true}

    );
    if(freeSeat){
      console.log("freed a seat");
    }

    if (!deleted) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ success: true, message: `Ticket ${ticketId} deleted successfully` });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/test-database', async (req, res) => {
  try {
    // Check database connection status
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Try to query each collection
    const results = {};
    
    // Test pTicket collection
    try {
      const pTicketCount = await pTicket.countDocuments();
      results.pTicket = {
        status: 'success',
        count: pTicketCount,
        sample: pTicketCount > 0 ? await pTicket.findOne() : null
      };
    } catch (err) {
      results.pTicket = { status: 'error', message: err.message };
    }
    
    // Test fTicket collection
    try {
      const fTicketCount = await fTicket.countDocuments();
      results.fTicket = {
        status: 'success',
        count: fTicketCount,
        sample: fTicketCount > 0 ? await fTicket.findOne() : null
      };
    } catch (err) {
      results.fTicket = { status: 'error', message: err.message };
    }
    
    // Test Seat collection
    try {
      const seatCount = await Seat.countDocuments();results.Seat = {
        status: 'success',
        count: seatCount,
        sample: seatCount > 0 ? await Seat.findOne() : null
      };
    } catch (err) {
      results.Seat = { status: 'error', message: err.message };
    }
    
    // Return comprehensive results
    res.json({
      connection: {
        state: connectionStates[connectionState] || 'unknown',
        stateCode: connectionState
      },
      collections: results,
      models: Object.keys(mongoose.models)
    });
    
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ 
      error: "Database test failed", 
      message: err.message
    });
  }
});

// Modified to get session data for the booking process
app.get('/api/current-booking', (req, res) => {
  if (!req.session.bookingData) {
    return res.status(404).json({ error: "No booking data found in session" });
  }
  
  res.json({
    bookingData: req.session.bookingData
  });
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

app.get("/admin", checkAdminlogin, (req, res) => {
  res.sendFile("/admin.html", { root: staticPath });
});

app.get("/admin_login", (req, res) => {
  res.sendFile("/admin_login.html", { root: staticPath });
});

app.get("/test", (req, res) => {
  res.sendFile("/ticket-test.html", {root: staticPath });
});
app.get("/final_ticket",(req,res)=>{
  res.sendFile("final-ticket.html",{root:staticPath});
});


app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seats" });
  }
});

app.get('/api/tickets', async (req, res) => {
  console.log('Attempting to fetch tickets from database...');
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('Database connection is not ready');
      return res.status(500).json({ error: "Database connection error" });
    }

    const partialTickets = await pTicket.find({}).maxTimeMS(5000);
    console.log(`Found ${partialTickets.length} partial tickets`);

    const formattedPartialTickets = partialTickets.map(ticket => {
      try {
        return {
          class: ticket.memberType || "Economy",
          id: ticket.ticketId || ticket._id.toString(),
          name: `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim(),
          from: ticket.departure || 'N/A',
          to: ticket.arrival || 'N/A',
          date: ticket.departureDate ? new Date(ticket.departureDate).toISOString().split('T')[0] : 'N/A',
          assignedPriority: ticket.assignedPriority || 50,
          status: 'pending'
        };
      } catch (err) {
        console.error('Error formatting partial ticket:', err);
        return null;
      }
    }).filter(ticket => ticket !== null);

    console.log(`Successfully prepared ${formattedPartialTickets.length} tickets for response`);
    res.json(formattedPartialTickets);

  } catch (err) {
    console.error('Error fetching tickets from database:', err);
    res.status(500).json({ error: "Error fetching tickets from database: " + err.message });
  }
});


app.get("/new_session", (req, res) => {
  const newSessionId = uuidv4();
  req.session.sessionId = newSessionId;
  req.session.bookingData = {}; // Initialize empty booking data
  console.log("New session started:", newSessionId);
  res.json({ sessionId: newSessionId });
});

app.listen(3002, () => {
  console.log("Listening on localhost:3002");
});