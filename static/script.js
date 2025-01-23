document.addEventListener("DOMContentLoaded", function() {
    // Set the minimum date for the departure date input
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const minDate = `${yyyy}-${mm}-${dd}`;
    
    document.getElementById("departureDate").setAttribute("min", minDate);
    document.getElementById("returnDate").setAttribute("min", minDate); // Set min for return date
    
    // Existing code for trip options and form submission
    const tripOptions = document.getElementsByName("tripType");
    const returnDate = document.getElementById("returnDate");
    const returnDateLabel = document.querySelector("label[for='returnDate']");
    const multiCityContainer = document.getElementById("multiCityContainer");

    tripOptions.forEach(option => {
        option.addEventListener("change", function() {
            if (this.value === "roundTrip") {
                returnDate.style.display = "block";
                returnDateLabel.style.display = "block";
                multiCityContainer.style.display = "none";
            } else if (this.value === "multiCity") {
                returnDate.style.display = "none";
                returnDateLabel.style.display = "none";
                multiCityContainer.style.display = "block";
            } else {
                returnDate.style.display = "none";
                returnDateLabel.style.display = "none";
                multiCityContainer.style.display = "none";
            }
        });
    });

    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        const departure = document.getElementById("departure").value;
        const arrival = document.getElementById("arrival").value;
        const departureDate = document.getElementById("departureDate").value;
        const returnDateValue = document.getElementById("returnDate").value;
        const passengers = document.getElementById("passengers").value;

        // Construct the URL with query parameters
        let url = `available_flights.html?from=${encodeURIComponent(departure)}&to=${encodeURIComponent(arrival)}&date=${encodeURIComponent(departureDate)}`;

        if (tripOptions[1].checked && returnDateValue) {
            url += `&returnDate=${encodeURIComponent(returnDateValue)}`;
        } else if (tripOptions[2].checked) {
            const multiCityInputs = multiCityContainer.querySelectorAll("input");
            multiCityInputs.forEach((input, index) => {
                if (input.value) {
                    url += `&city${index + 2}=${encodeURIComponent(input.value)}`; // City 2, City 3, etc.
                }
            });
        }

        // Redirect to the available flights page
        window.location.href = url;
    });
});