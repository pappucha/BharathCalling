using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Mime;
using System.Web;
using System.Web.Mvc;

namespace Glams.CustomControl.Controllers
{
    [Authorize]
    public class DownloadController : Controller
    {
        // GET: Files
        public async System.Threading.Tasks.Task<ActionResult> Files(string id, string folder)
        {
            try
            {
                var ServiceUri = ConfigurationManager.AppSettings["ServiceUri"].ToString();

                System.Net.HttpWebRequest WebReq = null;

                switch (folder)
                {
                    case "TheFile":
                        WebReq = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(new Uri(ServiceUri + "api/Service/ArtworkFile?Id=" + id));
                        break;
                    case "TheSupportDoc":
                        WebReq = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(new Uri(ServiceUri + "api/Service/Download?Id=" + id));
                        break;
                    default:
                        WebReq = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(new Uri(ServiceUri + string.Format("api/Service/DownloadOthers?Id={0}&folder={1}", id, folder)));
                        break;
                }

                var WebResp = (System.Net.HttpWebResponse)WebReq.GetResponse();
                using (var stream = new System.IO.MemoryStream())
                {
                    WebResp.GetResponseStream().CopyTo(stream);
                    Response.AddHeader("Content-Disposition", "inline; filename=" + WebResp.Headers["FileName"]);
                    return new FileContentResult(stream.ToArray(), "application/octet-stream");
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async System.Threading.Tasks.Task<ActionResult> GetPreview(string token)
        {
            var jobInfo = Glams.Common.Web.JobInfoCache.GetJobInfo(token);
            if (jobInfo == null) return null;
            if (jobInfo.JobInfo == null) return null;

            try
            {
                var ServiceUri = ConfigurationManager.AppSettings["ServiceUri"].ToString();

                Entities.Job.File file = null; 

                using (var db = new Entities.Job.DB())
                    file = db.Files.Where(a => a.JobID == jobInfo.JobInfo.ID && a.Active == true && a.SubFolder == "thePreview").OrderByDescending(a => a.ID).FirstOrDefault();

                if(file != null)
                {
                    var WebReq = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(new Uri(ServiceUri + "api/Service/Download?Id=" + file.ID));

                    var WebResp = (System.Net.HttpWebResponse)WebReq.GetResponse();

                    using (var stream = new System.IO.MemoryStream())
                    {
                        WebResp.GetResponseStream().CopyTo(stream);
                        Response.AddHeader("Content-Disposition", "inline; filename=" + WebResp.Headers["FileName"]);
                        return new FileContentResult(stream.ToArray(), "application/octet-stream");
                    }    
                }

                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}