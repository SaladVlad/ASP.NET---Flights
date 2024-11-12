using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Http;
using System.Web.Hosting;
using WebProject.Models;
using Microsoft.Owin;
using System.Collections.Generic;

[assembly: OwinStartup(typeof(WebProject.Startup))]

namespace WebProject
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            HttpContext.Current.Application["tokens"] = new Dictionary<string, Tuple<string,string>>();

            HttpContext.Current.Application["flights"] = Helpers.XmlHelper.LoadData<Flight>(HostingEnvironment.MapPath("~/App_Data/flights.xml"));
            HttpContext.Current.Application["airlines"] = Helpers.XmlHelper.LoadData<Airline>(HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
            HttpContext.Current.Application["users"] = Helpers.XmlHelper.LoadData<User>(HostingEnvironment.MapPath("~/App_Data/users.xml"));
        }
    }
}
