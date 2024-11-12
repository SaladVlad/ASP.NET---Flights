$(document).ready(function () {
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const airlineId = getQueryParam('id');
    if (airlineId) {
        $.ajax({
            url: '/api/airlines/' + airlineId,
            method: 'GET',
            success: function (data) {
                $('#airline-name').text(data.Name);
                $('#airline-address').text("Address: " + data.Address);
                $('#airline-contact').text("Contact Info: " + data.ContactInfo);

                // Generate flights HTML
                let flightsHtml = '<div class="row">';
                let areThereActiveFlights = false;
                data.Flights.forEach((flight, index) => {
                    if (flight.FlightStatus == 0 && !flight.Deleted) {
                        areThereActiveFlights = true;
                        flightsHtml += `
                        <div class="col-md-4 mb-3">
                            <div class="card bg-primary">
                                <div class="card-body">
                                    <h5 class="card-title">Flight: ${flight.Departure} to ${flight.Destination}</h5>
                                    <p class="card-text">Departure: ${flight.DepartureTime}</p>
                                    <p class="card-text">Arrival: ${flight.ArrivalTime}</p>
                                </div>
                            </div>
                        </div>`;
                    }
                });
                flightsHtml += '</div>';
                if (data.Flights.length === 0 || !areThereActiveFlights) {
                    $('#airline-flights').html('<li><b>There are no active flights!</b></li>');
                } else {
                    $('#airline-flights').html(flightsHtml);
                }

                // Generate reviews HTML
                let reviewsHtml = '<div class="row">';
                data.Reviews.forEach((review, index) => {
                    if (getStatus(review.Status) === 'Approved') {
                        reviewsHtml += `
                        <div class="col-md-4 mb-3">
                            <div class="card bg-success">
                                <div class="card-body">
                                    <h5 class="card-title">${review.ReviewerUsername}</h5>
                                    <p class="card-text">${review.Headline}</p>
                                    <p class="card-text">${review.Content}</p>
                                    ${review.UploadedFileUrl ? '<img src="' + review.UploadedFileUrl + '" class="img-fluid" alt="Review Image">' : ''}
                                </div>
                            </div>
                        </div>`;

                        // Close the row after every 3 reviews
                        if ((index + 1) % 3 === 0 && index !== data.Reviews.length - 1) {
                            reviewsHtml += '</div><div class="row">';
                        }
                    }
                });
                reviewsHtml += '</div>';
                if (data.Reviews.filter(review => getStatus(review.Status) === 'Approved').length === 0) {
                    $('#airline-reviews').html('<li><b>There are no reviews!</b></li>');
                } else {
                    $('#airline-reviews').html(reviewsHtml);
                }
            },
            error: function (error) {
                alert('Error fetching airline details.');
            }
        });
    } else {
        alert('No airline specified.');
    }

    function getStatus(status) {
        switch (status) {
            case 0:
                return "Created";
            case 1:
                return "Approved";
            case 2:
                return "Denied";
            default:
                return "Unknown";
        }
    }

    window.goBack = function () {
        history.back();
    };
});
