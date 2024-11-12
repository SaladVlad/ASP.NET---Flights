# Airline Ticket Reservation System

This project aims to develop a web application for an information system simulating an online airline ticket reservation system. The application is used by three groups (roles) of users: Unauthenticated User, Authenticated/Registered User, and System Administrator.

The application handles the following entities:

**User:**
- Username (unique)
- Password
- First Name
- Last Name
- Email
- Date of Birth (stored in the format dd/MM/yyyy)
- Gender
- User Type (Passenger, Administrator)
- List of reservations

**Airline:**
- Name
- Address
- Contact Information
- List of flights offered
- List of reviews

**Flight:**
- Airline
- Departure Destination
- Arrival Destination
- Departure Date and Time
- Arrival Date and Time
- Number of available and occupied seats
- Price
- Status (Active, Canceled, Completed)

**Reservation:**
- User
- Flight
- Number of passengers
- Total price
- Status (Created, Approved, Canceled, Completed)

**Review:**
- Reviewer (User who wrote the review)
- Airline
- Title
- Content
- Image (optional parameter)
- Status (Created, Approved, Rejected)

## Functionality for Implementation

### Unauthenticated User
- **Home Page**: Display a list of flights with the status ACTIVE. Additionally, display basic information about each flight and the corresponding airline, allowing the user to navigate to a page displaying basic information about the selected airline.
- **Search**: Allow searching for ACTIVE flights by departure and arrival destinations, departure date, return date, and airline.
- **Combined Search**: Enable combined search for ACTIVE flights by allowing users to input multiple search parameters and displaying results that meet all entered criteria.
- **Flight Sorting**: Sort flights by ascending and descending price.

### Authenticated/Registered User
- **Home Page**: Same functionality as Unauthenticated User.
- **User Profile Page**: Allow users to view and edit their profile information.
- **Flight List**: In addition to viewing ACTIVE flights, users can view their canceled and completed flights. Allow filtering flights by status: ACTIVE, COMPLETED, CANCELED.
- **Reservation List**: View all reservations made by the currently logged-in user. Allow filtering reservations by status: CREATED, APPROVED, CANCELED, COMPLETED.
- **Flight Reservation**: Allow users to select an ACTIVE flight and enter the number of passengers. When creating a reservation, it receives the CREATED status and automatically updates the number of available/occupied seats on the flight.

### Administrator
- **User Profile Page**: Same functionality as Authenticated/Registered User.
- **User Management**: View a list of all system users. Allow searching users by name, surname, and date of birth (between two dates). Enable combined user search by entering multiple search parameters and displaying results that meet all entered criteria. Sort the user list by name (ascending and descending) and date of birth (ascending and descending).
- **Airline Administration**: View all airlines in the system. Add a new airline with all necessary information. Search for airlines by name, address, and contact information. Edit existing airline information. Delete an airline (logical deletion). It is only possible to delete airlines that do not have flights with the ACTIVE status.
- **Flight Management**: View all flights. Search for flights by departure destination, arrival destination, and departure date. Add new flights for a specific airline. When adding a flight, it receives the ACTIVE status, and all seats are initially free. Edit existing flight information. It is not possible to change the departure and arrival destinations of the flight or the price of flights that have reservations with the CREATED/APPROVED status. Delete flights (logical deletion). All deletions are logical and can only be performed on flights that do not have reservations with the CREATED/APPROVED status.
- **Reservation Administration**: View all reservations in the system. Change the status of a reservation from CREATED to APPROVED or CANCELED. Reservations can be canceled up to 24 hours before the flight departure time. When changing the reservation status to CANCELED, the number of available/occupied seats on the flight is automatically updated.
- **Review Approval**: When a Passenger creates a review for an airline, the Administrator can approve or reject it (change the status from CREATED to APPROVED or REJECTED). Approved reviews are automatically visible to everyone, while rejected reviews are visible only to the Administrator.

## Technologies Used
- Frontend: HTML, CSS, JavaScript (with Bootstrap for styling), JQuery
- Backend: ASP.NET Web API 2, JQuery, REST API
- Database: Local XML database

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the project in your preferred development environment.
3. Build and run the project.
4. Access the application through a web browser.

## Contributors
- [Vladislav Petković a.k.a. SaladVlad](https://github.com/SaladVlad)

## License
This project is licensed under the [MIT License](LICENSE).
