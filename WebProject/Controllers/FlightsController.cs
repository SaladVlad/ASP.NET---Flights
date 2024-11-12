using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using WebProject.Models;

namespace WebProject.Controllers
{
    [RoutePrefix("api/flights")]
    public class FlightsController : ApiController
    {

        // GET api/flights

        [HttpGet]
        [Route()]
        public IHttpActionResult GetFlights()
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];

            List<Flight> nonDeleted = new List<Flight>();

            foreach (Flight flight in flights)
            {
                if (flight.Deleted)
                {
                    continue;
                }
                if (DateTime.Now >= Helpers.Converter.ConvertToDateTime(flight.ArrivalTime) && flight.FlightStatus!=FlightStatus.Cancelled)
                {
                    flight.FlightStatus = FlightStatus.Finished;
                    foreach(Airline airline in (List<Airline>)HttpContext.Current.Application["airlines"])
                    {
                        Flight flight1 = airline.Flights.Find(f=>f.Id == flight.Id);
                        if (flight1 != null)
                        {
                            flight1.FlightStatus = FlightStatus.Finished;
                        }
                    }
                    Helpers.XmlHelper.SaveData((List<Airline>)HttpContext.Current.Application["airlines"], HostingEnvironment.MapPath("~/App_Data/airlines.xml"));

                }
                else if(flight.FlightStatus != FlightStatus.Cancelled)
                {
                    flight.FlightStatus = FlightStatus.Active;
                    foreach (Airline airline in (List<Airline>)HttpContext.Current.Application["airlines"])
                    {
                        Flight flight1 = airline.Flights.Find(f => f.Id == flight.Id);
                        if (flight1 != null)
                        {
                            flight1.FlightStatus = FlightStatus.Active;
                        }
                    }
                    Helpers.XmlHelper.SaveData((List<Airline>)HttpContext.Current.Application["airlines"], HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                }
                nonDeleted.Add(flight);
            }

            return Ok(nonDeleted);
        }

        // GET api/flights/5
        [HttpGet]
        [Route("{id}")]
        public IHttpActionResult GetFlight(int id)
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];

            var flight = flights.FirstOrDefault(f => f.Id == id);
            if (flight == null)
            {
                return NotFound();
            }
            return Ok(flight);
        }


        // POST api/flights
        [HttpPost]
        [Route()]
        public IHttpActionResult PostFlight([FromBody] Flight flight)
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];


            var existingFlight = flights.FirstOrDefault(fl => fl.Id == flight.Id);

            if (existingFlight == null)
            {
                // New flight
                flight.Id = flights.Any() ? flights.Max(f => f.Id) + 1 : 1; // Assign new ID
                flight.FlightStatus = FlightStatus.Active;
                flight.DepartureTime = ConvertToCustomFormat(flight.DepartureTime);
                flight.ArrivalTime = ConvertToCustomFormat(flight.ArrivalTime);
                flight.Seats = $"{flight.Seats}/0"; // Initialize seats

                flights.Add(flight);

                List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
                Airline airline = airlines.FirstOrDefault(a => a.Name.Equals(flight.AirlineName));
                if (airline != null)
                {
                    airline.Flights.Add(flight);
                    HttpContext.Current.Application["airlines"] = airlines;
                    Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                }

                HttpContext.Current.Application["flights"] = flights;
                Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

                return Ok();
            }
            else
            {
                // Existing flight, update it
                existingFlight.DepartureTime = ConvertToCustomFormat(flight.DepartureTime);
                existingFlight.ArrivalTime = ConvertToCustomFormat(flight.ArrivalTime);
                existingFlight.FlightStatus = flight.FlightStatus;
                existingFlight.Cost = flight.Cost;

                List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
                Airline airline = airlines.FirstOrDefault(a => a.Name.Equals(existingFlight.AirlineName));
                if (airline != null)
                {
                    Flight airlineFlight = airline.Flights.FirstOrDefault(f => f.Id == existingFlight.Id);
                    if (airlineFlight != null)
                    {
                        airlineFlight.DepartureTime = ConvertToCustomFormat(existingFlight.DepartureTime);
                        airlineFlight.ArrivalTime = ConvertToCustomFormat(existingFlight.ArrivalTime);
                        airlineFlight.FlightStatus = existingFlight.FlightStatus;
                        airlineFlight.Cost = existingFlight.Cost;
                    }

                    HttpContext.Current.Application["airlines"] = airlines;
                    Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                }

                HttpContext.Current.Application["flights"] = flights;
                Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

                return Ok(existingFlight);
            }
        }

        public static string ConvertToCustomFormat(string input)
        {
            string inputFormat = "yyyy-MM-ddTHH:mm"; // The new input format from datetime-local input

            if (DateTime.TryParseExact(input, inputFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dateTime))
            {
                string outputFormat = "dd.MM.yyyy-HH:mm";
                // Format the DateTime object to the desired string format
                return dateTime.ToString(outputFormat);
            }
            else
            {
                throw new ArgumentException("The input string is not in the correct format.");
            }
        }


        [HttpGet]
        [Route("{id}/check")]
        public IHttpActionResult CheckIfFlightHasReservations(int id)
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];

            var flight = flights.FirstOrDefault(f => f.Id == id);
            if (flight == null)
            {
                return NotFound();
            }

            List<User> users = (List<User>)HttpContext.Current.Application["users"];
            foreach (User u in users)
            {
                if (u.Reservations.Any(r =>
                    (r.ReservationStatus == ReservationStatus.Created ||
                     r.ReservationStatus == ReservationStatus.Approved) &&
                     r.FlightID == id))
                {
                    return Ok(true);
                }
            }
            return Ok(false);
        }

        // DELETE api/flights/5
        [HttpDelete]
        [Route("{id}")]
        public IHttpActionResult DeleteFlight(int id)
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];

            var flight = flights.FirstOrDefault(f => f.Id == id);
            if (flight == null)
            {
                return NotFound();
            }
            //check if flight has any reviews
            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            foreach (User u in users)
            {
                if (u.Reservations.Find(r =>
                (r.ReservationStatus != ReservationStatus.Cancelled ||
                 r.ReservationStatus != ReservationStatus.Finished) &&
                 r.FlightID == id) != null)
                {
                    return BadRequest("Error: This flight has Created/Approved reservations!");
                }
            }

            flight.Deleted = true;
            Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

            RemoveAllReferences(flight);

            return Ok(flight);
        }

        // PUT api/flights/5/cancel
        [HttpPut]
        [Route("{id}/cancel")]
        public IHttpActionResult CancelFlight(int id)
        {
            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];

            var flight = flights.FirstOrDefault(f => f.Id == id);
            if (flight == null)
            {
                return NotFound();
            }
            if (flight.FlightStatus == FlightStatus.Finished)
            {
                return BadRequest("Cannot cancel a finished flight.");
            }

            flight.FlightStatus = FlightStatus.Cancelled;

            // Update reservations to Cancelled
            List<User> users = (List<User>)HttpContext.Current.Application["users"];
            foreach (User u in users)
            {
                foreach (Reservation r in u.Reservations)
                {
                    if (r.FlightID == id)
                    {
                        r.ReservationStatus = ReservationStatus.Cancelled;
                    }
                }
            }

            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
            foreach(Airline a in airlines)
            {
                Flight flt;
                if ((flt = a.Flights.Find(fl => fl.Id == flight.Id))!=null)
                {
                    flt.FlightStatus = FlightStatus.Cancelled;
                }
            }


            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));
            Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));
            Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));

            return Ok(flight);
        }



        private void RemoveAllReferences(Flight flight)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            foreach (User u in users)
            {
                foreach (Reservation r in u.Reservations)
                {
                    if (flight.Id == r.FlightID && r.ReservationStatus != ReservationStatus.Finished)
                    {
                        r.ReservationStatus = ReservationStatus.Cancelled;
                    }
                }
            }
            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            foreach (Airline a in airlines)
            {
                foreach (Flight f in a.Flights)
                {
                    if (f.Id == flight.Id)
                    {
                        f.Deleted = true;
                        break;
                    }
                }
            }
            Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
        }

    }
}
