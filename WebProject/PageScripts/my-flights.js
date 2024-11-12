if (sessionStorage.getItem('token') == null) {
    window.location.href = 'index.html';
}

$(document).ready(function () {

    let username = null;

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
    function fetchUsername() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/api/users/token',
                method: 'GET',
                headers: {
                    Authorization: sessionStorage.getItem('token')
                },
                success: function (data) {
                    username = data.username;
                    resolve(username);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });
    }

    function fetchUserFlights(filters = {}) {

        $.ajax({
            url: '/api/users/' + username + '/flights/',
            method: 'GET',
            success: function (data) {
                let filteredFlights = data.filter(flight => {
                    return (!filters.type || getFlightStatus(flight.FlightStatus) === filters.type);
                });

                console.log('filtered flights:\n', filteredFlights);

                let flightsHtml = '<div class="row">';
                if (filteredFlights.length === 0) {
                    flightsHtml += '<h4>There are no flights with the filtered attributes!</h4>';
                } else {
                    filteredFlights.forEach(flight => {
                        let flightStatus = getFlightStatus(flight.FlightStatus);
                        let statusClass = '';

                        if (flightStatus === 'Active') {
                            statusClass = 'flight-active bg-success';
                        } else if (flightStatus === 'Cancelled') {
                            statusClass = 'flight-cancelled bg-danger';
                        } else if (flightStatus === 'Finished') {
                            statusClass = 'flight-finished bg-info';
                        }

                        flightsHtml += `
                            <div class="col-md-4 mb-3">
                                <div class="card ${statusClass}">
                                    <div class="card-body">
                                        <h5 class="card-title">From: ${flight.Departure} To: ${flight.Destination}</h5>
                                        <p class="card-text"><a href="airline-info.html?name=${encodeURIComponent(flight.AirlineName)}">${flight.AirlineName}</a></p>
                                        <p class="card-text">Departure: ${flight.DepartureTime}</p>
                                        <p class="card-text">Arrival: ${flight.ArrivalTime}</p>
                                        <p class="card-text">Cost: $${flight.Cost}</p>`;

                        if (flightStatus === 'Finished') {
                            flightsHtml += `
                                <button class="btn btn-primary leave-review" data-airline-name="${flight.AirlineName}" data-flight-id="${flight.Id}" data-airline-id="${flight.AirlineId}">Leave a Review</button>`;
                        }

                        flightsHtml += `</div>
                                </div>
                            </div>`;
                    });
                }
                flightsHtml += '</div>';
                $('#flight-list').html(flightsHtml);

                $('.card').hide().fadeIn(500);
            },
            error: function (error) {
                $('#flight-list').html('<p class="text-danger">Error fetching flights. Please try again later.</p>');
            }
        });
    }

    $('#filter-form').on('submit', function (e) {
        e.preventDefault();
        const filters = {
            type: $('#status').val()
        };
        fetchUserFlights(filters);
    });

    $('#clear-filter').on('click', function () {
        $('#filter-form').find('select').val('');
        fetchUserFlights();
    });

    $('#flight-list').on('click', '.leave-review', function () {
        const airlineName = $(this).data('airline-name');
        const flightId = $(this).data('flight-id');
        const airlineId = $(this).data('airline-id');

        $('#review-airline-name').val(airlineName);
        $('#review-flight-id').val(flightId);
        $('#review-airline-id').val(airlineId);

        $('#reviewModal').modal('show');
    });

    $('#review-form').on('submit', function (e) {
        e.preventDefault();

        const reviewData = {
            ReviewerUsername: username,
            AirlineName: $('#review-airline-name').val(),
            AirlineId: $('#review-airline-id').val(),
            Headline: $('#headline').val(),
            Content: $('#content').val(),
            Status: 0 // Created status
        };

        const formData = new FormData();
        formData.append('reviewData', JSON.stringify(reviewData));

        const fileInput = $('#review-file')[0];
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        $.ajax({
            url: '/api/reviews',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert('Review submitted successfully.');
                $('#reviewModal').modal('hide');
            },
            error: function () {
                alert('Error submitting review. Please try again later.');
            }
        });
    });



    fetchUsername().then(() => {
        fetchUserFlights();
    }).catch(error => {
        console.error('Error fetching username: ', error);
    });
    fetchUserFlights();
});
