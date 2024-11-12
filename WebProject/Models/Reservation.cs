using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebProject.Models
{
    public enum ReservationStatus { Created,Approved,Cancelled,Finished }
    public class Reservation
    {
        public int Id { get; set; }
        public string User { get; set; }
        public int FlightID { get; set; }
        public string FlightName { get; set; }
        public int PassengerNumber { get; set; }
        public double TotalCost { get; set; }
        public ReservationStatus ReservationStatus { get; set; }

    }
}