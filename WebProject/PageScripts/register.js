$(document).ready(function () {
    $('#registrationForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        var registrationData = {
            username: $('#username').val(),
            password: $('#password').val(),
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            dateOfBirth: $('#dateOfBirth').val(),
            gender: $('#gender').val()
        };

        $.ajax({
            url: '/api/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registrationData),
            success: function (response) {
                // Handle success: show a success message or redirect
                console.log('Registration successful:', response);
                alert('Registration successful!');
                window.location.href = 'login.html'; // Redirect to login.html
            },
            error: function (xhr, status, error) {
                // Handle error: show an error message
                console.error('Registration failed:', error);
                $('#message').text('Registration failed. Please try again.');
            }
        });
    });
});
