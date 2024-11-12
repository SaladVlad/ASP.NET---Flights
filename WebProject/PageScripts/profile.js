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

    function fetchUserData() {
        let url = '/api/users/' + username;
        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                populateUserProfile(data);
            },
            error: function (error) {
                console.log(error);
                window.location.href = 'index.html';
            }
        });
    }

    function populateUserProfile(userData) {
        $("#username").val(userData.Username);
        $("#password").val(userData.Password);
        $("#firstName").val(userData.FirstName);
        $("#lastName").val(userData.LastName);
        $("#email").val(userData.Email);
        $("#dateOfBirth").val(userData.DateOfBirth);
        $("#gender").val(userData.Gender);
    }

    function disableOrEnableFields(disable) {
        $("#username").prop("disabled", disable)
        $("#password").prop("disabled", disable)
        $("#firstName").prop("disabled", disable)
        $("#lastName").prop("disabled", disable)
        $("#email").prop("disabled", disable)
        $("#dateOfBirth").prop("disabled", disable)
        $("#gender").prop("disabled", disable)
    }

    function fillAdminDiv() {
        $("#admin-section").show();
        fetchUsers();
    }

    function fetchUsers(filters = {}) {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function (data) {
                let filteredUsers = data.filter(user => {
                    const startDate = new Date(filters.startDate);
                    const endDate = new Date(filters.endDate);
                    const userDOB = new Date(user.DateOfBirth);

                    if (user.Username === sessionStorage.getItem('token')) {
                        return false;
                    }

                    return (!filters.name || user.FirstName.toLowerCase().includes(filters.name.toLowerCase())) &&
                        (!filters.surname || user.LastName.toLowerCase().includes(filters.surname.toLowerCase())) &&
                        (!filters.startDate || userDOB >= startDate) &&
                        (!filters.endDate || userDOB <= endDate);
                });

                displayUsers(filteredUsers);
            },
            error: function (error) {
                $('#users-list').html('<p class="text-danger">Error fetching users. Please try again later.</p>');
            }
        });
    }

    function displayUsers(users) {
        let usersHtml = '<div class="row">';
        users.forEach(user => {
            usersHtml += `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${user.FirstName} ${user.LastName}</h5>
                            <p class="card-text">Username: ${user.Username}</p>
                            <p class="card-text">Email: ${user.Email}</p>
                            <p class="card-text">Date of Birth: ${user.DateOfBirth}</p>
                            <p class="card-text">Gender: ${user.Gender}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        usersHtml += '</div>';
        $('#users-list').html(usersHtml);
    }
    $("#filter-form").on("submit", function (e) {
        e.preventDefault();
        const filters = {
            name: $("#filter-name").val(),
            surname: $("#filter-surname").val(),
            startDate: $("#filter-start-date").val(),
            endDate: $("#filter-end-date").val()
        };
        fetchUsers(filters);
    });

    $("#clear-filters-btn").on("click", function () {
        $("#filter-form")[0].reset();
        fetchUsers(); // Fetch all users without any filters
    });

    function sortUsers(users, key, asc = true) {
        return users.sort((a, b) => {
            if (asc) {
                return (a[key] > b[key]) ? 1 : -1;
            } else {
                return (a[key] < b[key]) ? 1 : -1;
            }
        });
    }


    $("#edit-profile-btn").on("click", function () {
        if ($(this).text() === "Edit Profile") {
            $(this).text("Save Changes");
            disableOrEnableFields(false);
        }
        else {
            const userData = {
                Username: $("#username").val(),
                Password: $("#password").val(),
                FirstName: $("#firstName").val(),
                LastName: $("#lastName").val(),
                Email: $("#email").val(),
                DateOfBirth: $("#dateOfBirth").val(),
                Gender: $("#gender").val()
            };
            updateUserData(userData);
            $(this).text("Edit Profile");
            disableOrEnableFields(true);
        }
    });

    function updateUserData(userData) {
        $.ajax({
            url: '/api/users/',
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': sessionStorage.getItem('token')
            },
            data: JSON.stringify(userData),
            success: function (data) {
                alert('Successfully edited profile!');
                $('#message').append('<h4 style="color: red">Successfully edited profile!</h4>');
            },
            error: function (error) {
                console.log(error);
                alert('Error updating user data. Please try again later.');
            }
        });
    }

    $("#sort-name-asc").on("click", function () {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function (data) {
                const sortedUsers = sortUsers(data, 'FirstName', true);
                displayUsers(sortedUsers);
            },
            error: function (error) {
                $('#users-list').html('<p class="text-danger">Error fetching users. Please try again later.</p>');
            }
        });
    });

    $("#sort-name-desc").on("click", function () {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function (data) {
                const sortedUsers = sortUsers(data, 'FirstName', false);
                displayUsers(sortedUsers);
            },
            error: function (error) {
                $('#users-list').html('<p class="text-danger">Error fetching users. Please try again later.</p>');
            }
        });
    });

    $("#sort-dob-asc").on("click", function () {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function (data) {
                const sortedUsers = sortUsers(data, 'DateOfBirth', true);
                displayUsers(sortedUsers);
            },
            error: function (error) {
                $('#users-list').html('<p class="text-danger">Error fetching users. Please try again later.</p>');
            }
        });
    });

    $("#sort-dob-desc").on("click", function () {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function (data) {
                const sortedUsers = sortUsers(data, 'DateOfBirth', false);
                displayUsers(sortedUsers);
            },
            error: function (error) {
                $('#users-list').html('<p class="text-danger">Error fetching users. Please try again later.</p>');
            }
        });
    });

    function handleUserRole() {
        Promise.all([getUserRole(), getUsername()])
            .then(results => {
                userRole = results[0];
                username = results[1];
                if (userRole === 'Admin') {
                    fetchUserData();
                    fillAdminDiv();
                } else if (userRole === 'Normal') {
                    fetchUserData();
                } else {
                    window.location.href = 'index.html';
                }
            })
            .catch(error => {
                console.error('Error fetching user role or username:', error);
                window.location.href = 'index.html';
            });
    }

    handleUserRole();
});

