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
    public class LargeFileUploadController : Controller
    {
        // GET: LargeFileUpload
        public async System.Threading.Tasks.Task<ActionResult> Index()
        {
            return View();
        }
    }
}