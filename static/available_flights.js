// Function to fetch and display flights
async function displayFlights() {
    const flightResultsDiv = document.getElementById("flightResults");

    // Get stored search data from sessionStorage (sent from searchForm)
    const storedData = sessionStorage.getItem("flightResults");
    if (!storedData) {
        flightResultsDiv.innerHTML = "<p>No flights found.</p>";
        return;
    }

    // Parse stored flight data
    const flightResults = JSON.parse(storedData);

    // Display search criteria
    flightResultsDiv.innerHTML = `<h3>Available Flights from ${flightResults[0]?.departure} to ${flightResults[0]?.arrival}</h3>`;

    // Display flight results dynamically
    flightResults.forEach(flight => {
        const flightCard = document.createElement("div");
        flightCard.className = "flight-card";
        flightCard.innerHTML = `
            <div class="flight-details">
                <p><strong>From:</strong> ${flight.departure}</p>
                <p><strong>To:</strong> ${flight.arrival}</p>
                <p><strong>Date:</strong> ${flight. departureDate}</p>
            </div>
            <div class="flight-price">₹${flight.price}</div>
        `;

        // Navigate to user_info.html with flight details
        flightCard.onclick = function () {
            window.location.href = `user_info.html?from=${flight.departure}&to=${flight.arrival}&date=${flight. departureDate}&price=${flight.price}`;
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
