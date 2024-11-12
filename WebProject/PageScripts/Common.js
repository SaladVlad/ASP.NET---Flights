$(document).ready(function () {
    console.log("Document is ready.");

    function getUserRole() {
        return new Promise((resolve, reject) => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navbar();
                return;
            }

            $.ajax({
                url: '/api/role/',
                method: 'GET',
                headers: {
                    'Authorization': token
                },
                success: function (data) {
                    navbar(data);
                },
                error: function (error) {
                    navbar();
                }
            });
        });
    }
    getUserRole();
});

async function navbar(role = null) {
    console.log("Rendering navbar...");
    $('#dynamicNavbar').empty(); // Clear the current navbar items

    if (role != null) {
        console.log("User is logged in.");
        role = role.role;

        console.log("User role:", role);
        if (role === "Admin") {
            console.log("Rendering Admin navbar items...");
            $('#dynamicNavbar').append(`
                <li class="nav-item">
                    <a class="nav-link" href="flights-admin.html">Flight Management</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="reservations.html">Reservation Management</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="reviews.html">Review Management</a>
                </li>
            `);
        } else if (role === "Normal") {
            console.log("Rendering Normal navbar items...");
            $('#dynamicNavbar').append(`
                <li class="nav-item">
                    <a class="nav-link" href="my-flights.html">My Flights</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="reservations.html">My Reservations</a>
                </li>
            `);
        }
        console.log("Adding common navbar items...");
        $('#dynamicNavbar').append(`
            <li class="nav-item">
                <a class="nav-link" href="airlines.html">Airlines</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="profile.html">Profile</a>
            </li>
            <li class="nav-item">
                <a id="logout" class="nav-link cursor-pointer" href="#">Log out</a>
            </li>
        `);
        logout();
    } else {
        console.log("User is not logged in.");
        console.log("Rendering guest navbar items...");
        $('#dynamicNavbar').append(`
            <li class="nav-item">
                <a class="nav-link" href="airlines.html">Airlines</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="register.html">Register</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
        `);
    }
}

function logout() {
    $('#logout').on('click', function (event) {
        event.preventDefault();
        console.log("Logging out...");
        let token = sessionStorage.getItem('token');
        $.ajax({
            url: '/api/logout/',
            method: 'DELETE',
            headers: {
                'Authorization': token
            },
            success: function () {
                sessionStorage.clear();
                console.log("Session storage cleared");
                navbar(); // Re-render the navbar after logging out
                window.location.href = 'index.html';
            },
            error: function () {
                console.log('something bad happened during logout...');
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    });
}