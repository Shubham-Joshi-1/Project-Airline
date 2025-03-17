// API endpoint configurations
const API_ENDPOINT = '/api/tickets'; // Change this to your actual API endpoint
        
// Keep track of current tickets
let currentTickets = [];

// Function to create a ticket element
function createTicket(ticketData) {
    const ticketContainer = document.createElement("div");
    ticketContainer.classList.add("ticket-container");

    // Assign class based on priority
    const ticketClass = ticketData.assignedPriority > 26 ? "vip" : "regular";
    ticketContainer.classList.add(ticketClass);
    ticketContainer.dataset.ticketClass = ticketClass;

    const heading = document.createElement("h2");
    heading.textContent = `${ticketData.class} Class Ticket`;

    const seatingClass = ticketData.class.toLowerCase(); // e.g., "business" or "economy"
    ticketContainer.dataset.class = seatingClass; 
    
    // Add VIP Badge if applicable
    if (ticketClass === "vip") {
        const vipBadge = document.createElement("div");
        vipBadge.classList.add("vip-badge");
        vipBadge.textContent = "VIP";
        ticketContainer.appendChild(vipBadge);
    }

    const ticketInfo = document.createElement("div");
    ticketInfo.classList.add("ticket-info");
    ticketInfo.innerHTML = `
        <div class="tclass"><span class="ticket-label">Ticket ID:</span> ${ticketData.id}</div>
        <div class="tclass"><span class="ticket-label">Name:</span> ${ticketData.name}</div>
        <div class="tclass"><span class="ticket-label">From:</span> ${ticketData.from}</div>
        <div class="tclass"><span class="ticket-label">To:</span> ${ticketData.to}</div>
        <div class="tclass"><span class="ticket-label">Date:</span> ${ticketData.date}</div>
        <div class="tclass"><span class="ticket-label">Priority:</span> ${ticketData.assignedPriority}</div>
    `;

    ticketContainer.appendChild(heading);
    ticketContainer.appendChild(ticketInfo);
    return ticketContainer;
}

// Function to generate sorted tickets
function generateSortedTickets(ticketArray) {
    const container = document.getElementById("ticketQueue");
    if (!container) return;

    // Clear loading indicator
    container.innerHTML = ""; 

    if (ticketArray.length === 0) {
        const noTicketsMsg = document.createElement("div");
        noTicketsMsg.textContent = "No tickets available";
        noTicketsMsg.style.textAlign = "center";
        noTicketsMsg.style.padding = "20px";
        container.appendChild(noTicketsMsg);
        return;
    }

    // Sort tickets by priority (highest first)
    ticketArray.sort((a, b) => b.assignedPriority - a.assignedPriority);
    
    // Create and append ticket elements
    ticketArray.forEach(ticket => {
        const ticketElement = createTicket(ticket);
        container.appendChild(ticketElement);
    });
    
    // Apply current filters
    filterTickets();
    
    // Update last updated time
    updateLastUpdated();
}

// Function to filter tickets
function filterTickets() {
    const selectedSeatingClass = document.querySelector('input[name="seatingClass"]:checked').value;
    const selectedTicketType = document.querySelector('input[name="ticketClass"]:checked').value;

    document.querySelectorAll('.ticket-container').forEach(ticket => {
        const ticketSeatingClass = ticket.dataset.class; // Business or Economy
        const ticketType = ticket.dataset.ticketClass;  // VIP or Regular
        
        const seatingMatch = selectedSeatingClass === 'all' || ticketSeatingClass === selectedSeatingClass;
        const typeMatch = selectedTicketType === 'all' || ticketType === selectedTicketType;

        ticket.style.display = seatingMatch && typeMatch ? 'block' : 'none';
    });
}

// Function to confirm tickets
function confirmTickets() {
    if (currentTickets.length === 0) {
        alert("No tickets to confirm");
        return;
    }
    
    if (confirm("Are you sure you want to confirm these tickets?")) {
        // Make API call to confirm tickets
        fetch(API_ENDPOINT + '/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tickets: currentTickets.map(ticket => ticket.id)
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            alert("Tickets confirmed successfully!");
            // Refresh ticket data after confirmation
            fetchTickets();
        })
        .catch(error => {
            console.error("Error confirming tickets:", error);
            showError("Failed to confirm tickets. Please try again.");
        });
    }
}

// Function to update last updated timestamp
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById("lastUpdated");
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleTimeString();
    }
}

// Function to show error message
function showError(message) {
    const container = document.getElementById("ticketQueue");
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = ""; 
    
    // Create and show error message
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    
    container.appendChild(errorElement);
}

// Function to fetch tickets from API
function fetchTickets() {
    const container = document.getElementById("ticketQueue");
    if (!container) return;
    
    // Show loading indicator
    container.innerHTML = '<div class="loading" id="loadingIndicator">Loading tickets...</div>';
    
    // Fetch tickets from API
    fetch(API_ENDPOINT)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            // Store fetched tickets
            currentTickets = data;
            // Display tickets
            generateSortedTickets(data);
            // Also refresh the ticket list in the table
            loadTickets();
        })
        .catch(error => {
            console.error("Error fetching tickets:", error);
            showError("Failed to load tickets. Please try again.");
        });
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Attach filter event listeners
    document.querySelectorAll('input[name="seatingClass"], input[name="ticketClass"]').forEach(radio => {
        radio.addEventListener('change', filterTickets);
    });
    
    // Attach refresh button event listener
    const refreshButton = document.getElementById("refreshButton");
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchTickets);
    }
    
    // Initial data fetch
    fetchTickets();
});

// Fallback for development/testing when API is not available
function useFallbackData() {
    console.log("Using fallback data (for development only)");
    const fallbackTickets = [
        { class: "Business", id: "BUS001", name: "John Doe", from: "NY", to: "LA", date: "2025-02-15", assignedPriority: 36 },
        { class: "Economy", id: "ECO001", name: "Jane Smith", from: "Chicago", to: "Miami", date: "2025-02-16", assignedPriority: 24 },
        { class: "Economy", id: "ECO002", name: "Alice Johnson", from: "London", to: "Paris", date: "2025-02-17", assignedPriority: 27 },
        { class: "Business", id: "BUS002", name: "Bob Wilson", from: "Tokyo", to: "Sydney", date: "2025-02-18", assignedPriority: 14 }
    ];
    currentTickets = fallbackTickets;
    generateSortedTickets(fallbackTickets);
    // Also populate the table with fallback data
    populateTicketTable(fallbackTickets);
}

// Error handling for fetch API failures - use fallback data if in development mode
window.addEventListener('error', function(e) {
    if (e.message.includes('Failed to fetch') && location.hostname === 'localhost') {
        useFallbackData();
    }
});

function toggleAllCheckboxes(checked) {
    const checkboxes = document.querySelectorAll('input[name="ticketCheckbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
}

// Function to populate the ticket table with styled rows
function populateTicketTable(tickets) {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    ticketList.innerHTML = '';
    
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        // Add VIP class if priority > 26
        if (ticket.assignedPriority > 26) {
            row.classList.add('ticket-row-vip');
        }
        
        row.innerHTML = `
            <td><input type="checkbox" name="ticketCheckbox" value="${ticket.id}"></td>
            <td>${ticket.id}</td>
            <td>${ticket.name}</td>
            <td>${ticket.class}</td>
            <td>${ticket.from}</td>
            <td>${ticket.to}</td>
            <td>${ticket.date}</td>
            <td>
                <button onclick="confirmTicket('${ticket.id}')" class="btn btn-sm btn-primary">Confirm</button>
                <button onclick="deleteTicket('${ticket.id}')" class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        
        ticketList.appendChild(row);
    });
}

// Function to load tickets and display them in the table
async function loadTickets() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    ticketList.innerHTML = '<tr><td colspan="8">Loading tickets...</td></tr>';
    
    try {
        // Use current tickets if already loaded, otherwise fetch
        if (currentTickets && currentTickets.length > 0) {
            populateTicketTable(currentTickets);
        } else {
            const response = await fetch('/api/tickets');
            const tickets = await response.json();
            
            if (tickets.length === 0) {
                ticketList.innerHTML = '<tr><td colspan="8">No tickets found</td></tr>';
                return;
            }
            
            populateTicketTable(tickets);
        }
    } catch (err) {
        console.error('Error loading tickets:', err);
        ticketList.innerHTML = `<tr><td colspan="8">Error loading tickets: ${err.message}</td></tr>`;
        
        // Try fallback data in development
        if (location.hostname === 'localhost') {
            useFallbackData();
        }
    }
}

// Function to delete a ticket
async function deleteTicket(ticketId) {
    if (!confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Ticket deleted successfully');
            fetchTickets(); // Refresh both ticket displays
        } else {
            const data = await response.json();
            alert(`Error deleting ticket: ${data.error}`);
        }
    } catch (err) {
        console.error('Error deleting ticket:', err);
        alert(`Error deleting ticket: ${err.message}`);
    }
}

async function confirmTicket(ticketId) {
    try {
        const response = await fetch('/api/confirm-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticketId }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Ticket confirmed successfully!`);
            fetchTickets(); // Refresh all ticket displays
        } else {
            alert(`Error confirming ticket: ${data.error}`);
        }
    } catch (err) {
        console.error('Error confirming ticket:', err);
        alert(`Error confirming ticket: ${err.message}`);
    }
}

// Function to confirm multiple tickets
async function confirmTickets() {
    // Get all selected ticket checkboxes
    const checkboxes = document.querySelectorAll('input[name="ticketCheckbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one ticket to confirm');
        return;
    }
    
    const ticketIds = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    try {
        const response = await fetch('/api/confirm-tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticketIds }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Confirmed ${data.summary.succeeded} of ${data.summary.total} tickets successfully!`);
            if (data.summary.failed > 0) {
                console.warn('Some tickets failed to confirm:', data.results.failed);
            }
            refreshTicketTable(); // Only refresh the ticket table, not the container
            fetchTickets();
        } else {
            alert(`Error confirming tickets: ${data.error}`);
        }
    } catch (err) {
        console.error('Error confirming tickets:', err);
        alert(`Error confirming tickets: ${err.message}`);
    }
}

// New function to only refresh the ticket table without affecting the container
async function refreshTicketTable() {
    try {
        const response = await fetch('/api/tickets');
        const tickets = await response.json();
        
        // Update the current tickets array
        currentTickets = tickets;
        
        // Only update the table, not the container
        populateTicketTable(tickets);
        
        alert('Ticket list refreshed successfully!');
    } catch (err) {
        console.error('Error refreshing ticket list:', err);
        alert(`Error refreshing ticket list: ${err.message}`);
        
        // Try fallback data in development
        if (location.hostname === 'localhost') {
            populateTicketTable(currentTickets || []);
        }
    }
}



