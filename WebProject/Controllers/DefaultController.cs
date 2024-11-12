using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;

namespace WebProject.Controllers
{
    public class DefaultController : ApiController
    {
        [HttpGet, Route("")]
        public RedirectResult Index()
        {
            string baseUrl = Request.RequestUri.GetLeftPart(UriPartial.Authority);
            string redirectTo = baseUrl + "/Content/index.html";
            return Redirect(redirectTo);
        }
    }
}
