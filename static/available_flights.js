function setPageBackground() {
    // Array of travel/sky background images
    const backgroundImages = [
        './assets/bg-flights.webp'
    ];
    
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    document.body.style.backgroundImage = `url('${backgroundImages[randomIndex]}')`;
    
    // Add fallback in case image doesn't load
    const img = new Image();
    img.onerror = function() {
        // If image fails to load, use a gradient background
        document.body.style.backgroundImage = 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)';
    };
    img.src = backgroundImages[randomIndex];
}

 // Function to fetch and display flights
  async function displayFlights() {
    const flightResultsDiv = document.getElementById("flightResults");
    
    // Get stored search data from sessionStorage (sent from searchForm)
    const storedData = sessionStorage.getItem("flightResults");
    if (!storedData) {
        flightResultsDiv.innerHTML = "<p>No flights found. Please try a different search.</p>";
        return;
    }
    
    // Parse stored flight data
    const flightResults = JSON.parse(storedData);
    
    // Display search criteria
    flightResultsDiv.innerHTML = `<h3>Available Flights from ${flightResults[0]?.departure} to ${flightResults[0]?.arrival}</h3>`;
    
    // Array of airplane image URLs - Use your own image URLs here
    const airplaneImages = [
       './assets/travel-card.jpg'
    ];
    
    // Display flight results dynamically
    flightResults.forEach((flight, index) => {
        const flightCard = document.createElement("div");
        flightCard.className = "flight-card";
        
        // Format the date to be more readable
        const flightDate = new Date(flight.departureDate);
        const formattedDate = flightDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        flightCard.innerHTML = `
            <div class="flight-details">
                <p><strong>From:</strong> ${flight.departure}</p>
                <p><strong>To:</strong> ${flight.arrival}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
            <div class="flight-price">₹${flight.price}</div>
        `;
        
        // Set the background image using JavaScript
        // Use inline CSS to set the background image
        const imageIndex = index % airplaneImages.length;
        flightCard.style.backgroundImage = `url('${airplaneImages[imageIndex]}')`;
        flightCard.style.backgroundSize = 'cover';
        flightCard.style.backgroundPosition = 'center';
        
        // Add local images as fallback in case remote images don't load
        flightCard.addEventListener('error', function() {
            // If external image fails, create a dynamic background with CSS
            flightCard.style.backgroundColor = '#e6f2ff';
            flightCard.style.backgroundImage = 'none';
        });
        
        // Navigate to user_info.html with flight details
        flightCard.onclick = function() {
            // Add a quick animation before navigating
            this.style.transform = "scale(0.98)";
            setTimeout(() => {
                window.location.href = `user_info.html?from=${flight.departure}&to=${flight.arrival}&date=${flight.departureDate}&price=${flight.price}`;
            }, 200);
        };
        
        flightResultsDiv.appendChild(flightCard);
    });
    
    // Alternative approach: Create a CSS style with embedded base64 images
    // In case the above method doesn't work
    createFallbackStyles();
}

// Function to create fallback background styles using CSS
function createFallbackStyles() {
    // Create a style element
    const style = document.createElement('style');
    
    // CSS with embedded airplane pattern
    style.textContent = `
        .flight-card.fallback {
            // background-color: #e6f7ff !important;
           // background-image: 
                // repeating-linear-gradient(45deg, 
                //     rgba(0, 115, 230, 0.05), 
                //     rgba(0, 115, 230, 0.05) 10px, 
                //     rgba(0, 115, 230, 0.08) 10px, 
                //     rgba(0, 115, 230, 0.08) 20px) !important;
        }
        
        // .flight-card.fallback::after {
        //     content: "✈";
        //     position: absolute;
        //     bottom: 15px;
        //     right: 15px;
        //     font-size: 36px;
        //     color: rgba(0, 115, 230, 0.15);
        //     z-index: 1;
        // }
    `;
    
    // Add the style to the document
    document.head.appendChild(style);
    
    // Check if images failed to load after a delay
    setTimeout(() => {
        document.querySelectorAll('.flight-card').forEach(card => {
            // If backgroundImage is empty or has an error, apply fallback
            if (!card.style.backgroundImage || 
                card.style.backgroundImage === 'none') {
                card.classList.add('fallback');
            }
        });
    }, 2000);
}

// Go back to the index page
function goBack() {
    window.location.href = "index.html";
}

// Call the function to display flights on page load
window.onload = function() {

    // Set the background image for the page
    setPageBackground();
    // Simulate loading delay for better UX
    setTimeout(displayFlights, 800);
};