document.addEventListener("DOMContentLoaded", function () {
    const checkTicketStatusButton = document.getElementById("check-ticket-status");
    const ticketStatusSection = document.getElementById("ticket-status-section");
    const ticketDetails = document.getElementById("ticket-details");
    const submitTicketIdButton = document.getElementById("submit-ticket-id");
    const cancelTicketButton = document.getElementById("cancel-ticket");

    // Prevent form submission when clicking the "Check Ticket Status" button
    checkTicketStatusButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission
        ticketStatusSection.style.display = "block";
        ticketDetails.style.display = "none";
    });

    submitTicketIdButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission
        const ticketId = document.getElementById("ticket-id").value;
        if (ticketId) {
            // Display dummy ticket details
            document.getElementById("ticket-id-display").textContent = ticketId;
            ticketDetails.style.display = "block";
        } else {
            alert("Please enter a valid Ticket ID.");
        }
    });

    cancelTicketButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission
        if (confirm("Are you sure you want to cancel this ticket?")) {
            alert("Ticket canceled successfully.");
            ticketStatusSection.style.display = "none";
            ticketDetails.style.display = "none";
        }
    });
});



const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli",
    "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
    "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur",
    "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Mysore", "Moradabad", "Gurgaon",
    "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Thiruvananthapuram",
    "Bhiwandi", "Saharanpur", "Guntur", "Amravati", "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack",
    "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded",
    "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
    "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon",
    "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Kurnool", "Rajpur Sonarpur",
    "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar",
    "Bhatpara", "Panihati", "Latur", "Dhule", "Rohtak", "Korba", "Bhilwara", "Brahmapur", "Muzaffarpur",
    "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", "Shahjahanpur",
    "Satara", "Bijapur", "Rampur", "Shimoga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman",
    "Kulti", "Kakinada", "Nizamabad", "Parbhani", "Tumkur", "Hisar", "Ozhukarai", "Bihar Sharif", "Panipat",
    "Darbhanga", "Bally", "Aizawl", "Dewas", "Ichalkaranji", "Tirupati", "Karnal", "Bathinda", "Jalna",
    "Eluru", "Barasat", "Kirari Suleman Nagar", "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", "Sagar",
    "Rourkela Industrial Township", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Karimnagar", "Anantapur",
    "Etawah", "Ambernath", "North Dumdum", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", "Baranagar",
    "Tiruvottiyur", "Pondicherry", "Sikar", "Thoothukudi", "Rewa", "Mirzapur", "Raichur", "Pali", "Khammam",
    "Vizianagaram", "Katihar", "Haridwar", "Sri Ganganagar", "Karawal Nagar", "Nagercoil", "Mango", "Bulandshahr",
    "Thanjavur", "Uluberia", "Murwara", "Sambhal", "Singrauli", "Nadiad", "Secunderabad", "Naihati", "Yamunanagar",
    "Bidhannagar", "Pallavaram", "Bidar", "Munger", "Panchkula", "Burhanpur", "Raurkela", "Kharagpur", "Dindigul",
    "Gandhinagar", "Hospet", "Nangloi Jat", "Malda", "Ongole", "Deoghar", "Chapra", "Haldia", "Khandwa", "Nandyal",
    "Morena", "Amroha", "Anand", "Bhind", "Bhalswa Jahangir Pur", "Madhyamgram", "Bhiwani", "Berhampur", "Ambala",
    "Morbi", "Fatehpur", "Raebareli", "Khora, Ghaziabad", "Chittoor", "Bhusawal", "Orai", "Bahraich", "Phusro",
    "Vellore", "Mehsana", "Raiganj", "Sirsa", "Danapur", "Serampore", "Sultan Pur Majra", "Guna", "Jaunpur",
    "Panvel", "Shivpuri", "Surendranagar Dudhrej", "Unnao", "Chinsurah", "Alappuzha", "Kottayam", "Machilipatnam",
    "Shimla", "Adoni", "Udupi", "Tenali", "Proddatur", "Saharsa", "Hindupur", "Sasaram", "Hajipur", "Bhimavaram",
    "Chandigarh", "Bongaigaon", "Dibrugarh", "Kumbakonam", "Pithampur", "Nabadwip", "Hazaribagh", "Bhimavaram",
    "Chandigarh", "Bongaigaon", "Dibrugarh", "Kumbakonam", "Pithampur", "Nabadwip", "Hazaribagh"
];
function autocomplete(input, suggestions) {
    let currentFocus;
    input.addEventListener("input", function () {
        let list, item, val = this.value;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        list = document.createElement("div");
        list.setAttribute("id", this.id + "-autocomplete-list");
        list.setAttribute("class", "autocomplete-suggestions");
        this.parentNode.appendChild(list);
        for (let i = 0; i < suggestions.length; i++) {
            if (suggestions[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                item = document.createElement("div");
                item.innerHTML = "<strong>" + suggestions[i].substr(0, val.length) + "</strong>";
                item.innerHTML += suggestions[i].substr(val.length);
                item.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
                item.addEventListener("click", function () {
                    input.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                list.appendChild(item);
            }
        }
    });

    input.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "-autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-suggestions");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    autocomplete(document.getElementById("from-city"), cities);
    autocomplete(document.getElementById("to-city"), cities);
});


document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split("T")[0];
    document.getElementById("flight-date").setAttribute("min", today);
});

document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const departure = document.getElementById("from-city").value;
        const arrival = document.getElementById("to-city").value;
        const departureDate = document.getElementById("flight-date").value;
        // const returnDateValue = document.getElementById("returnDate").value;
        // const passengers = document.getElementById("passengers").value;
        // const tripType = document.querySelector('input[name="tripType"]:checked').value;

        let requestData = {
            departure, 
            arrival, 
            departureDate, 
            // returnDate: returnDateValue, 
            // passengers, 
            // tripType
        };

        console.log("Sending request:", requestData);

        fetch("http://localhost:3002/available_flights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Received flight data:", data);

            // ✅ Ensure response is an array
            if (!Array.isArray(data)) {
                console.error("Expected an array but got:", data);
                return;
            }

            sessionStorage.setItem("flightResults", JSON.stringify(data));
            window.location.href = "available_flights.html";
        })
        .catch(error => console.error("Error:", error));
    });
});
