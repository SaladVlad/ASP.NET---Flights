using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Http;

namespace WebProject.Controllers
{
    [RoutePrefix("api")]
    public class AccountController : ApiController
    {
        [HttpGet]
        [Route("role")]
        public IHttpActionResult GetUserRole()
        {
            string token = (string)Request.Headers.Authorization?.ToString();
            Tuple<string,string> userAndRole;

            ((Dictionary<string, Tuple<string,string>>)HttpContext.Current.Application["tokens"]).TryGetValue(token, out userAndRole);
            if (userAndRole == null)
            {
                return Unauthorized();
            }

            return Ok(new { role = userAndRole.Item2 });
        }
    }

}
