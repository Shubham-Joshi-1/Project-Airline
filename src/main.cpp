#include<iostream>
#include <queue>
#include <vector>
using namespace std;
class Priority{
    public:
    priority_queue<int, vector<int>, greater<int>> pq;
    void checkP(int priority){
        if (priority ==0){
            cout<<"standard Booking"<<endl;
        }
        else if (priority ==1){
            cout<<"Vip Booking"<<endl;
        }
        else{
            cout<<"Internal error"<<endl;
        }
    }
    void Book(int Booking){                            
        if(pq.size()==10){
            cout<<" Bookings Full!"<<endl;
            return;
        }
        else{
            pq.push(Booking);
            cout<<"Booking added"<<endl;
        }
    }    
    void Cancellation(){                            
        if(pq.empty()){
            cout<<"NO Bookings yet!"<<endl;
            return;
        }
        else{
            pq.pop();
            cout<<"Cancellation Succesfull"<<endl;
        }
    }    
};
int main() {
    int priority=1;
    int Booking=10;
    Priority obj;
    obj.checkP(priority);
    obj.Cancellation();
    obj.Book(Booking);
    return 0;
}