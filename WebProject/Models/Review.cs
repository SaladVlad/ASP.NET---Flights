using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebProject.Models
{
    public enum ReviewStatus { Created,Approved,Denied }
    public class Review
    {
        public int Id { get; set; }
        public string ReviewerUsername { get; set; }
        public int AirlineId { get; set; }
        public string AirlineName { get; set; }
        public string Headline { get; set; }
        public string Content { get; set; }
        public ReviewStatus Status { get; set; }
        public string UploadedFileName { get; set; }
        public string UploadedFileUrl { get; set; }
    }
}