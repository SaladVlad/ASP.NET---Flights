using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebProject.Models
{
    public enum FlightStatus { Active,Cancelled,Finished }
    public class Flight
    {
        public int Id { get; set; } 
        public int AirlineId { get; set; }
        public string AirlineName { get; set; }

        public string Departure {  get; set; }
        public string Destination { get; set; }
        public string DepartureTime { get; set; }
        public string ArrivalTime { get; set; }
        public string Seats { get; set; }
        public double Cost { get; set; }
        public FlightStatus FlightStatus { get; set; }

        public bool Deleted { get; set; }

        
    }
}