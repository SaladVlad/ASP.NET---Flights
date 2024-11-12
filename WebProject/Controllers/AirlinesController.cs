using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using WebProject.Models;

namespace WebProject.Controllers
{
    [RoutePrefix("api/airlines")]
    public class AirlinesController : ApiController
    {

        public class AirlineModel
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Address { get; set; }
            public string ContactInfo { get; set; }
        }

        [HttpGet]
        [Route("{id}")]
        public IHttpActionResult GetAirline(int id)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            var airline = airlines.FirstOrDefault(a => a.Id == id);
            if (airline == null)
            {
                return NotFound();
            }
            Airline airlineForSending = new Airline();
            airlineForSending.Id = airline.Id;
            airlineForSending.Name = airline.Name;
            airlineForSending.Address = airline.Address;
            airlineForSending.ContactInfo = airline.ContactInfo;
            airlineForSending.Reviews = airline.Reviews;
            foreach(Flight flight in airline.Flights)
            {
                if (!flight.Deleted) airlineForSending.Flights.Add(flight);
            }

            return Ok(airlineForSending);
        }

        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAirlines()
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
            List<Airline> forSending = new List<Airline>();

            foreach(Airline a in airlines)
            {
                if (!a.Deleted) forSending.Add(a);
            }

            return Ok(forSending);
        }

        [HttpPut]
        [Route("")]
        public IHttpActionResult UpdateAirline([FromBody] AirlineModel airlineModel)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            Airline existingAirline = airlines.Find(a=>a.Id == airlineModel.Id);

            existingAirline.Name = airlineModel.Name;
            existingAirline.Address = airlineModel.Address;
            existingAirline.ContactInfo = airlineModel.ContactInfo;

            foreach(Flight f in existingAirline.Flights)
            {
                f.AirlineName = airlineModel.Name;
            }

            List<Flight> flights = (List<Flight>)HttpContext.Current.Application["flights"];
            foreach(Flight flight in flights)
            {
                if(flight.AirlineId == existingAirline.Id)
                {
                    flight.AirlineName = existingAirline.Name;
                }
            }
            

            HttpContext.Current.Application["flights"] = flights;
            Helpers.XmlHelper.SaveData(flights, HostingEnvironment.MapPath("~/App_Data/flights.xml"));

            HttpContext.Current.Application["airlines"] = airlines;
            Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));

            return Ok();
        }


        [HttpPost]
        [Route("")]
        public IHttpActionResult PostAirline([FromBody] AirlineModel airlineModel)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            airlines.Add(new Airline(){
                Id = airlines.Max(a=>a.Id) + 1,
                Name = airlineModel.Name, 
                Address = airlineModel.Address,
                ContactInfo = airlineModel.ContactInfo
            });

            HttpContext.Current.Application["airlines"] = airlines;
            Helpers.XmlHelper.SaveData(airlines,HostingEnvironment.MapPath("~/App_Data/airlines.xml"));

            return Ok();
        }

        [HttpDelete]
        [Route("{id}")]
        public IHttpActionResult DeleteAirline(int id)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            foreach(Airline airline in airlines)
            {
                if (airline.Id == id)
                {
                    airline.Deleted = true;
                    HttpContext.Current.Application["airlines"] = airlines;
                    Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                    
                }
            }
            return Ok();
        }

    }
}