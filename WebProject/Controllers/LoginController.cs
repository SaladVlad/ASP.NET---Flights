using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web;
using System.Web.Http;
using Microsoft.IdentityModel.Tokens;
using WebProject.Models;

namespace WebProject.Controllers
{
    public class LoginController : ApiController
    {
        public class LoginModel
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        public class LoginResponse
        {
            public string Message { get; set; }
            public string Role { get; set; }
            public string Token { get; set; }
        }

        // POST api/login
        [HttpPost]
        [Route("api/login")]
        public IHttpActionResult Login([FromBody] LoginModel login)
        {
            if (login == null)
            {
                return BadRequest("Invalid login data.");
            }

            List<User> users = (List<User>)HttpContext.Current.Application["users"];

            foreach (User user in users)
            {
                if (login.Username.Equals(user.Username) && login.Password.Equals(user.Password))
                {
                    var role = user.UserType == UserType.Admin ? "Admin" : "Normal";
                    var token = GenerateJwtToken(user.Username, role);

                    Dictionary<string, Tuple<string,string>> tokens = (Dictionary<string, Tuple<string,string>>)HttpContext.Current.Application["tokens"];
                    tokens.Add(token.ToString(), new Tuple<string, string>(user.Username,role));
                    HttpContext.Current.Application["tokens"] = tokens;

                    return Ok(new LoginResponse { Message = "Login successful", Role = role, Token = token });
                }
            }

            // Authentication failed
            return Unauthorized();
        }

        [HttpDelete]
        [Route("api/logout")]
        public IHttpActionResult Logout()
        {
            string token = (string)Request.Headers.Authorization?.ToString();

            if(((Dictionary<string, Tuple<string, string>>)HttpContext.Current.Application["tokens"]).ContainsKey(token))
            {
                ((Dictionary<string, Tuple<string, string>>)HttpContext.Current.Application["tokens"]).Remove(token);
                return Ok();
            }
            return BadRequest();
        }


        private string GenerateJwtToken(string username, string role)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("VGFqbmlLbGp1Yw==")); // Use a secure key in production
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: "Server",
                audience: "Client",
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
