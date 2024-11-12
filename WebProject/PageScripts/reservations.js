if (sessionStorage.getItem('token') == null) {
    window.location.href = 'index.html';
}

$(document).ready(function () {
    let userRole = null;
    let username = null;

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

    function getReservationStatus(status) {
        switch (status) {
            case 0:
                return "Created";
            case 1:
                return "Approved";
            case 2:
                return "Cancelled";
            case 3:
                return "Finished";
            default:
                return "Unknown";
        }
    }

    function getCardClass(status) {
        switch (status) {
            case "Created":
                return "bg-warning";
            case "Approved":
                return "bg-success text-white";
            case "Cancelled":
                return "bg-danger text-white";
            case "Finished":
                return "bg-secondary text-white";
            default:
                return "";
        }
    }

    function fetchUserReservations(filters = {}) {
        $.ajax({
            url: `/api/users/${username}/reservations/`,
            method: 'GET',
            success: function (data) {
                let filteredReservations = data;
                if (filters.status) {
                    filteredReservations = data.filter(reservation => getReservationStatus(reservation.ReservationStatus) === filters.status);
                }

                console.log('filtered reservations:\n', filteredReservations);

                $('#reservation-list').html('');

                let reservationsHtml = '<div class="row">';
                if (filteredReservations.length == 0) {
                    reservationsHtml += '<h4>There are no reservations!</h4>';
                } else {
                    filteredReservations.forEach(reservation => {
                        getFlightFromID(reservation.FlightID).then(flight => {
                            const currentTime = new Date();
                            const departureTime = parseFlightDate(flight.DepartureTime);
                            const timeDifference = departureTime - currentTime;
                            const hoursDifference = timeDifference / (1000 * 60 * 60);

                            let reservationHtml = `
                                <div class="col-md-4 mb-3">
                                    <div class="card ${getCardClass(getReservationStatus(reservation.ReservationStatus))}">
                                        <div class="card-body">
                                            <h5 class="card-title">${reservation.FlightName}</h5>
                                            <p class="card-text">Passenger Number: ${reservation.PassengerNumber}</p>
                                            <p class="card-text">Total Cost: $${reservation.TotalCost}</p>
                                            <p class="card-text">Status: ${getReservationStatus(reservation.ReservationStatus)}</p>
                                        </div>`;

                            if (hoursDifference > 24 &&
                                (getReservationStatus(reservation.ReservationStatus) === "Created" ||
                                    getReservationStatus(reservation.ReservationStatus) === "Approved")) {
                                reservationHtml += `
                                    <div class="card-footer">
                                        <button class="btn btn-danger cancel-btn" data-reservation-id="${reservation.Id}">Cancel Reservation</button>
                                    </div>`;
                            }

                            reservationHtml += `
                                    </div>
                                </div>
                            `;
                            reservationsHtml += reservationHtml;
                            $('#reservation-list').html(reservationsHtml);
                        });
                    });
                }
                $('#reservation-list').html(reservationsHtml);
            },
            error: function (error) {
                $('#reservation-list').html('<p class="text-danger">Error fetching reservations. Please try again later.</p>');
            }
        });
    }

    function fetchAllReservations(filters = {}) {
        $.ajax({
            url: '/api/reservations/',
            method: 'GET',
            success: function (data) {
                let filteredReservations = data;
                if (filters.status) {
                    filteredReservations = data.filter(reservation => getReservationStatus(reservation.ReservationStatus) === filters.status);
                }

                console.log('filtered reservations:\n', filteredReservations);

                let reservationsHtml = '<div class="row">';
                if (filteredReservations.length == 0) {
                    reservationsHtml += '<h4>There are no reservations with the filtered attributes!</h4>';
                } else {
                    filteredReservations.forEach(reservation => {
                        getFlightFromID(reservation.FlightID).then(flight => {
                            const currentTime = new Date();
                            const departureTime = parseFlightDate(flight.DepartureTime);
                            const timeDifference = departureTime - currentTime;
                            const hoursDifference = timeDifference / (1000 * 60 * 60);

                            let reservationHtml = `
                                <div class="col-md-4 mb-3">
                                    <div class="card ${getCardClass(getReservationStatus(reservation.ReservationStatus))}">
                                        <div class="card-body">
                                            <h5 class="card-title">${reservation.User}: ${reservation.FlightName}</h5>
                                            <p class="card-text">Passenger Number: ${reservation.PassengerNumber}</p>
                                            <p class="card-text">Total Cost: $${reservation.TotalCost}</p>
                                            <p class="card-text">Status: ${getReservationStatus(reservation.ReservationStatus)}</p>
                                        </div>`;

                            if (hoursDifference > 24 &&
                                (getReservationStatus(reservation.ReservationStatus) === "Created")) {
                                reservationHtml += `
                                    <div class="card-footer">
                                        <button class="btn btn-danger cancel-btn" data-reservation-id="${reservation.Id}">Cancel Reservation</button>
                                        <button class="btn btn-success approve-btn" data-reservation-id="${reservation.Id}">Approve Reservation</button>
                                    </div>`;
                            }
                            else if (getReservationStatus(reservation.ReservationStatus) === "Created") {
                                reservationHtml += `
                                    <div class="card-footer">
                                        <button class="btn btn-success approve-btn" data-reservation-id="${reservation.Id}">Approve Reservation</button>
                                    </div>`;
                            }

                            reservationHtml += `
                                    </div>
                                </div>
                            `;
                            reservationsHtml += reservationHtml;

                            $('#reservation-list').html(reservationsHtml);
                        });
                    });
                }
            },
            error: function (error) {
                $('#reservation-list').html('<p class="text-danger">Error fetching reservations. Please try again later.</p>');
            }
        });
    }

    function cancelReservation(reservationId) {
        $.ajax({
            url: `/api/reservations/${reservationId}`,
            method: 'DELETE',
            success: function () {
                alert('Reservation successfully cancelled.');
                location.reload();
            },
            error: function (error) {
                alert('Error cancelling reservation. Please try again later.');
            }
        });
    }

    function approveReservation(reservationId) {
        $.ajax({
            url: `/api/reservations/${reservationId}/approve`,
            method: 'POST',
            success: function () {
                alert('Reservation successfully approved.');
                location.reload();
            },
            error: function (error) {
                alert('Error approving reservation. Please try again later.');
            }
        });
    }

    function getFlightFromID(flightId) {
        return $.ajax({
            url: `/api/flights/${flightId}`,
            method: 'GET'
        });
    }

    function parseFlightDate(dateString) {
        const [datePart, timePart] = dateString.split('-');
        const [day, month, year] = datePart.split('.');
        const [time, period] = timePart.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        return new Date(year, month - 1, day, hours, minutes);
    }

    function handleUserRole() {
        Promise.all([getUserRole(), getUsername()])
            .then(results => {
                userRole = results[0];
                username = results[1];
                if (userRole === 'Admin') {
                    fetchAllReservations();
                } else if (userRole === 'Normal') {
                    fetchUserReservations();
                } else {
                    alert('non valid role!');
                    window.location.href = 'index.html';
                }

                $('#filter-form').on('submit', function (e) {
                    e.preventDefault(); // Prevent the default form submission behavior
                    const filters = {
                        status: $('#status').val()
                    };
                    console.log('created filter, fetching reservations');
                    if (userRole === 'Admin') {
                        fetchAllReservations(filters);
                    } else if (userRole === 'Normal') {
                        fetchUserReservations(filters);
                    } else {
                        alert('non valid role!');
                        window.location.href = 'index.html';
                    }
                });

                $('#clear-filter').on('click', function () {
                    $('#filter-form').find('select').val('');
                    if (userRole === 'Admin') {
                        fetchAllReservations();
                    } else if (userRole === 'Normal') {
                        fetchUserReservations();
                    } else {
                        alert('non valid role!');
                        window.location.href = 'index.html';
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user role or username:', error);
                alert('Error fetching user role or username. Please try again later.');
            });
    }

    // Event delegation for dynamically created buttons
    $(document).on('click', '.cancel-btn', function () {
        const reservationId = $(this).data('reservation-id');
        cancelReservation(reservationId);
    });

    $(document).on('click', '.approve-btn', function () {
        const reservationId = $(this).data('reservation-id');
        approveReservation(reservationId);
    });

    // Initialize the application by fetching user role and username
    handleUserRole();
});
