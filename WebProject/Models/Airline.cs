using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebProject.Models
{
    public class Airline
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string ContactInfo { get; set;}
        public List<Flight> Flights { get; set; }
        public List<Review> Reviews { get; set; }
        public bool Deleted { get; set; }

        public Airline()
        {
            Flights = new List<Flight>();
            Reviews = new List<Review>();
            Deleted = false;
        }
    }
}