using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.DynamicData;
using System.Web.Hosting;
using System.Web.Http;
using WebProject.Models;

namespace WebProject.Controllers
{
    [RoutePrefix("api/users")]
    public class UsersController : ApiController
    {
        [HttpGet]
        [Route("{username}")]
        public IHttpActionResult GetUserByUsername(string username)
        {
            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            var user = users.FirstOrDefault(a => a.Username.Equals(username));
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }


        [HttpGet]
        [Route("token")]
        public IHttpActionResult GetUsernameWithToken()
        {
            string token = (string)Request.Headers.Authorization?.ToString();
            Tuple<string, string> userAndRole;

            ((Dictionary<string, Tuple<string, string>>)HttpContext.Current.Application["tokens"]).TryGetValue(token, out userAndRole);
            if (userAndRole == null)
            {
                return BadRequest();
            }
            return Ok(new { username = userAndRole.Item1 }); //returns username associated with the token
        }

        [HttpGet]
        [Route("")]
        public IHttpActionResult GetUsers()
        {
            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            return Ok(users);
        }

        [HttpGet]
        [Route("{username}/flights")]
        public IHttpActionResult GetFlightsByUsername(string username)
        {

            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            var user = users.FirstOrDefault(u => u.Username.Equals(username));

            if (user == null)
            {
                return NotFound();
            }
            List<Flight> userFlights = new List<Flight>();
            foreach (Flight f in (List<Flight>)HttpContext.Current.Application["flights"])
            {
                if (f.Deleted)
                {
                    continue;
                }

                if (DateTime.Now >= Helpers.Converter.ConvertToDateTime(f.ArrivalTime) && f.FlightStatus != FlightStatus.Cancelled)
                {
                    f.FlightStatus = FlightStatus.Finished;
                }
                else if (f.FlightStatus != FlightStatus.Cancelled)
                {
                    f.FlightStatus = FlightStatus.Active;
                }
                foreach (Reservation r in user.Reservations)
                {
                    if(r.FlightID == f.Id && r.ReservationStatus!=ReservationStatus.Cancelled)
                    {
                        userFlights.Add(f);
                        break;
                    }
                }
            }
            // Return the user's flights
            return Ok(userFlights);
        }

        [HttpGet]
        [Route("{username}/reservations")]
        public IHttpActionResult GetReservationsByUsername(string username)
        {

            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            var user = users.FirstOrDefault(u => u.Username.Equals(username));

            if (user == null)
            {
                return NotFound();
            }

            foreach(Reservation r in user.Reservations)
            {
                Flight f = ((List<Flight>)HttpContext.Current.Application["flights"]).Find(fl => r.FlightID == fl.Id);
                if (f.FlightStatus == FlightStatus.Finished)
                {
                    r.ReservationStatus = ReservationStatus.Finished;
                    Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));
                }
            }

            // Return the user's flights
            return Ok(user.Reservations);
        }


        [HttpPost]
        [Route("")]
        public IHttpActionResult UpdateUser([FromBody] User updatedUser)
        {
            List<User> users = (List<User>)HttpContext.Current.Application["users"];
            Dictionary<string, Tuple<string, string>> tokenStorage = (Dictionary<string, Tuple<string, string>>)HttpContext.Current.Application["tokens"];
            string token = (string)Request.Headers.Authorization?.ToString();

            Tuple<string, string> userAndRole;

            tokenStorage.TryGetValue(token, out userAndRole);

            string username = userAndRole.Item1;

            var user = users.FirstOrDefault(a => a.Username.Equals(username));
            if (user == null)
            {
                return NotFound();
            }

            if (!username.Equals(updatedUser.Username))
            {
                user.Username = updatedUser.Username;
                foreach(Reservation r in user.Reservations)
                {
                    r.User = updatedUser.Username;
                }
            }

            user.Password = updatedUser.Password;
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.DateOfBirth = updatedUser.DateOfBirth;
            user.Gender = updatedUser.Gender;

            HttpContext.Current.Application["users"] = users;
            Helpers.XmlHelper.SaveData(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            return Ok(user);
        }

    }
}
