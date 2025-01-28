
function getUrlParams() { 
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;

    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

// Helper function to add days to a date
function addDaysToDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Function to display flight results
function displayFlights() {
    const flightResultsDiv = document.getElementById("flightResults");
    const params = getUrlParams();

    // Display the search criteria
    flightResultsDiv.innerHTML = `<h3>Searching flights from ${params.from} to ${params.to} on ${params.date}</h3>`;

    // Generate dynamic flight data based on the search date
    const flights = [
        { from: params.from, to: params.to, date: addDaysToDate(params.date, 0), price: "$299" },
        { from: params.from, to: params.to, date: addDaysToDate(params.date, 1), price: "$199" },
        { from: params.from, to: params.to, date: addDaysToDate(params.date, 2), price: "$149" },
        { from: params.from, to: params.to, date: addDaysToDate(params.date, 3), price: "$249" }
    ];

    flights.forEach(flight => {
        const flightCard = document.createElement("div");
        flightCard.className = "flight-card";
        flightCard.innerHTML = `
            <div class="flight-details">
                <p><strong>From:</strong> ${flight.from}</p>
                <p><strong>To:</strong> ${flight.to}</p>
                <p><strong>Date:</strong> ${flight.date}</p>
            </div>
            <div class="flight-price">${flight.price}</div>
        `;

        // Navigate to user_info.html with flight details
        flightCard.onclick = function () {
            window.location.href = `user_info.html?from=${flight.from}&to=${flight.to}&date=${flight.date}&price=${flight.price}`;
        };

        flightResultsDiv.appendChild(flightCard);
    });
}

// Go back to the index page
function goBack() {
    window.location.href = "index.html";
}

// Call the function to display flights on page load
window.onload = displayFlights;
