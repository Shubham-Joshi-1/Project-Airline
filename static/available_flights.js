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

// Function to display flight results
function displayFlights() {
    const flightResultsDiv = document.getElementById("flightResults");
    const params = getUrlParams();

    // Display the search criteria
    flightResultsDiv.innerHTML = `<h3>Searching flights from ${params.from} to ${params.to} on ${params.date}</h3>`;

    // Dummy flight data
    const flights = [
        { from: params.from, to: params.to, date: "2025-01-30", price: "$299" },
        { from: params.from, to: params.to, date: "2025-01-31", price: "$199" },
        { from: params.from, to: params.to, date: "2025-02-01", price: "$149" },
        { from: params.from, to: params.to, date: "2025-02-02", price: "$249" }
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
        flightResultsDiv.appendChild(flightCard);
    });
}

// Call the function to display flights on page load
window.onload = displayFlights;