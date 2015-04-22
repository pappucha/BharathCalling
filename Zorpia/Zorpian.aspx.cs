using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Http.Headers;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public partial class Zorpia_Zorpian : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void btnsubmit_Click(object sender, EventArgs e)
    {
        WebRequest req = WebRequest.Create(txturl.Text);
        ((HttpWebRequest)req).Method = "GET";
        ((HttpWebRequest)req).UserAgent = "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0";
        ((HttpWebRequest)req).Accept = "application/json, text/javascript, */*";
        ((HttpWebRequest)req).Referer = "http://www.zorpia.com/";
        ((HttpWebRequest)req).Host = "www.zorpia.com";
       // ((HttpWebRequest)req).Connection = "keep-alive";
        //var val = new NameValueCollection();
        //val["zorpia_session"] = "0c8ac0bedbd28033882298b717cdd8aad839e1c7";
        //val["username"] = "pappucha";

        //var cookie = new CookieHeaderValue("session", val);
        //cookie.Expires = DateTimeOffset.Now.AddDays(1); 
        //cookie.Domain = req.RequestUri.Host; 
        //cookie.Path = "/";
        //CookieContainer 
        CookieContainer cookiecont = new CookieContainer();
        Uri target = new Uri("http://www.zorpia.com/");
        cookiecont.Add(new Cookie("zorpia_session", "0c8ac0bedbd28033882298b717cdd8aad839e1c7") { Domain = target.Host });
        cookiecont.Add(new Cookie("__utma", "1.775701458.1414817031.1414824325.1414827878.3") { Domain = target.Host });
        cookiecont.Add(new Cookie("utmz", "1.1414817031.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)") { Domain = target.Host });
        cookiecont.Add(new Cookie("timezone", "330") { Domain = target.Host });
       // cookiecont.Add(new Cookie("gads", "ID=9a12353ada51aed7"));
        cookiecont.Add(new Cookie("T", "14817132:S=ALNI_MYtIkw1cuiFiWREd02rbV4eS0wNew") { Domain = target.Host });
        cookiecont.Add(new Cookie("premium", "0") { Domain = target.Host });
        cookiecont.Add(new Cookie("username", "pappucha") { Domain = target.Host });
        cookiecont.Add(new Cookie("utmb", "1.1.10.1414827878") { Domain = target.Host });
        cookiecont.Add(new Cookie("__utmc", "1") { Domain = target.Host });
        cookiecont.Add(new Cookie("has_bubble", "1") { Domain = target.Host });
        cookiecont.Add(new Cookie("last_check_time", "1414827911") { Domain = target.Host });
        ((HttpWebRequest)req).CookieContainer = cookiecont;
        HttpWebResponse responce = (HttpWebResponse)req.GetResponse();
        var est = responce.StatusCode;
        var stat = responce.StatusDescription;
        DirectoryInfo dir = new DirectoryInfo(Server.MapPath("ZorpiaText"));
        StreamReader reader = new StreamReader(responce.GetResponseStream());
        //using (StreamWriter outfile = new StreamWriter(dir + @"\Test.txt", true))
        //{
        //    outfile.Write(responce);
        //}

        string result = reader.ReadToEnd();
        System.IO.StreamWriter file = new System.IO.StreamWriter("E:\\ZorpiaText\\Details.txt");
        file.WriteLine(result);
        txtarea.Text = result;
        var template = new JObject();
        var itemkeyValue = new Zorpiacla();
        var testbro = Newtonsoft.Json.JsonConvert.DeserializeObject(result);
        
        
        //var testro = Newtonsoft.Json.JsonConvert.SerializeObject(testbro);
        //template.Add("Test", Newtonsoft.Json.JsonConvert.DeserializeObject(result);
        

        //Stream stream = new Stream(responce.GetResponseStream());


    }
}