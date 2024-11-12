$(document).ready(function () {
    let userRole = null;
    let username = null;

    function getUserRole() {
        return new Promise((resolve, reject) => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                resolve();
            }

            $.ajax({
                url: '/api/role/',
                method: 'GET',
                headers: {
                    'Authorization': token
                },
                success: function (data) {
                    resolve(data.role);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    }

    function getUsername() {
        return new Promise((resolve, reject) => {
            const token = sessionStorage.getItem('token');
            $.ajax({
                url: '/api/users/token',
                method: 'GET',
                headers: {
                    'Authorization': token
                },
                success: function (data) {
                    resolve(data.username);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    }

    function getFlightStatus(status) {
        switch (status) {
            case 0:
                return "Active";
            case 1:
                return "Cancelled";
            case 2:
                return "Finished";
            default:
                return "Unknown";
        }
    }

    function getCardClass(availableSeats) {
        if (availableSeats !== '0') {
            return 'bg-success text-white';
        }
        return 'bg-danger text-white';
    }

    function fetchFlights(filters = {}) {
        $.ajax({
            url: '/api/flights',
            method: 'GET',
            success: function (data) {
                let filteredFlights = data.filter(flight => {
                    const flightDepartureTime = parseDateTime(flight.DepartureTime);
                    const flightArrivalTime = parseDateTime(flight.ArrivalTime);

                    return (!filters.departure || flight.Departure.toLowerCase().includes(filters.departure.toLowerCase())) &&
                        (!filters.destination || flight.Destination.toLowerCase().includes(filters.destination.toLowerCase())) &&
                        (!filters.departureDateTimeStart || flightDepartureTime >= filters.departureDateTimeStart) &&
                        (!filters.departureDateTimeEnd || flightDepartureTime <= filters.departureDateTimeEnd) &&
                        (!filters.arrivalDateTimeStart || flightArrivalTime >= filters.arrivalDateTimeStart) &&
                        (!filters.arrivalDateTimeEnd || flightArrivalTime <= filters.arrivalDateTimeEnd) &&
                        (!filters.airline || flight.AirlineName.toLowerCase().includes(filters.airline.toLowerCase()));
                });

                if (filters.sorting) {
                    if (filters.sorting === "Ascending") {
                        filteredFlights.sort((a, b) => a.Cost - b.Cost);
                    } else {
                        filteredFlights.sort((a, b) => b.Cost - a.Cost);
                    }
                }

                console.log('filtered flights:\n', filteredFlights);

                let currentDateTime = new Date();

                let flightsHtml = '<div class="row">';
                if (filteredFlights.length == 0) {
                    flightsHtml += '<h4>There are no flights with the filtered attributes!</h4>';
                } else {
                    filteredFlights.forEach(flight => {
                        const seatNumbers = flight.Seats.split('/');
                        const availableSeats = seatNumbers[0];

                        if (getFlightStatus(flight.FlightStatus) === 'Active') {
                            flightsHtml += `
                                <div class="col-md-4 mb-3">
                                    <div class="card ${getCardClass(availableSeats)}">
                                        <div class="card-body">
                                            <h5 class="card-title">From: ${flight.Departure}</h5>
                                            <h5 class="card-title">To: ${flight.Destination}</h5>
                                            <p class="card-text"><a style="color:white; font-size:17pt;" href="airline-info.html?id=${encodeURIComponent(flight.AirlineId)}">${flight.AirlineName}</a></p>
                                            <p class="card-text">Departure: ${flight.DepartureTime}</p>
                                            <p class="card-text">Arrival: ${flight.ArrivalTime}</p>
                                            <p class="card-text">Available Seats:</p>
                                            <p class="card-text"><strong style="font-size: 2em;">${availableSeats}</strong></p>
                                            <p class="card-text">Cost: <strong style="font-size: 1.5em;">$${flight.Cost}</strong></p>`;

                            if (getFlightStatus(flight.FlightStatus) === 'Active' &&
                                userRole === 'Normal' && availableSeats !== '0' &&
                                currentDateTime < parseDateTime(flight.DepartureTime)) {
                                flightsHtml += `
                                    <div class="form-group">
                                        <label for="passengerNumber-${flight.Id}">Number of Passengers:</label>
                                        <input type="number" class="form-control" id="passengerNumber-${flight.Id}">
                                    </div>
                                    <button class="btn btn-primary reserve-btn" data-flight-id="${flight.Id}" data-flight-name="${flight.Departure}-${flight.Destination}" data-cost="${flight.Cost}">Reserve</button>`;
                            }

                            flightsHtml += `</div>
                                    </div>
                                </div>`;
                        }
                    });
                }
                flightsHtml += '</div>';
                $('#flight-list').html(flightsHtml);
            },
            error: function (error) {
                $('#flight-list').html('<p class="text-danger">Error fetching flights. Please try again later.</p>');
            }
        });
    }

    function parseDateTime(dateTimeStr) {
        if (!dateTimeStr) {
            return null;
        }

        const [datePart, timePart] = dateTimeStr.split('-');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
    }

    $(document).on('click', '.reserve-btn', function () {
        const flightId = $(this).data('flight-id');
        const flightName = $(this).data('flight-name');
        const passengerNumber = $(`#passengerNumber-${flightId}`).val();
        const totalCost = $(this).data('cost') * passengerNumber;

        const reservation = {
            User: username,
            FlightID: flightId,
            FlightName: flightName,
            PassengerNumber: passengerNumber,
            TotalCost: totalCost,
            ReservationStatus: 0
        };

        $.ajax({
            url: '/api/reservations/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(reservation),
            success: function () {
                alert('Reservation successfully created.');
                fetchFlights();
            },
            error: function (error) {
                alert("Can't reserve this amount of seats!");
                $(`#passengerNumber-${flightId}`).clear();
            }
        });
    });

    $('#filter-form').on('submit', function (e) {
        e.preventDefault();
        const filters = {
            departure: $('#departure').val(),
            destination: $('#destination').val(),
            departureDateTimeStart: parseDateTime($('#departure-date-time-start').val()),
            departureDateTimeEnd: parseDateTime($('#departure-date-time-end').val()),
            arrivalDateTimeStart: parseDateTime($('#arrival-date-time-start').val()),
            arrivalDateTimeEnd: parseDateTime($('#arrival-date-time-end').val()),
            airline: $('#airline').val(),
            sorting: $('#sorting').val()
        };
        console.log('created filter, fetching flights');
        fetchFlights(filters);
    });

    $('#clear-filter').on('click', function () {
        $('#filter-form').find('input').val('');
        fetchFlights();
    });

    function handleUserRole() {

        if (sessionStorage.getItem('token') == null) {
            fetchFlights();
            return;
        }

        Promise.all([getUserRole(), getUsername()])
            .then(results => {
                userRole = results[0];
                username = results[1];
                fetchFlights();
            })
            .catch(error => {

            });
    }

    handleUserRole();
});
