const mongoose= require("mongoose");
const seat_layout_schema = new mongoose.Schema({ 
    row: Number,
    col: Number, 
    member_type: String,  
    ticketId: String,
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
    memberType:String,
    gender: String,
    dob: Date,
    sessionId: String,
    tripType:String,
    flight_name: String,
    flight_no: Number,
    flight_price:Number,
    row:Number,
    col:Number ,
    ticketId:String,
    assignedPriority:Number   
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
    assignedPriority:Number
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
  module.exports = {
    Seat,
    pTicket,
    fTicket,
    Admin,
    Priority
  };