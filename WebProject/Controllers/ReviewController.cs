using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using WebProject.Models;

namespace WebProject.Controllers
{
    [RoutePrefix("api/reviews")]
    public class ReviewController : ApiController
    {
        [HttpGet]
        [Route()]
        public IHttpActionResult GetReviews()
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            List<Review> reviews = new List<Review>();
            foreach (Airline a in airlines) 
            {
                foreach(Review review in a.Reviews)
                {
                    reviews.Add(review);
                }
            }
            return Ok(reviews);
        }

        [HttpPost]
        [Route("")]
        public IHttpActionResult PostReview()
        {
            var httpRequest = HttpContext.Current.Request;

            var reviewData = httpRequest.Form["reviewData"];
            var review = JsonConvert.DeserializeObject<Review>(reviewData);

            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                var filePath = HttpContext.Current.Server.MapPath($"~/UploadedFiles/{postedFile.FileName}");
                postedFile.SaveAs(filePath);

                review.UploadedFileName = postedFile.FileName;
                review.UploadedFileUrl = $"/UploadedFiles/{postedFile.FileName}";
            }
            else
            {
                review.UploadedFileName = null;
                review.UploadedFileUrl = null;
            }

            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];
            foreach (Airline a in airlines)
            {
                if (a.Id == review.AirlineId)
                {
                    review.Id = a.Reviews.Count > 0 ? a.Reviews.Max(r => r.Id) + 1 : 1;
                    a.Reviews.Add(review);
                    break;
                }
            }

            HttpContext.Current.Application["airlines"] = airlines;
            Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));

            return Ok(review);
        }

        [HttpPost]
        [Route("{id}/approve")]
        public IHttpActionResult ApproveReview(int id)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            foreach (Airline a in airlines)
            {
                foreach (Review review in a.Reviews)
                {
                    if(review.Id == id)
                    {
                        review.Status = ReviewStatus.Approved;
                        HttpContext.Current.Application["airlines"] = airlines; 
                        Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                        return Ok();
                    }
                }
            }
            return BadRequest("This review does not exist!");
        }

        [HttpPost]
        [Route("{id}/deny")]
        public IHttpActionResult DenyReview(int id)
        {
            List<Airline> airlines = (List<Airline>)HttpContext.Current.Application["airlines"];

            foreach (Airline a in airlines)
            {
                foreach (Review review in a.Reviews)
                {
                    if (review.Id == id)
                    {
                        review.Status = ReviewStatus.Denied;
                        HttpContext.Current.Application["airlines"] = airlines;
                        Helpers.XmlHelper.SaveData(airlines, HostingEnvironment.MapPath("~/App_Data/airlines.xml"));
                        return Ok();
                    }
                }
            }
            return BadRequest("This review does not exist!");
        }

        
    }
}
