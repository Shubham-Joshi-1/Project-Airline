#include <iostream>
#include <unordered_map>
#include <string>
#include <sstream>
#include <vector>
// ss stands for string stream using it to perform input and output operations on strings
using namespace std;

class SeatManager
{
private:
    vector<vector<int>> economySeats;
    vector<vector<int>> businessSeats;
    int economyRows, economyCols;
    int businessRows, businessCols;
    int vipSeats;
    int vipPriorityCounter;
    int regularPriorityCounter;
    unordered_map<string, pair<string, pair<int, int>>> bookings;
    unordered_map<int, string> priorityMap;

public:
    string generateTicketID(string seatClass, int row, int col, string priority)
    {
        stringstream ss;
        ss << seatClass[0]; // 'E' for economy or 'B' for business
        if (priority == "VIP")
        {
            ss << "VIP_R" << row << "C" << col;
        }
        else
        {
            ss << "_R" << row << "C" << col;
        }
        return ss.str();
    }

    SeatManager(int econRows, int econCols, int busRows, int busCols, int vipCount)
    {
        economyRows = econRows;
        economyCols = econCols;
        businessRows = busRows;
        businessCols = busCols;
        economySeats.resize(economyRows, vector<int>(economyCols, 0));
        businessSeats.resize(businessRows, vector<int>(businessCols, 0));
        vipSeats = vipCount;
        vipPriorityCounter = 36;
        regularPriorityCounter = 26;
    }

    void displaySeatMap()
    {
        cout << "Economy Class Seat Layout:\n";
        for (int i = 0; i < economyRows; i++)
        {
            for (int j = 0; j < economyCols; j++)
            {
                cout << (economySeats[i][j] == 0 ? "O" : "X") << " ";
            }
            cout << endl;
        }

        cout << "\nBusiness Class Seat Layout:\n";
        for (int i = 0; i < businessRows; i++)
        {
            for (int j = 0; j < businessCols; j++)
            {
                cout << (businessSeats[i][j] == 0 ? "O" : "X") << " ";
            }
            cout << endl;
        }
    }

    bool allocateSeat(string seatClass, int row, int col, string priority)
    {
        row -= 1; // Convert to zero-based indexing
        col -= 1; // Convert to zero-based indexing

        if (seatClass == "economy")
        {
            if (row >= economyRows || col >= economyCols || row < 0 || col < 0)
            {
                cout << "Invalid seat selection for Economy class.\n";
                return false;
            }
            if (economySeats[row][col] == 0)
            {
                economySeats[row][col] = 1;
                string ticketID = generateTicketID(seatClass, row + 1, col + 1, priority);
                bookings[ticketID] = {seatClass, {row + 1, col + 1}};

                if (priority == "VIP")
                {
                    priorityMap[vipPriorityCounter] = ticketID;
                    vipPriorityCounter--;
                }
                else
                {
                    priorityMap[regularPriorityCounter] = ticketID;
                    regularPriorityCounter--;
                }
                int assiginedPriority = assignPriority(priority);
                cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Economy booked successfully with Ticket ID: " << ticketID << " AND Priority :" << assiginedPriority << endl;
                return true;
            }
            else
            {
                cout << "Seat is already booked in Economy class.\n";
                return false;
            }
        }
        else if (seatClass == "business")
        {
            if (row >= businessRows || col >= businessCols || row < 0 || col < 0)
            {
                cout << "Invalid seat selection for Business class.\n";
                return false;
            }
            if (businessSeats[row][col] == 0)
            {
                businessSeats[row][col] = 1;
                string ticketID = generateTicketID(seatClass, row + 1, col + 1, priority);
                bookings[ticketID] = {seatClass, {row + 1, col + 1}};

                if (priority == "VIP")
                {
                    priorityMap[vipPriorityCounter] = ticketID;
                    vipPriorityCounter--;
                }
                else
                {
                    priorityMap[regularPriorityCounter] = ticketID;
                    regularPriorityCounter--;
                }
                int assiginedPriority = assignPriority(priority);
                cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Business booked successfully with Ticket ID: " << ticketID << " AND Priority :" << assiginedPriority << endl;
                return true;
            }
            else
            {
                cout << "Seat is already booked in Business class.\n";
                return false;
            }
        }
        else
        {
            cout << "Invalid seat class.\n";
            return false;
        }
    }

    int assignPriority(string memberType)
    {
        if (memberType == "VIP")
        {
            if (vipPriorityCounter >= 27)
            {
                cout << "VIP assigned priority: " << vipPriorityCounter << endl;
                return vipPriorityCounter;
            }
            else
            {
                cout << "No VIP seats available. Regular priority assigned.\n";
                return 0;
            }
        }
        else
        {
            if (regularPriorityCounter > 0)
            {
                cout << "Regular member assigned priority: " << regularPriorityCounter << endl;
                return regularPriorityCounter;
            }
            else
            {
                cout << "No Regular seats available.\n";
                return 0;
            }
        }
    }

    bool freeSeat(string ticketID)
    {
        if (bookings.find(ticketID) != bookings.end())
        {
            string seatClass = bookings[ticketID].first;
            int row = bookings[ticketID].second.first;
            int col = bookings[ticketID].second.second;

            if (seatClass == "economy")
            {
                economySeats[row - 1][col - 1] = 0;
            }
            else if (seatClass == "business")
            {
                businessSeats[row - 1][col - 1] = 0;
            }

            if (ticketID.find("VIP") != string::npos)
            {
                vipPriorityCounter++;
            }
            else
            {
                regularPriorityCounter++;
            }

            bookings.erase(ticketID);
            cout << "Seat [" << row << "][" << col << "] in " << seatClass << " class is now available.\n";
            return true;
        }
        else
        {
            cout << "No booking found for Ticket ID: " << ticketID << endl;
            return false;
        }
    }

    void displayVipStatus()
    {
        cout << "VIP Seats Left: " << (vipPriorityCounter - 26) << endl;
    }

    void displayRegularStatus()
    {
        cout << "Regular Seats Left: " << regularPriorityCounter << endl;
    }

    bool cancelBooking(string ticketID, CustomerHashMap &customerMap) {
    // Check if the booking exists
    if (bookings.find(ticketID) == bookings.end()) {
        cout << "No booking found for Ticket ID: " << ticketID << endl;
        return false;
    }

    // Retrieve booking details
    string seatClass = bookings[ticketID].first;
    int row = bookings[ticketID].second.first;
    int col = bookings[ticketID].second.second;

    // Free the seat in SeatManager
    if (freeSeat(ticketID)) {
        // Remove the customer record
        customerMap.removeCustomer(ticketID);

        // Update priority counters
        if (ticketID.find("VIP") != string::npos) {
            vipPriorityCounter++;
        } else {
            regularPriorityCounter++;
        }

        cout << "Booking with Ticket ID: " << ticketID << " has been successfully canceled.\n";
        return true;
    }
    

    
}

};

class CustomerDetails
{
public:
    string name;
    string contact;
    string email;
    string ticketID;
    string seatClass;
    int row, col;
    int priority;

    // Constructor
    CustomerDetails(const string &name, const string &contact, const string &email,
                    const string &ticketID, const string &seatClass, int row, int col, int priority)
        : name(name), contact(contact), email(email), ticketID(ticketID), seatClass(seatClass), row(row), col(col), priority(priority) {}

    // Display Customer Info
    void display() const
    {
        cout << "Name: " << name << "\nContact: " << contact << "\nEmail: " << email
             << "\nTicket ID: " << ticketID << "\nSeat Class: " << seatClass
             << "\nRow: " << row + 1 << "\nColumn: " << col + 1 << "\nPriority: " << priority << "\nSeat Type : " << ((col == 1 || col == 4) ? "Window" : "Aisle") << endl;
    }
};

class CustomerHashMap
{
private:
    unordered_map<string, CustomerDetails> customerMap; // Unordered map with ticket ID as key
    unordered_map<int, string> priorityMap;

public:
    // Emplace customer record directly into the map
    void addCustomer(const string &ticketID, const string &name, const string &contact,
                     const string &email, const string &seatClass, int row, int col, int priority)
    {
        customerMap.emplace(ticketID, CustomerDetails(name, contact, email, ticketID, seatClass, row, col, priority));
        priorityMap[priority] = ticketID;
    }

    // Display customer details by ticket ID
    void getCustomerByTicketID(const string &ticketID) const
    {
        auto it = customerMap.find(ticketID);
        if (it != customerMap.end())
        {
            it->second.display(); // Call the display method of CustomerDetails
        }
        else
        {
            cout << "No customer found with Ticket ID: " << ticketID << endl;
        }
    }

    void getCustomerByPriority(int priority) const
    {
        auto pr = priorityMap.find(priority);
        if (pr != priorityMap.end())
        {
            string ticketID = pr->second;
            auto it = customerMap.find(ticketID);
            if (it != customerMap.end())
            {
                it->second.display();
            }
        }
        else
        {
            cout << "No customer found with Priority: " << priority << endl;
        }
        
    }

    void removeCustomer(const string &ticketID) {
    auto it = customerMap.find(ticketID);
    if (it != customerMap.end()) {
        customerMap.erase(it);
        cout << "Customer record for Ticket ID: " << ticketID << " has been removed.\n";
    } else {
        cout << "No customer record found for Ticket ID: " << ticketID << endl;
    }

}
friend void cancelBooking();
};

int main()
{
    SeatManager manager(6, 4, 3, 4, 10);
    CustomerHashMap customerMap;

    int choice;
    string seatClass, preference, memberType, name, contact, email, ticketID;
    int row, col, priority;

    do
    {
        cout << "\nMenu:\n";
        cout << "1. Display Seat Map\n";
        cout << "2. Book a Seat\n";
        cout << "3. Free a Seat\n";
        cout << "4. Display VIP Status\n";
        cout << "5. Display Regular Status\n";
        cout << "6. Check Booking Status\n";
        cout << "7. Check Booking by Priority\n";
        cout << "8. Exit\n";
        cout << "9. Cancel a Booking\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice)
        {
        case 1:
        {
            cout << "Displaying seat map.\n";
            manager.displaySeatMap();
            break;
        }
        case 2:
        {
            cin.ignore();
            cout << "Enter Name: ";
            getline(cin, name);
            cout << "Enter Contact: ";
            cin >> contact;
            cout << "Enter Email: ";
            cin >> email;
            manager.displaySeatMap();
            cout << "Enter seat class (economy/business): ";
            cin >> seatClass;
            cout << "Enter row and column (1-based): ";
            cin >> row >> col;
            cout << "Enter member type (VIP/Regular): ";
            cin >> memberType;

            // Book the seat and create customer record
            if (manager.allocateSeat(seatClass, row, col, memberType))
            {
                priority = manager.assignPriority(memberType);
                string ticketID = manager.generateTicketID(seatClass, row, col, memberType);
                CustomerDetails customer(name, contact, email, ticketID, seatClass, row, col, priority);
                customerMap.addCustomer(ticketID, name, contact, email, seatClass, row, col, priority);
            }
            break;
        }
        case 3:
        {
            cout << "Freeing a seat.\n";
            cout << "Enter Ticket ID: ";
            string ticketID;
            cin >> ticketID;
            manager.freeSeat(ticketID);
            break;
        }
        case 4:
        {
            cout << "Displaying VIP seat status.\n";
            manager.displayVipStatus();
            break;
        }
        case 5:
        {
            cout << "Displaying Regular seat status.\n";
            manager.displayRegularStatus();
            break;
        }
        case 6:
        {
            cout << "Enter Ticket ID to check booking status: ";
            cin >> ticketID;
            customerMap.getCustomerByTicketID(ticketID);
            break;
        }
        case 7:
        {
            cout << "Checking booking details by Priority Number.\n";
            cout << "Enter Priority Number: ";
            cin >> priority;
            customerMap.getCustomerByPriority(priority);
            break;
        }
        case 8:
        {
            cout << "Exiting the program. Thank you!\n";
            break;
        }
        case 9:
        {
            cout << "Canceling a booking.\n";
            cout << "Enter Ticket ID to cancel: ";
            cin >> ticketID;

            if (manager.cancelBooking(ticketID, customerMap))
            {
                cout << "Booking canceled successfully.\n";
            }
            else
            {
                cout << "Failed to cancel the booking.\n";
            }
            break;
        }
        default:
        {
            cout << "Invalid choice. Please select a valid option.\n";
        }
        }
    } while (choice != 8);

    return 0;
}