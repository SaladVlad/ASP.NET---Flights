$(document).ready(function () {
    $('#loginForm').on('submit', function (event) {
        event.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();

        if (!username || !password) {
            $('#message').text('Please enter username and password.');
            return;
        }

        $.ajax({
            url: '/api/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, password: password }),
            success: function (response) {
                console.log('Login successful:', response);

                sessionStorage.setItem('token', response.Token);

                window.location.href = 'index.html';
            },
            error: function (xhr, status, error) {
                console.error('Login failed:', error);
                if (xhr.status === 401) {
                    $('#message').text('Invalid username or password.');
                } else {
                    $('#message').text('Login failed. Please try again.');
                }
            }
        });
    });
});
