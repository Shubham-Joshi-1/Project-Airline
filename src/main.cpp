#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream> // ss stands for string stream using it to perform input and output operations on strings
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

public:
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
                cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Economy booked successfully with Ticket ID: " << ticketID << " AND Priority :"<< assiginedPriority+1 <<endl;
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
                cout << "Seat [" << row + 1 << "][" << col + 1 << "] in Business booked successfully with Ticket ID: " << ticketID << " AND Priority :"<< assiginedPriority+1 <<endl;
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

    bool allocatePreferredSeat(string seatClass, string preference, string priority)
    {
        vector<vector<int>> &seatMap = (seatClass == "economy") ? economySeats : businessSeats;
        int rows = (seatClass == "economy") ? economyRows : businessRows;
        int cols = (seatClass == "economy") ? economyCols : businessCols;

        if (preference == "window")
        {
            for (int i = 0; i < rows; i++)
            {
                if (seatMap[i][0] == 0)
                {
                    return allocateSeat(seatClass, i + 1, 1, priority);
                }
                if (seatMap[i][cols - 1] == 0)
                {
                    return allocateSeat(seatClass, i + 1, cols, priority);
                }
            }
        }
        else if (preference == "aisle")
        {
            for (int i = 0; i < rows; i++)
            {
                for (int j = 1; j < cols - 1; j++)
                {
                    if (seatMap[i][j] == 0)
                    {
                        return allocateSeat(seatClass, i + 1, j + 1, priority);
                    }
                }
            }
        }
        cout << "No preferred seats available in " << seatClass << " class.\n";
        return false;
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

    void checkBookingStatus()
    {
        string ticketID;
        cout << "Enter your Ticket ID: ";
        cin >> ticketID;

        if (bookings.find(ticketID) != bookings.end())
        {
            string seatClass = bookings[ticketID].first;
            int row = bookings[ticketID].second.first;
            int col = bookings[ticketID].second.second;
            bool isVIP = (ticketID[1] == 'V');

            cout << "Booking Details:\n";
            cout << "Ticket ID: " << ticketID << "\n";
            cout << "Seat Class: " << seatClass << "\n";
            cout << "Row: " << row << "\n";
            cout << "Column: " << col << "\n";
            cout << "Seat Type : " << ((col == 1 || col == economyCols) ? "Window" : "Aisle") << "\n";
            cout << "Member Type: " << (isVIP ? "VIP" : "Regular") << "\n";
        }
        else
        {
            cout << "No booking found for Ticket ID: " << ticketID << endl;
        }
    }

    void checkBookingByPriority()
    {
        int priorityNo;
        cout << "Enter Priority Number: ";
        cin >> priorityNo;

        if (priorityMap.find(priorityNo) != priorityMap.end())
        {
            string ticketID = priorityMap[priorityNo];
            if (bookings.find(ticketID) != bookings.end())
            {
                string seatClass = bookings[ticketID].first;
                int row = bookings[ticketID].second.first;
                int col = bookings[ticketID].second.second;
                bool isVIP = (ticketID[1] == 'V');

                cout << "Booking Details:\n";
                cout << "Priority Number: " << priorityNo << "\n";
                cout << "Ticket ID: " << ticketID << "\n";
                cout << "Seat Class: " << seatClass << "\n";
                cout << "Row: " << row << "\n";
                cout << "Column: " << col << "\n";
                cout << "Seat Type : " << ((col == 1 || col == economyCols) ? "Window" : "Aisle") << "\n";
                cout << "Member Type: " << (isVIP ? "VIP" : "Regular") << "\n";
            }
        }
        else
        {
            cout << "No booking found for Priority Number: " << priorityNo << endl;
        }
    }
};

int main()
{
    SeatManager manager(6, 4, 3, 4, 10);

    int choice;
    string seatClass, preference, memberType;
    int row, col;

    do
    {
        cout << "\nMenu:\n";
        cout << "1. Display Seat Map\n";
        cout << "2. Book a Specific Seat\n";
        cout << "3. Book a Preferred Seat\n";
        cout << "4. Free a Seat\n";
        cout << "5. Display VIP Status\n";
        cout << "6. Display Regular Status\n";
        cout << "7. Check Booking Status\n";
        cout << "8. Check Booking by Priority\n";
        cout << "9. Exit\n";
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
            cout << "Allocating specific seat.\n";
            cout << "Enter seat class (economy/business): ";
            cin >> seatClass;
            cout << "Enter row and column: ";
            cin >> row >> col;
            cout << "Enter member type (VIP/Regular): ";
            cin >> memberType;
            manager.allocateSeat(seatClass, row, col, memberType);
            break;
        }
        case 3:
        {
            cout << "Allocating preferred seat.\n";
            cout << "Enter seat class (economy/business): ";
            cin >> seatClass;
            cout << "Enter preference (window/aisle): ";
            cin >> preference;
            cout << "Enter member type (VIP/Regular): ";
            cin >> memberType;
            manager.allocatePreferredSeat(seatClass, preference, memberType);
        
            break;
        }
        case 4:
        {
            cout << "Freeing a seat.\n";
            cout << "Enter Ticket ID: ";
            string ticketID;
            cin >> ticketID;
            manager.freeSeat(ticketID);
            break;
        }
        case 5:
        {
            cout << "Displaying VIP seat status.\n";
            manager.displayVipStatus();
            break;
        }
        case 6:
        {
            cout << "Displaying Regular seat status.\n";
            manager.displayRegularStatus();
            break;
        }
        case 7:
        {
            cout << "Checking booking status by Ticket ID.\n";
            manager.checkBookingStatus();
            break;
        }
        case 8:
        {
            cout << "Checking booking details by Priority Number.\n";
            manager.checkBookingByPriority();
            break;
        }
        case 9:
        {
            cout << "Exiting the program. Thank you!\n";
            break;
        }
        default:
        {
            cout << "Invalid choice. Please select a valid option.\n";
        }
        }
    } while (choice != 9);

    return 0;
}

