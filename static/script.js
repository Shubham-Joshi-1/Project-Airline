// script.js
document.addEventListener("DOMContentLoaded", function() {
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
        event.preventDefault();

        const departure = document.getElementById("departure").value;
        const arrival = document.getElementById("arrival").value;
        const departureDate = document.getElementById("departureDate").value;
        const returnDateValue = document.getElementById("returnDate").value;
        const passengers = document.getElementById("passengers").value;

        let message = `Searching flights from ${departure} to ${arrival} on ${departureDate}`;

        if (tripOptions[1].checked && returnDateValue) {
            message += `, returning on ${returnDateValue}`;
        } else if (tripOptions[2].checked) {
            const multiCityInputs = multiCityContainer.querySelectorAll("input");
            message += ", visiting: ";
            multiCityInputs.forEach(input => {
                if (input.value) message += `${input.value} `;
            });
        }

        message += ` for ${passengers} passenger(s).`;
        alert(message);
    });
});