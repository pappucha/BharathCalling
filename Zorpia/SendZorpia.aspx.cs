using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net;
using System.Web;
using System.Net.Http;
using System.IO;
using Newtonsoft.Json;
using System.Configuration;
using System.Data.SqlClient;
using Newtonsoft.Json.Linq;
using System.Net.Mime;
using System.Text;


public partial class Zorpia_SendZorpia : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void btnSend_Click(object sender, EventArgs e)
    {
        var request = (HttpWebRequest)WebRequest.Create("http://www.zorpia.com/messages/lb_send");
        request.Method = "POST";
        request.Connection = "close";
        request.ContentType = "text/plain; charset=utf-8";
        request.Date = DateTime.Now;
        //request.Headers.Add("http://www.codeproject.com/Articles/532590/Settingplusaplus-Content-Disposition-plusHTTPp")
        request.UserAgent = "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0";
        //request.Accept = "application/json, text/javascript, */*";
        request.Referer = "http://www.zorpia.com/";
        Uri target = new Uri("http://www.zorpia.com/");
        var coookies = new CookieContainer();
        coookies.Add(new Cookie("zorpia_session", "559f6e9993030774184f3003c8c509e6447886d7") { Domain = target.Host });
        coookies.Add(new Cookie("__utma", "1.603318009.1411996357.1414394822.1414401072.3") { Domain = target.Host });
        coookies.Add(new Cookie("__utmb", "1.3.10.1415007994") { Domain = target.Host });
        coookies.Add(new Cookie("__utmc", "1") { Domain = target.Host });
        coookies.Add(new Cookie("__utmz", "1.1411996357.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)") { Domain = target.Host });
        coookies.Add(new Cookie("premium", "0") { Domain = target.Host });
        coookies.Add(new Cookie("search_view", "view_gallery_result%5E98beb2eb331702d82f7e7e873c63536a") { Domain = target.Host });
        coookies.Add(new Cookie("username", "pappucha") { Domain = target.Host });
        coookies.Add(new Cookie("timezone", "-420") { Domain = target.Host });
        coookies.Add(new Cookie("__gads", "ID=210b00ce556962f0:T=1411996416:S=ALNI_Ma-xpSQC_np3vaijs6Fap_45h_o7Q") { Domain = target.Host });
        coookies.Add(new Cookie("has_bubble", "1") { Domain = target.Host });
        request.CookieContainer = coookies;
        var data = new JObject();
        data.Add("app_id", "0");
        data.Add("abmini", "0");
        data.Add("pm_app", "new_mini_lb");
        data.Add("sec", "send_greeting_pm=1");
        data.Add("to", "RajeshKumar0127");
        data.Add("subject", "dsfsdf");
        data.Add("text", "dsfdsf");
        string paramter = "app_id=&abmini=profile&pm_app=new_mini_lb&sec=&send_greeting_pm=1&to=RajeshKumar0127&subject=Subject&text=Message";
        using (var writer = new StreamWriter(request.GetRequestStream()))
        {
            //writer.Write(Newtonsoft.Json.JsonConvert.SerializeObject(data));
            writer.Write(paramter);
        }

        var responce = (HttpWebResponse)request.GetResponse();


        

        

    }
    protected void btnsubmit_Click(object sender, EventArgs e)
    {
        // Create a request using a URL that can receive a post. 
        HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://www.zorpia.com/messages/lb_send");
        // Set the Method property of the request to POST.
        request.Method = "POST";
        // Create POST data and convert it to a byte array.
        string postData = "app_id=&abmini=profile&pm_app=new_mini_lb&sec=&send_greeting_pm=1&to=RajeshKumar0127&subject=Subject&text=Message";
        byte[] byteArray = Encoding.UTF8.GetBytes(postData);
        // Set the ContentType property of the WebRequest.
        request.ContentType = "application/form-data";
        // Set the ContentLength property of the WebRequest.
        request.ContentLength = byteArray.Length;
        Uri target = new Uri("http://www.zorpia.com/");
        var coookies = new CookieContainer();
        coookies.Add(new Cookie("zorpia_session", "559f6e9993030774184f3003c8c509e6447886d7") { Domain = target.Host });
        coookies.Add(new Cookie("__utma", "1.603318009.1411996357.1414394822.1414401072.3") { Domain = target.Host });
        coookies.Add(new Cookie("__utmb", "1.3.10.1415007994") { Domain = target.Host });
        coookies.Add(new Cookie("__utmc", "1") { Domain = target.Host });
        coookies.Add(new Cookie("__utmz", "1.1411996357.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)") { Domain = target.Host });
        coookies.Add(new Cookie("premium", "0") { Domain = target.Host });
        coookies.Add(new Cookie("search_view", "view_gallery_result%5E98beb2eb331702d82f7e7e873c63536a") { Domain = target.Host });
        coookies.Add(new Cookie("username", "pappucha") { Domain = target.Host });
        coookies.Add(new Cookie("timezone", "-420") { Domain = target.Host });
        coookies.Add(new Cookie("__gads", "ID=210b00ce556962f0:T=1411996416:S=ALNI_Ma-xpSQC_np3vaijs6Fap_45h_o7Q") { Domain = target.Host });
        coookies.Add(new Cookie("has_bubble", "1") { Domain = target.Host });
        request.CookieContainer = coookies;

        // Get the request stream.
        Stream dataStream = request.GetRequestStream();
        // Write the data to the request stream.
        dataStream.Write(byteArray, 0, byteArray.Length);
        // Close the Stream object.
        dataStream.Close();
        // Get the response.
        WebResponse response = request.GetResponse();
        // Display the status.
        Console.WriteLine(((HttpWebResponse)response).StatusDescription);
        // Get the stream containing content returned by the server.
        dataStream = response.GetResponseStream();
        // Open the stream using a StreamReader for easy access.
        StreamReader reader = new StreamReader(dataStream);
        // Read the content.
        string responseFromServer = reader.ReadToEnd();
        // Display the content.
        Console.WriteLine(responseFromServer);
        // Clean up the streams.
        reader.Close();
        dataStream.Close();
        response.Close();

    }
}