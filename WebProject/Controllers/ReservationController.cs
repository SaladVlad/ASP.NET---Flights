using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using WebProject.Models;

namespace WebProject.Controllers
{
    [RoutePrefix("api/reservations")]
    public class ReservationController : ApiController
    {
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetReservations()
        {
            var reservations = new List<Reservation>();
            var flights = (List<Flight>)HttpContext.Current.Application["flights"];

            foreach (var user in (List<User>)HttpContext.Current.Application["users"])
            {
                foreach (var reservation in user.Reservations)
                {
                    var flight = flights.FirstOrDefault(f => f.Id == reservation.FlightID);
                    if (flight != null && flight.FlightStatus == FlightStatus.Finished)
                    {
                        reservation.ReservationStatus = ReservationStatus.Finished;
                        Helpers.XmlHelper.SaveData((List<User>)HttpContext.Current.Application["users"], HostingEnvironment.MapPath("~/App_Data/users.xml"));
                    }
                    reservations.Add(reservation);
                }
            }
            return Ok(reservations);
        }

        [HttpGet]
        [Route("flightId={flightId}/")]
        public IHttpActionResult GetReservationsByFlightId(int flightId)
        {
            var reservations = new List<Reservation>();
            var flights = (List<Flight>)HttpContext.Current.Application["flights"];
            var flight = flights.FirstOrDefault(f => f.Id == flightId);

            foreach (var user in (List<User>)HttpContext.Current.Application["users"])
            {
                foreach (var reservation in user.Reservations)
                {
                    if (reservation.FlightID == flightId)
                    {
                        if (flight != null && flight.FlightStatus == FlightStatus.Finished)
                        {
                            reservation.ReservationStatus = ReservationStatus.Finished;
                            Helpers.XmlHelper.SaveData((List<User>)HttpContext.Current.Application["users"], HostingEnvironment.MapPath("~/App_Data/users.xml"));
                        }
                        reservations.Add(reservation);
                    }
                }
            }
            return Ok(reservations);
        }

        [HttpPost]
        [Route("")]
        public IHttpActionResult PostReservation([FromBody] Reservation reservation)
        {
            if (reservation == null)
            {
                return BadRequest("Invalid reservation data.");
            }

            var users = (List<User>)HttpContext.Current.Application["users"];
            var user = users.FirstOrDefault(u => u.Username == reservation.User);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var flights = (List<Flight>)HttpContext.Current.Application["flights"];
            var flight = flights.FirstOrDefault(f => f.Id == reservation.FlightID);

            if (flight == null)
            {
                return BadRequest("Flight not found.");
            }

            var seats = flight.Seats.Split('/');
            int available = int.Parse(seats[0]);
            int taken = int.Parse(seats[1]);

            if (available < reservation.PassengerNumber)
            {
                return BadRequest("Flight doesn't have the required seat amount!");
            }

            available -= reservation.PassengerNumber;
            taken += reservation.PassengerNumber;
            flight.Seats = $"{available}/{taken}";

            UpdateFlightInAirlines(flight);
            Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

            List<Reservation> allReservations = GetAllReservations();

            reservation.Id = allReservations.Max(r => r.Id) + 1;

            user.Reservations.Add(reservation);
            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            return Ok(reservation);
        }


        [HttpDelete]
        [Route("{reservationId}")]
        public IHttpActionResult DeleteReservation(int reservationId)
        {
            var users = (List<User>)HttpContext.Current.Application["users"];
            Reservation reservationToDelete = null;
            User userWithReservation = null;

            foreach (var user in users)
            {
                reservationToDelete = user.Reservations.FirstOrDefault(r => r.Id == reservationId);
                if (reservationToDelete != null)
                {
                    userWithReservation = user;
                    break;
                }
            }

            if (reservationToDelete == null)
            {
                return NotFound();
            }

            var flights = (List<Flight>)HttpContext.Current.Application["flights"];
            var flight = flights.FirstOrDefault(f => f.Id == reservationToDelete.FlightID);

            if (flight == null)
            {
                return BadRequest("Flight not found.");
            }

            var seats = flight.Seats.Split('/');
            int available = int.Parse(seats[0]);
            int taken = int.Parse(seats[1]);

            taken -= reservationToDelete.PassengerNumber;
            available += reservationToDelete.PassengerNumber;

            flight.Seats = $"{available}/{taken}";
            UpdateFlightInAirlines(flight);
            Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

            reservationToDelete.ReservationStatus = ReservationStatus.Cancelled;
            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            return Ok("Reservation cancelled successfully.");
        }

        [HttpPost]
        [Route("{reservationId}/approve")]
        public IHttpActionResult ApproveReservation(int reservationId)
        {
            var users = (List<User>)HttpContext.Current.Application["users"];
            Reservation reservationToApprove = null;

            foreach (var user in users)
            {
                reservationToApprove = user.Reservations.FirstOrDefault(r => r.Id == reservationId);
                if (reservationToApprove != null)
                {
                    break;
                }
            }

            if (reservationToApprove == null)
            {
                return NotFound();
            }

            reservationToApprove.ReservationStatus = ReservationStatus.Approved;
            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            return Ok("Reservation approved successfully.");
        }

        private void UpdateFlightInAirlines(Flight flight)
        {
            var airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
            foreach (var airline in airlines)
            {
                var airlineFlight = airline.Flights.FirstOrDefault(f => f.Id == flight.Id);
                if (airlineFlight != null)
                {
                    airlineFlight.Seats = flight.Seats;
                    airlineFlight.FlightStatus = flight.FlightStatus;
                }
            }
            Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
        }
        private List<Reservation> GetAllReservations()
        {
            var users = (List<User>)HttpContext.Current.Application["users"];
            List<Reservation> reservations = new List<Reservation>();

            foreach (User user in users)
            {
                foreach (Reservation r in user.Reservations)
                {
                    reservations.Add(r);
                }
            }
            return reservations;

        }
    }
}
