document.addEventListener("DOMContentLoaded", function () {
    // Set the minimum date for the date inputs
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    const minDate = `${yyyy}-${mm}-${dd}`;

    document.getElementById("departureDate").setAttribute("min", minDate);
    document.getElementById("returnDate").setAttribute("min", minDate);

    // Manage trip type options
    const tripOptions = document.getElementsByName("tripType");
    const returnDate = document.getElementById("returnDate");
    const returnDateLabel = document.querySelector("label[for='returnDate']");
    const multiCityContainer = document.getElementById("multiCityContainer");

    tripOptions.forEach((option) => {
        option.addEventListener("change", function () {
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


    document.getElementById("searchForm").addEventListener("submit", function (event) {


        const departure = document.getElementById("departure").value;
        const arrival = document.getElementById("arrival").value;
        const departureDate = document.getElementById("departureDate").value;
        const returnDateValue = document.getElementById("returnDate").value;
        const passengers = document.getElementById("passengers").value;

        console.log("Form values:");
        console.log({ departure, arrival, departureDate, returnDateValue, passengers });

        // Construct the URL with query parameters
        let url = `available_flights.html?from=${encodeURIComponent(departure)}&to=${encodeURIComponent(arrival)}&date=${encodeURIComponent(departureDate)}`;

        if (tripOptions[1].checked && returnDateValue) {
            url += `&returnDate=${encodeURIComponent(returnDateValue)}`;
        } else if (tripOptions[2].checked) {
            const multiCityInputs = multiCityContainer.querySelectorAll("input");
            multiCityInputs.forEach((input, index) => {
                if (input.value.trim() !== "") {
                    url += `&city${index + 2}=${encodeURIComponent(input.value)}`;
                }
            });
        }

        console.log("Redirecting to:", url);

        // Redirect to the available flights page
        window.location.href = url;
    });
});
