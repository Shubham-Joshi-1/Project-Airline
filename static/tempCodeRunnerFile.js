console.log("Departure:");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.post("/available_flights", async (req, res) => {
//     const { tripType,from, to, departureDate, passengers } = req.body; 
//   