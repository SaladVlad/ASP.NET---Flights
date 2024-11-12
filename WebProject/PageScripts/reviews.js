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
                    // Redirect for non-admin users
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
        function getReviewStatus(status) {
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

        function getCardClass(status) {
            switch (status) {
                case "Created":
                    return "bg-warning text-dark";
                case "Approved":
                    return "bg-success text-white";
                case "Denied":
                    return "bg-danger text-white";
                default:
                    return "bg-light text-dark";
            }
        }

        function fetchReviews() {
            $.ajax({
                url: '/api/reviews',
                method: 'GET',
                success: function (data) {
                    let reviewsHtml = '<div class="row">';
                    if (data.length === 0) {
                        reviewsHtml += '<h4>There are no reviews available!</h4>';
                    } else {
                        data.forEach(review => {
                            let reviewStatus = getReviewStatus(review.Status);
                            let cardClass = getCardClass(reviewStatus);
                            reviewsHtml += `
                            <div class="col-md-4 mb-3">
                                <div class="card ${cardClass}">
                                    <div class="card-body">
                                        <h5 class="card-title">${review.Headline}</h5>
                                        <p class="card-text">Reviewed by: ${review.ReviewerUsername}</p>
                                        <p class="card-text">Airline: ${review.AirlineName}</p>
                                        <p class="card-text">Content: ${review.Content}</p>
                                        ${review.UploadedFileUrl ? '<img src="' + review.UploadedFileUrl + '" class="img-fluid" alt="Review Image">' : ''}
                                        <p class="card-text">Status: ${reviewStatus}</p>
                                        ${review.Status === 0 ? '<button class="btn btn-success approve-review" data-review-id="' + review.Id + '">Approve</button>' : ''}
                                        ${review.Status === 0 ? '<button class="btn btn-danger deny-review" data-review-id="' + review.Id + '">Deny</button>' : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                        });
                    }
                    reviewsHtml += '</div>';
                    $('#review-list').html(reviewsHtml);
                },
                error: function (error) {
                    $('#review-list').html('<p class="text-danger">Error fetching reviews. Please try again later.</p>');
                }
            });
        }

        function approveReview(reviewId) {
            $.ajax({
                url: `/api/reviews/${reviewId}/approve`,
                method: 'POST',
                success: function () {
                    alert('Review approved successfully.');
                    fetchReviews(); // Refresh the list of reviews
                },
                error: function (error) {
                    alert('Error approving review. Please try again later.');
                }
            });
        }

        function denyReview(reviewId) {
            $.ajax({
                url: `/api/reviews/${reviewId}/deny`,
                method: 'POST',
                success: function () {
                    alert('Review denied successfully.');
                    fetchReviews(); // Refresh the list of reviews
                },
                error: function (error) {
                    alert('Error denying review. Please try again later.');
                }
            });
        }

        fetchReviews();

        // Handle approve button click
        $('#review-list').on('click', '.approve-review', function () {
            const reviewId = $(this).data('review-id');
            approveReview(reviewId);
        });

        // Handle deny button click
        $('#review-list').on('click', '.deny-review', function () {
            const reviewId = $(this).data('review-id');
            denyReview(reviewId);
        });
    }

    checkUserRole();
});
