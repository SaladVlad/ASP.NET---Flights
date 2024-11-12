using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebProject.Helpers
{
    public static class Converter
    {
        public static DateTime ConvertToDateTime(string dateString)
        {
            // Check if the input is not null or empty
            if (string.IsNullOrEmpty(dateString))
            {
                throw new ArgumentException("The date string cannot be null or empty.");
            }

            // Split the date and time parts
            var datePart = dateString.Split('-')[0]; // Extracts the date part
            var timePart = dateString.Split('-').Length > 1 ? dateString.Split('-')[1] : "00:00"; // Extracts the time part or defaults to 00:00

            // Further split the date and time parts
            var dateComponents = datePart.Split('.');
            var timeComponents = timePart.Split(':');

            // Convert to DateTime
            var year = Convert.ToInt32(dateComponents[2]);
            var month = Convert.ToInt32(dateComponents[1]);
            var day = Convert.ToInt32(dateComponents[0]);
            var hour = Convert.ToInt32(timeComponents[0]);
            var minute = timeComponents.Length > 1 ? Convert.ToInt32(timeComponents[1]) : 0;

            return new DateTime(year, month, day, hour, minute, 0);
        }

    }
}