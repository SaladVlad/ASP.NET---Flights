
$(document).ready(function () {

    function getUserRole() {
        return new Promise((resolve, reject) => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                reject(new Error('Token not found in sessionStorage'));
                return;
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

    function checkUserRole() {
        getUserRole()
            .then(role => {
                if (role !== 'Admin') {
                    // Redirect to unauthorized page for non-admin users
                    window.location.href = 'index.html';
                } else {
                    // Initialize page for admin users
                    initializePage();
                }
            })
            .catch(error => {
                console.error('Error fetching user role:', error);
                alert('Error fetching user role. Redirecting to index.html');
                window.location.href = 'index.html';
            });
    }

    function initializePage() {
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

        function getStatusStyle(status) {
            switch (status) {
                case 'Active':
                    return 'bg-success';
                case 'Cancelled':
                    return 'bg-danger';
                case 'Finished':
                    return 'bg-info';
            }
        }

        function fetchFlights(filters = {}) {
            $.ajax({
                url: '/api/flights',
                method: 'GET',
                success: function (data) {
                    let filteredFlights = data.filter(flight => {
                        return (!filters.departure || flight.Departure.toLowerCase().includes(filters.departure.toLowerCase())) &&
                            (!filters.destination || flight.Destination.toLowerCase().includes(filters.destination.toLowerCase())) &&
                            (!filters.departureDate || flight.DepartureTime.split('-')[0] === filters.departureDate) &&
                            (!filters.arrivalDate || flight.ArrivalTime.split('-')[0] === filters.arrivalDate) &&
                            (!filters.airline || flight.AirlineName.toLowerCase().includes(filters.airline.toLowerCase()));
                    });

                    if (filters.sorting) {
                        if (filters.sorting === "Ascending") {
                            filteredFlights.sort((a, b) => a.Cost - b.Cost);
                        } else {
                            filteredFlights.sort((a, b) => b.Cost - a.Cost);
                        }
                    }

                    let flightsHtml = '<div class="row">';
                    if (filteredFlights.length == 0) {
                        flightsHtml += '<h4>There are no flights with the filtered attributes!</h4>';
                        $('#flight-list').html(flightsHtml);
                    } else {
                        let promises = filteredFlights.map(flight => {
                            return new Promise((resolve) => {

                                const seatNumbers = flight.Seats.split('/');
                                const availableSeats = seatNumbers[0];

                                $.ajax({
                                    url: `/api/flights/${flight.Id}/check`,
                                    method: 'GET',
                                    success: function (data) {
                                        let content = `
                                <div class="col-md-4 mb-3">
                                    <div class="card ${getStatusStyle(getFlightStatus(flight.FlightStatus))}" data-flight-id=${flight.Id}>
                                        <div class="card-body">
                                            <h5 class="card-title">From: ${flight.Departure}</h5>
                                            <h5 class="card-title">To: ${flight.Destination}</h5>
                                            <p class="card-text"><a style="color:white; font-size:17pt;" href="airline-info.html?id=${encodeURIComponent(flight.AirlineId)}">${flight.AirlineName}</a></p>
                                            <p class="card-text">Departure: ${flight.DepartureTime}</p>
                                            <p class="card-text">Arrival: ${flight.ArrivalTime}</p>
                                            <p class="card-text">Available Seats:</p>
                                            <p class="card-text"><strong style="font-size: 2em;">${availableSeats}</strong>/${seatNumbers[1]}</p>
                                            <p class="card-text">Cost: <strong style="font-size: 1.5em;">$${flight.Cost}</strong></p>
                                        </div>
                                        <div class="card-footer">`;

                                        if (!data) {
                                            content += `<button class="btn btn-danger delete-button" data-flight-id="${flight.Id}">Delete</button>`;
                                        }
                                        if (flight.FlightStatus !== 1 && flight.FlightStatus !== 2) { // Check if flight status is not 'Cancelled' or 'Finished'
                                            content += `<button class="btn btn-warning cancel-button" data-flight-id="${flight.Id}">Cancel</button>`;
                                        }
                                        content += `
                                        </div>
                                    </div>
                                </div>`;
                                        resolve(content);
                                    },
                                    error: function () {
                                        resolve('');
                                    }
                                });
                            });
                        });

                        Promise.all(promises).then(results => {
                            flightsHtml += results.join('');
                            flightsHtml += '</div>';
                            $('#flight-list').html(flightsHtml);
                        });
                    }
                },
                error: function (error) {
                    $('#flight-list').html('<p class="text-danger">Error fetching flights. Please try again later.</p>');
                }
            });
        }


        function formatDate(dateString) {
            if (!dateString) {
                return null;
            }

            const [year, month, day] = dateString.split('-');
            return `${day}.${month}.${year}`;
        }

        $('#filter-form').on('submit', function (e) {
            e.preventDefault();
            const filters = {
                departure: $('#departure').val(),
                destination: $('#destination').val(),
                departureDate: formatDate($('#departure-date').val()),
                arrivalDate: formatDate($('#arrival-date').val()),
                airline: $('#airline').val(),
                sorting: $('#sorting').val()
            };
            fetchFlights(filters);
        });

        $('#clear-filter').on('click', function () {
            $('#filter-form').find('input').val('');
            fetchFlights();
        });

        $('#flight-list').on('click', '.card-body', function () {
            const flightId = $(this).closest('.card').data('flight-id');
            $.ajax({
                url: `/api/flights/${flightId}`,
                method: 'GET',
                success: function (flight) {
                    // Convert the departure time to the required format
                    const departureDateTime = formatDateTime(flight.DepartureTime);
                    const arrivalDateTime = formatDateTime(flight.ArrivalTime);

                    $('#flightId').val(flight.Id);
                    $('#airlineName').val(flight.AirlineName);
                    $('#departure').val(flight.Departure).prop('disabled', true);
                    $('#destination').val(flight.Destination).prop('disabled', true);
                    $('#departureTime').val(departureDateTime);
                    $('#arrivalTime').val(arrivalDateTime);
                    $('#seats').val(flight.Seats.split('/')[0]);
                    $('#cost').val(flight.Cost);

                    // Check reservations to see if cost should be disabled
                    checkReservations(flight.Id);

                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                },
                error: function (error) {
                    alert('Error fetching flight details. Please try again later.');
                }
            });
        });

        function formatDateTime(dateTimeString) {
            const [datePart, timePart] = dateTimeString.split('-');
            const [day, month, year] = datePart.split('.');
            return `${year}-${month}-${day}T${timePart}`;
        }

        function checkReservations(flightId) {
            $.ajax({
                url: `/api/reservations/flightId=${flightId}`,
                method: 'GET',
                success: function (reservations) {
                    const hasRestrictedReservations = reservations.some(reservation =>
                        reservation.ReservationStatus == 0 || reservation.ReservationStatus == 1
                    );
                    $('#cost').prop('disabled', hasRestrictedReservations);

                },
                error: function (error) {
                    console.error('Error fetching reservations:', error);
                }
            });
        }

        function fetchAirlineNames() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: '/api/airlines/',
                    method: 'GET',
                    success: function (airlines) {
                        let data = new Set();
                        airlines.forEach(airline => data.add(airline.Name));
                        resolve(Array.from(data));
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        }

        function fillAirlineNames() {
            fetchAirlineNames().then(airlineNames => {
                const airlineSelect = $('#airlineName');
                airlineNames.forEach(name => {
                    airlineSelect.append(new Option(name, name));
                });
            }).catch(error => {
                console.error('Error fetching airline names:', error);
            });
        }

        $('#flight-form').on('submit', function (e) {
            e.preventDefault();
            const flightData = {
                Id: $('#flightId').val(),
                AirlineId: $('#airlineId').val(),
                AirlineName: $('#airlineName').val(),
                Departure: $('#departure').val(),
                Destination: $('#destination').val(),
                DepartureTime: $('#departureTime').val(),
                ArrivalTime: $('#arrivalTime').val(),
                Seats: $('#seats').val(),
                Cost: $('#cost').val(),
                Deleted: false
            };

            $.ajax({
                url: '/api/flights',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(flightData),
                success: function (response) {
                    alert('Updated flights!');
                    $('#flight-form').find('input').val('');
                    $('#departure').prop('disabled', false);
                    $('#destination').prop('disabled', false);
                    $('#cost').prop('disabled', false);
                    fetchFlights();
                },
                error: function (error) {
                    alert('Error while updating flights. Please try again later.');
                }
            });
        });

        $('#clear-form').on('click', function () {
            $('#flight-form').find('input').val('');
            $('#departure').prop('disabled', false);
            $('#destination').prop('disabled', false);
            $('#cost').prop('disabled', false);
        });

        $('#flight-list').on('click', '.delete-button', function () {
            const flightId = $(this).data('flight-id');
            $.ajax({
                url: `/api/flights/${flightId}`,
                method: 'DELETE',
                success: function () {
                    alert('Flight deleted successfully.');
                    fetchFlights();
                },
                error: function (error) {
                    console.log(error);
                    alert('Error deleting flight. Please try again later.');
                }
            });
        });

        $('#flight-list').on('click', '.cancel-button', function () {
            const flightId = $(this).data('flight-id');
            $.ajax({
                url: `/api/flights/${flightId}/cancel`,
                method: 'PUT',
                success: function () {
                    alert('Flight cancelled successfully.');
                    fetchFlights();
                },
                error: function (error) {
                    console.log(error);
                    alert('Error cancelling flight. Please try again later.');
                }
            });
        });

        fetchFlights();
        fillAirlineNames();
    }

    checkUserRole();
});
