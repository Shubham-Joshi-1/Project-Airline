#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Flight {
    string flightNumber;
    string departureCity;
    string destinationCity;
    string departureTime;
    string arrivalTime;
};

struct Ticket {
    string passengerName;
    vector<Flight> flights;
    string ticketType;
};

class AirlineManagementSystem {
private:
    vector<Flight> availableFlights;
    vector<Ticket> bookedTickets;

public:
    AirlineManagementSystem() {
        // Add some sample flights
        availableFlights.push_back({"AI101", "New York", "London", "10:00 AM", "10:00 PM"});
        availableFlights.push_back({"AI102", "London", "Paris", "1:00 PM", "3:00 PM"});
        availableFlights.push_back({"AI103", "Paris", "Berlin", "5:00 PM", "7:00 PM"});
    }

    void displayAvailableFlights() {
        cout << "\nAvailable Flights:" << endl;
        for (const auto& flight : availableFlights) {
            cout << "Flight Number: " << flight.flightNumber
                 << ", From: " << flight.departureCity
                 << ", To: " << flight.destinationCity
                 << ", Departure: " << flight.departureTime
                 << ", Arrival: " << flight.arrivalTime << endl;
        }
    }

    void bookTicket() {
        string passengerName;
        int choice;

        cout << "\nEnter passenger name: ";
        cin.ignore();
        getline(cin, passengerName);

        cout << "\nSelect ticket type:\n";
        cout << "1. One-Way Ticket\n";
        cout << "2. Return Ticket\n";
        cout << "3. Multi-City Ticket\n";
        cout << "Enter your choice: ";
        cin >> choice;

        Ticket ticket;
        ticket.passengerName = passengerName;

        switch (choice) {
        case 1:
            ticket.ticketType = "One-Way"; 
            handleOneWayBooking(ticket);
            break;
        case 2:
            ticket.ticketType = "Return";
            handleReturnBooking(ticket);
            break;
        case 3:
            ticket.ticketType = "Multi-City";
            handleMultiCityBooking(ticket);
            break;
        default:
            cout << "Invalid choice." << endl;
            return;
        }

        bookedTickets.push_back(ticket);
        cout << "\nTicket booked successfully for " << passengerName << "!\n";
    }

    void handleOneWayBooking(Ticket& ticket) {
        displayAvailableFlights();

        cout << "\nEnter flight number for your one-way trip: ";
        string flightNumber;
        cin >> flightNumber;

        for (const auto& flight : availableFlights) {
            if (flight.flightNumber == flightNumber) {
                ticket.flights.push_back(flight);
                return;
            }
        }

        cout << "Flight not found!" << endl;
    }

    void handleReturnBooking(Ticket& ticket) {
        displayAvailableFlights();

        cout << "\nEnter flight number for your departure trip: ";
        string departureFlight;
        cin >> departureFlight;

        cout << "Enter flight number for your return trip: ";
        string returnFlight;
        cin >> returnFlight;

        for (const auto& flight : availableFlights) {
            if (flight.flightNumber == departureFlight || flight.flightNumber == returnFlight) {
                ticket.flights.push_back(flight);
            }
        }

        if (ticket.flights.size() != 2) {
            cout << "Invalid flight numbers for return ticket." << endl;
        }
    }

    void handleMultiCityBooking(Ticket& ticket) {
        displayAvailableFlights();

        cout << "\nEnter the number of flights for your multi-city trip: ";
        int numFlights;
        cin >> numFlights;

        for (int i = 0; i < numFlights; ++i) {
            cout << "Enter flight number " << i + 1 << ": ";
            string flightNumber;
            cin >> flightNumber;

            bool found = false;
            for (const auto& flight : availableFlights) {
                if (flight.flightNumber == flightNumber) {
                    ticket.flights.push_back(flight);
                    found = true;
                    break;
                }
            }

            if (!found) {
                cout << "Flight not found!" << endl;
            }
        }
    }

    void viewBookedTickets() {
        cout << "\nBooked Tickets:" << endl;
        for (const auto& ticket : bookedTickets) {
            cout << "\nPassenger: " << ticket.passengerName << "\nType: " << ticket.ticketType << endl;
            for (const auto& flight : ticket.flights) {
                cout << "Flight Number: " << flight.flightNumber
                     << ", From: " << flight.departureCity
                     << ", To: " << flight.destinationCity
                     << ", Departure: " << flight.departureTime
                     << ", Arrival: " << flight.arrivalTime << endl;
            }
        }
    }
};

int main() {
    AirlineManagementSystem system;
    int option;

    do {
        cout << "\nAirline Management System:\n";
        cout << "1. View Available Flights\n";
        cout << "2. Book Ticket\n";
        cout << "3. View Booked Tickets\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        cin >> option;

        switch (option) {
        case 1:
            system.displayAvailableFlights();
            break;
        case 2:
            system.bookTicket();
            break;
        case 3:
            system.viewBookedTickets();
            break;
        case 4:
            cout << "Exiting..." << endl;
            break;
        default:
            cout << "Invalid option!" << endl;
        }
    } while (option != 4);

    return 0;
}
