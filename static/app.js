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


  const seat_layout_schema = new mongoose.Schema({ 
    row: Number,
    col: Number, 
    member_type: String,  
    ticket_id: String,
    p_id: String, 
    status: String
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
  app.post("/seat_layout", async (req, res) => {
    const { seat } = req.body; // Expects seat ID like "1-1"
    try {
      const result = await Seat.updateOne(
        { p_id: seat },
        { $set: { status: "booked" } }
    );
    if(!seat){
      return res.status(500).json({message:"pls select seat"});
    }  
    res.redirect("/");
    } catch (err) {
      return res.status(500).json({ success: false });
    }
  });
  app.post("/user_info", async (req, res) => {
      const { email,first_name, last_name, gender,dob} = req.body; 
      const sessionId = req.session.sessionId;
      console.log(req.body);


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
  // Sample data - in a real app, this would come from a database
  // let tickets = [
  //   { class: "Business", id: "BUS001", name: "John Doe", from: "NY", to: "LA", date: "2025-02-15", assignedPriority: 36 },
  //   { class: "Economy", id: "ECO001", name: "Jane Smith", from: "Chicago", to: "Miami", date: "2025-02-16", assignedPriority: 24 },
  //   { class: "Economy", id: "ECO002", name: "Alice Johnson", from: "London", to: "Paris", date: "2025-02-17", assignedPriority: 27 },
  //   { class: "Business", id: "BUS002", name: "Bob Wilson", from: "Tokyo", to: "Sydney", date: "2025-02-18", assignedPriority: 14 },
  //   { class: "Business", id: "BUS003", name: "Emily Davis", from: "Berlin", to: "Madrid", date: "2025-02-19", assignedPriority: 32 },
  //   { class: "Economy", id: "ECO003", name: "Michael Brown", from: "San Francisco", to: "Seattle", date: "2025-02-20", assignedPriority: 18 }
  // ];

  // Routes

  // Get all tickets
 
  // Update the DELETE endpoint to remove a ticket from MongoDB
  // app.delete('/api/tickets/:id', async (req, res) => {
  //   try {
  //     const ticketId = req.params.id;
      
  //     // Find and delete the ticket
  //     const result = await fTicket.deleteOne({ ticket_id: ticketId });
      
  //     if (result.deletedCount === 0) {
  //       return res.status(404).json({ error: "Ticket not found" });
  //     }
      
  //     res.json({ success: true, message: `Ticket ${ticketId} deleted` });
  //   } catch (err) {
  //     console.error('Error deleting ticket from database:', err);
  //     res.status(500).json({ error: "Error deleting ticket from database" });
  //   }
  // });

  // Update the confirm tickets endpoint to update status in MongoDB
  // Add this new endpoint to handle the confirm button action
app.post('/api/confirm-ticket', async (req, res) => {
  try {
    const { ticketId } = req.body; // This could be session ID or _id of the temporary ticket
    
    // Find the temporary ticket by ID or session ID
    let tempTicket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      tempTicket = await pTicket.findById(ticketId);
    } else {
      // If not a valid ObjectId, try to find by sessionId
      tempTicket = await pTicket.findOne({ 
        $or: [
          { sessionId: ticketId },
          { _id: ticketId }
        ]
      });
    }
    
    if (!tempTicket) {
      return res.status(404).json({ error: "Temporary ticket not found" });
    }
    
    console.log('Found temporary ticket:', tempTicket);
    
    // Generate a ticket ID if not present
    const ticketID = tempTicket.ticket_id || generateTicketID(
      tempTicket.tripType || 'Economy', 
      tempTicket.row || 1, 
      tempTicket.col || 1, 
      "Regular" // Default priority type
    );
    
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
      flight_name: tempTicket.flight_name || 'Default Airline',
      flight_no: tempTicket.flight_no || Math.floor(Math.random() * 1000),
      flight_price: tempTicket.flight_price || 0,
      ticket_id: ticketID,
      priority: tempTicket.priority || 50 // Default priority
    });
    
    // Save the final ticket
    await finalTicket.save();
    console.log('Final ticket created:', finalTicket);
    
    // Delete the temporary ticket
    await pTicket.findByIdAndDelete(tempTicket._id);
    console.log('Temporary ticket deleted');
    
    // Return success response
    res.json({
      success: true,
      message: "Ticket confirmed successfully",
      ticket: {
        id: finalTicket.ticket_id,
        class: finalTicket.tripType,
        name: `${finalTicket.first_name} ${finalTicket.last_name}`,
        from: finalTicket.departure,
        to: finalTicket.arrival,
        date: finalTicket.depart_date ? new Date(finalTicket.depart_date).toISOString().split('T')[0] : 'N/A',
        assignedPriority: finalTicket.priority
      }
    });
    
  } catch (err) {
    console.error('Error confirming ticket:', err);
    res.status(500).json({ error: "Error confirming ticket: " + err.message });
  }
});

// Add this endpoint to confirm multiple tickets at once
app.post('/api/confirm-tickets', async (req, res) => {
  try {
    const { ticketIds } = req.body; // Array of ticket IDs to confirm
    
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
        // Find the temporary ticket
        let tempTicket;
        if (mongoose.Types.ObjectId.isValid(ticketId)) {
          tempTicket = await pTicket.findById(ticketId);
        } else {
          // If not a valid ObjectId, try to find by other identifiers
          tempTicket = await pTicket.findOne({ 
            $or: [
              { sessionId: ticketId },
              { _id: ticketId.toString() },
              { ticket_id: ticketId }
            ]
          });
        }
        
        if (!tempTicket) {
          results.failed.push({ id: ticketId, reason: "Ticket not found" });
          continue;
        }
        
        // Generate a ticket ID if not present
        const ticketID = tempTicket.ticket_id || generateTicketID(
          tempTicket.tripType || 'Economy', 
          tempTicket.row || 1, 
          tempTicket.col || 1, 
          "Regular" // Default priority type
        );
        
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
          tripType: tempTicket.tripType || 'Economy',
          flight_name: tempTicket.flight_name || 'Default Airline',
          flight_no: tempTicket.flight_no || Math.floor(Math.random() * 1000),
          flight_price: tempTicket.flight_price || 0,
          ticket_id: ticketID,
          priority: tempTicket.priority || 50
        });
        
        // Save the final ticket
        await finalTicket.save();
        
        // Delete the temporary ticket
        await pTicket.findByIdAndDelete(tempTicket._id);
        
        results.success.push({
          id: ticketId,
          finalTicketId: finalTicket.ticket_id
        });
        
      } catch (err) {
        console.error(`Error processing ticket ${ticketId}:`, err);
        results.failed.push({ id: ticketId, reason: err.message });
      }
    }
    
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
        const seatCount = await Seat.countDocuments();
        results.Seat = {
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
    app.get("/test", (req, res) => {
      res.sendFile("/ticket-test.html", {root: staticPath });
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
        // Check database connection
        if (mongoose.connection.readyState !== 1) {
          console.error('Database connection is not ready');
          return res.status(500).json({ error: "Database connection error" });
        }
        
        // Fetch tickets from BOTH collections for comprehensive results
        const partialTickets = await pTicket.find({}).maxTimeMS(5000);
        
        console.log(`Found ${partialTickets.length} partial `);
        
        // Transform partial tickets
        const formattedPartialTickets = partialTickets.map(ticket => {
          try {
            return {
              class: ticket.tripType || "Economy",
              id: ticket._id.toString(), // Use MongoDB ID if ticket_id not available
              name: `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim(),
              from: ticket.departure || 'N/A',
              to: ticket.arrival || 'N/A',
              date: ticket.departureDate ? new Date(ticket.departureDate).toISOString().split('T')[0] : 'N/A',
              assignedPriority: 50 // Default priority
            };
          } catch (err) {
            console.error('Error formatting partial ticket:', err);
            return null; // Will be filtered out
          }
        }).filter(ticket => ticket !== null);
        
        // Transform final tickets
        const formattedFinalTickets = partialTickets.map(ticket => {
          try {
            return {
              class: ticket.tripType || "Economy",
              id: ticket.ticket_id || ticket._id.toString(),
              name: `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim(),
              from: ticket.departure || 'N/A',
              to: ticket.arrival || 'N/A',
              date:  'N/A',
              assignedPriority: ticket.priority || 0
            };
          } catch (err) {
            console.error('Error formatting final ticket:', err);
            return null; // Will be filtered out
          }
        }).filter(ticket => ticket !== null);
        
        // Combine both sets of tickets, avoiding duplicates based on IDs
        const allTickets = [...formattedFinalTickets];
        
        // Only add partial tickets that don't have a corresponding final ticket
        // This logic assumes ticket IDs are unique across collections
        const finalTicketIds = new Set(formattedFinalTickets.map(t => t.id));
        for (const partialTicket of formattedPartialTickets) {
          if (!finalTicketIds.has(partialTicket.id)) {
            allTickets.push(partialTicket);
          }
        }
        
        console.log(`Successfully prepared ${allTickets.length} tickets for response`);
        res.json(allTickets);
        
      } catch (err) {
        console.error('Error fetching tickets from database:', err);
        res.status(500).json({ error: "Error fetching tickets from database: " + err.message });
      }
    });
    


  app.listen(3002, () => {
          console.log("Listening on localhost:3002");

  });
