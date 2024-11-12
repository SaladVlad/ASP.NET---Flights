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
    public class RegisterController : ApiController
    {
        public class RegisterModel
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
            public string DateOfBirth { get; set; }
            public string Gender { get; set; }
        }

        public class RegisterResponse
        {
            public string Message { get; set; }
        }

        // POST api/register
        [HttpPost]
        [Route("api/register")]
        public IHttpActionResult Register([FromBody] RegisterModel register)
        {
            if (register == null)
            {
                return BadRequest("Invalid registration data.");
            }

            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            if (users.Any(u => u.Username.Equals(register.Username)))
            {
                return BadRequest("Username already exists.");
            }

            User newUser = new User
            {
                Username = register.Username,
                Password = register.Password,
                FirstName = register.FirstName,
                LastName = register.LastName,
                Email = register.Email,
                DateOfBirth = register.DateOfBirth,
                Gender = register.Gender,
                Reservations = new List<Reservation>()
            };

            users.Add(newUser);
            HttpContext.Current.Application["users"] = users;

            Helpers.XmlHelper.SaveData<User>(users, HostingEnvironment.MapPath("~/App_Data/users.xml"));

            return Ok(new RegisterResponse { Message = "Registration successful" });
        }
    }
}
