#include <iostream>
#include <unordered_map>
#include <string>
#include <sstream>

#include<vector>
#include <queue>
#include <tuple>
#include <algorithm>

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

                //cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Economy booked successfully with Ticket ID: " << ticketID << " AND Priority :"<< assiginedPriority+1 <<endl;


               

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


                //cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Business booked successfully with Ticket ID: " << ticketID << " AND Priority :"<< assiginedPriority+1 <<endl;


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

                // cout << "VIP assigned priority: " << vipPriorityCounter << endl;

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

                // cout << "Regular member assigned priority: " << regularPriorityCounter << endl;

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


public:
    string name;
    string contact;
    string email;
    string ticketID;
    string seatClass;
    int row, col;
    int priority;

    // Constructor

    CustomerDetails(const string& name, const string& contact, const string& email,
                    const string& ticketID, const string& seatClass, int row, int col,int priority)
        : name(name), contact(contact), email(email), ticketID(ticketID), seatClass(seatClass), row(row), col(col),priority(priority) {}

    // Display Customer Info
    void display() const {
        cout << "Name: " << name << "\nContact: " << contact << "\nEmail: " << email
             << "\nTicket ID: " << ticketID << "\nSeat Class: " << seatClass
             << "\nRow: " << row + 1 << "\nColumn: " << col + 1<<"\nPriority: "<<priority<< "\nSeat Type : " << ((col == 1 || col == 4) ? "Window" : "Aisle")  << endl;
    }
};

class CustomerHashMap {
private:
    unordered_map<string, CustomerDetails> customerMap;  // Unordered map with ticket ID as key
    unordered_map<int, string> priorityMap;
public:
    // Emplace customer record directly into the map
    void addCustomer(const string& ticketID, const string& name, const string& contact,
                     const string& email, const string& seatClass, int row, int col,int priority) {
        customerMap.emplace(ticketID, CustomerDetails(name, contact, email, ticketID, seatClass, row, col,priority));
        priorityMap[priority] = ticketID;   
    }

    // Display customer details by ticket ID
    void getCustomerByTicketID(const string& ticketID) const {
        auto it = customerMap.find(ticketID);
        if (it != customerMap.end()) {
            it->second.display();  // Call the display method of CustomerDetails
        } else {

            cout << "No customer found with Ticket ID: " << ticketID << endl;
        }
    }


    void getCustomerByPriority(int priority) const {
        auto pr = priorityMap.find(priority);
        if (pr != priorityMap.end()) {
            string ticketID = pr->second;
            auto it = customerMap.find(ticketID);
            if (it != customerMap.end()) {
                it->second.display();
            }
        } else {
            cout << "No customer found with Priority: " << priority << endl;
        }
    }
    void removeCustomer(const string& ticketID) {
        auto it = customerMap.find(ticketID);
        if (it != customerMap.end()) {
            customerMap.erase(it);
            cout << "Customer record for Ticket ID: " << ticketID << " has been removed.\n";
        } else {
            cout << "No customer record found for Ticket ID: " << ticketID << endl;
        }
    }
    };



// Comparator for the priority queue (higher priority first)
struct BookingComparator {
    bool operator()(const tuple<int, string, string, string, string, int, int>& a,
                    const tuple<int, string, string, string, string, int, int>& b) {
        return get<0>(a) < get<0>(b); // Higher priority first
    }
};

class BookingRequestManager {
private:
    int currentRegularPriority = 26;
    int currentVIPPriority = 36;

    priority_queue<tuple<int, string, string, string, string, int, int>,
                   vector<tuple<int, string, string, string, string, int, int>>,
                   BookingComparator>
        economyQueue;

    priority_queue<tuple<int, string, string, string, string, int, int>,
                   vector<tuple<int, string, string, string, string, int, int>>,
                   BookingComparator>
        businessQueue;

    SeatManager& seatManager;        
    CustomerHashMap& customerMap;

public:
    BookingRequestManager(SeatManager& sm, CustomerHashMap& cm)
        : seatManager(sm), customerMap(cm) {}

    void addBookingRequest(const string& name, const string& contact, const string& email, 
                       const string& seatClass, int row, int col, const string& memberType){
 
        int priority = 0;
        
        if (memberType == "VIP") {
            priority = currentVIPPriority--;
        } else if (memberType == "Regular") {
            priority = currentRegularPriority--;
        } else {
            cout << "Invalid member type. Booking request not added.\n";
            return;
        }

        if (seatClass == "economy") {
            economyQueue.emplace(priority, name, contact, email, seatClass, row, col);
        } else if (seatClass == "business") {
            businessQueue.emplace(priority, name, contact, email, seatClass, row, col);
        } else {
            cout << "Invalid seat class. Booking request not added.\n";
            return;
        }

        cout << "Booking request added for " << name << " with priority " << priority
             << " in " << seatClass << " class.\n";
    }

    void processBookingRequests(const string& seatClass) {
        priority_queue<tuple<int, string, string, string, string, int, int>,
                       vector<tuple<int, string, string, string, string, int, int>>,
                       BookingComparator>& queue =
            (seatClass == "economy") ? economyQueue : businessQueue;

        if (queue.empty()) {
            cout << "No pending booking requests in " << seatClass << " class.\n";
            return;
        }

        cout << "Processing " << seatClass << " class booking requests...\n";

        while (!queue.empty()) {
            auto request = queue.top();
            queue.pop();

            int priority = get<0>(request);
            string name = get<1>(request);
            string contact = get<2>(request);
            string email = get<3>(request);
            int row = get<5>(request);
            int col = get<6>(request);

            if (seatManager.allocateSeat(seatClass, row, col, priority >= 27 ? "VIP" : "Regular")) {
                string ticketID = seatManager.generateTicketID(seatClass, row, col, priority >= 27 ? "VIP" : "Regular");

                customerMap.addCustomer(ticketID, name, contact, email, seatClass, row, col, priority);
                cout << "Booking confirmed for Seat [" << row << "][" << col  << "] for " << name << " with Ticket ID: " << ticketID
                     << " and Priority: " << priority << endl;
            } else {
                cout << "Seat allocation failed for " << name << ". Seat might already be booked.\n";
            }
        }
    }

    void displayPendingRequests(const string& seatClass) const {
        const auto& queue = (seatClass == "economy") ? economyQueue : businessQueue;

        if (queue.empty()) {
            cout << "No pending booking requests in " << seatClass << " class.\n";
            return;
        }

        cout << "Pending Booking Requests in " << seatClass << " class:\n";

        auto tempQueue = queue;
        while (!tempQueue.empty()) {
            auto request = tempQueue.top();
            tempQueue.pop();

            int priority = get<0>(request);
            string name = get<1>(request);
            int row = get<5>(request);
            int col = get<6>(request);

            cout << "Name: " << name << ", Priority: " << priority
                 << ", Seat: Row " << row << ", Col " << col << endl;
        }
    }
};




int main()
{
    SeatManager manager(6, 4, 3, 4, 10);
    CustomerHashMap customerMap;

    BookingRequestManager bookingManager(manager, customerMap);

    int choice;
    string seatClass, preference, memberType,name,contact,email,ticketID;
    int row, col,priority;


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

        cout << "8. Process Booking Requests (by Class)\n";
        cout << "9. View Pending Booking Requests (by Class)\n";
        cout << "10. Exit\n";

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
        case 2: {
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

    int priority = manager.assignPriority(memberType);
    bookingManager.addBookingRequest(name, contact, email, seatClass, row, col, memberType);


    cout << "Booking request added. Admin needs to confirm the booking.\n";
    break;
}

        case 3:
            {
                cout << "Freeing a seat.\n";
                cout << "Enter Ticket ID: ";
                string ticketID;
                cin >> ticketID;
                customerMap.removeCustomer(ticketID);
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
        case 8: {
            cout << "Enter seat class to process (economy/business): ";
            string seatClass;
            cin >> seatClass;
            bookingManager.processBookingRequests(seatClass);
            break;
        }
        case 9: {
            cout << "Enter seat class to view requests (economy/business): ";
            string seatClass;
            cin >> seatClass;
            bookingManager.displayPendingRequests(seatClass);
            break;
        }
        case 10:
            {
                cout << "Exiting the program. Thank you!\n";
                break;
            }
        default:
            {
                cout << "Invalid choice. Please select a valid option.\n";
            }
        
        } 
    }while (choice != 10);

    return 0;
}