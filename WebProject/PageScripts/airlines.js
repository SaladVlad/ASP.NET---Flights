$(document).ready(function () {

    function getUserRole() {
        return new Promise((resolve, reject) => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.log('Token not found! Rendering guest view.');
                resolve(null);
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

    async function isAdmin() {
        try {
            const role = await getUserRole();
            return role === 'Admin';
        } catch (error) {
            console.error('Error fetching user role:', error);
            return false;
        }
    }

    async function fetchAirlines(filters = {}) {
        try {
            const isUserAdmin = await isAdmin();

            $.ajax({
                url: '/api/airlines',
                method: 'GET',
                success: function (data) {
                    let airlinesHtml = '<div class="row">';
                    let promises = [];

                    let filteredData = data.filter(airline => {
                        return (!filters.name || airline.Name.toLowerCase().includes(filters.name.toLowerCase())) &&
                            (!filters.address || airline.Address.toLowerCase().includes(filters.address.toLowerCase())) &&
                            (!filters.contact || airline.ContactInfo.toLowerCase().includes(filters.contact.toLowerCase()));
                    });

                    filteredData.forEach(airline => {
                        let promise = doesAirlineHaveActiveFlights(airline.Id).then(hasActiveFlights => {
                            airlinesHtml += `
                            <div class="mb-4">
                                <div class="card airline-card h-100" data-airline-name="${airline.Name}" data-airline-id="${airline.Id}">
                                    <div class="card-header airline-card-header" data-airline-name="${airline.Name}" data-airline-id="${airline.Id}">
                                        <h5 class="card-title mb-0">${airline.Name}</h5>
                                    </div>
                                    <div class="card-body airline-card-body" data-airline-name="${airline.Name}" data-airline-id="${airline.Id}">
                                        <img src="/Content/img/airline-picture.png" class="airline-img" alt="Airline Picture">
                                    </div>
                                    <div class="card-footer">`;
                            if (isUserAdmin) {
                                airlinesHtml += `<button class="btn btn-warning edit-button" data-airline-id="${airline.Id}">Edit</button>`;
                                if (!hasActiveFlights) {
                                    airlinesHtml += `<button class="btn btn-danger remove-button" data-airline-id="${airline.Id}">Remove</button>`;
                                }
                            }
                            airlinesHtml += `
                                    </div>
                                </div>
                            </div>
                        `;
                        });
                        promises.push(promise);
                    });

                    Promise.all(promises).then(() => {
                        airlinesHtml += '</div>';
                        $('#airline-list').html(airlinesHtml);

                        $('.airline-card-header, .airline-card-body').on('click', function () {
                            const airlineId = $(this).data('airline-id');
                            window.location.href = `airline-info.html?id=${encodeURIComponent(airlineId)}`;
                        });

                        $('.edit-button').on('click', function () {
                            const airlineId = $(this).data('airline-id');
                            fetchAirlineDetails(airlineId);
                            $('html, body').animate({ scrollTop: 0 }, 'fast');
                        });

                        $('.remove-button').on('click', function () {
                            const airlineId = $(this).data('airline-id');
                            removeAirline(airlineId);
                        });
                    });
                },
                error: function (error) {
                    $('#airline-list').html('<p class="text-danger">Error fetching airlines. Please try again later.</p>');
                }
            });
        } catch (error) {
            console.error('Error checking admin status:', error);
            $('#airline-list').html('<p class="text-danger">Error fetching airlines. Please try again later.</p>');
        }
    }

    function fetchAirlineDetails(airlineId) {
        $.ajax({
            url: `/api/airlines/${airlineId}`,
            method: 'GET',
            success: function (airline) {
                $('#airline-id').val(airline.Id);
                $('#airline-name').val(airline.Name);
                $('#airline-address').val(airline.Address);
                $('#airline-contact').val(airline.ContactInfo);
                $('#create-airline-form button[type="submit"]').text('Update Airline');
                $('#cancel-edit-button').removeAttr('hidden');
            },
            error: function (error) {
                alert('Error fetching airline details. Please try again later.');
            }
        });
    }

    function doesAirlineHaveActiveFlights(airlineId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/airlines/${airlineId}`,
                method: 'GET',
                success: function (airline) {
                    let hasActiveFlights = airline.Flights.some(flight => flight.FlightStatus === 0 && !flight.Deleted);
                    resolve(hasActiveFlights);
                },
                error: function (error) {
                    alert('Error fetching airline details. Please try again later.');
                    resolve(false);
                }
            });
        });
    }

    function removeAirline(airlineId) {
        $.ajax({
            url: `/api/airlines/${airlineId}`,
            method: 'DELETE',
            success: function () {
                alert("Successfully deleted airline!");
                fetchAirlines();
            },
            error: function (error) {
                alert('Error removing airline. Please try again later.');
            }
        });
    }

    async function init() {
        const isUserAdmin = await isAdmin();
        if (isUserAdmin) {
            $("#admin-controls").removeAttr("hidden");
        }
        fetchAirlines();
    }

    function cancelEditing() {
        $('#create-airline-form')[0].reset();
        $('#airline-id').val('');
        $('#create-airline-form button[type="submit"]').text('Create Airline');
        $('#cancel-edit-button').attr('hidden', 'hidden');
    }

    $('#create-airline-form').on('submit', function (event) {
        event.preventDefault();

        const airlineData = {
            Id: $("#airline-id").val(),
            Name: $("#airline-name").val(),
            Address: $("#airline-address").val(),
            ContactInfo: $("#airline-contact").val()
        };

        const method = airlineData.Id ? 'PUT' : 'POST';
        const url = '/api/airlines';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(airlineData),
            success: function () {
                alert(method === 'POST' ? 'Airline created successfully' : 'Airline updated successfully');
                cancelEditing();
                fetchAirlines();
            },
            error: function (xhr) {
                if (xhr.status === 400 && xhr.responseText) {
                    alert(xhr.responseText);
                } else {
                    alert('Error creating/updating airline. Please try again later.');
                }
            }
        });
    });

    $('#cancel-edit-button').on('click', function () {
        cancelEditing();
    });
    $('#clear-form').on('click', function () {
        cancelEditing();
    });

    $('#filter-form').on('submit', function (event) {
        event.preventDefault();
        const filters = {
            name: $('#filter-name').val(),
            address: $('#filter-address').val(),
            contact: $('#filter-contact').val()
        };
        fetchAirlines(filters);
    });

    $('#clear-filters-btn').on('click', function () {
        $('#filter-form')[0].reset();
        fetchAirlines();
    });

    init();
});
