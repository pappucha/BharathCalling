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


public partial class Zorpia_GetZorpia : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void btnsubmit_Click(object sender, EventArgs e)
    {

        var request = (HttpWebRequest)WebRequest.Create(txturl.Text);
        request.Method = "GET";
        //request.ContentType = "application/json, text/javascript, */*";
        request.UserAgent = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36";
        request.Accept = "application/json, text/javascript, */*";
        request.Referer = "http://www.zorpia.com/";
        request.Host = "www.zorpia.com";

        Uri target = new Uri("http://www.zorpia.com/");
        var coookies = new CookieContainer();
        coookies.Add(new Cookie("zorpia_session", "e8ff6dc3466b84a81fbfa7c841946fed365b8f81") { Domain = target.Host });
        coookies.Add(new Cookie("__utma", "1.2000430444.1415100832.1415100832.1415100832.1") { Domain = target.Host });
        coookies.Add(new Cookie("__utmb", "1.3.10.1415100832") { Domain = target.Host });
        coookies.Add(new Cookie("__utmc", "1") { Domain = target.Host });
        coookies.Add(new Cookie("__utmz", "1.1415100832.1.1.utmcsr=zorpia.com|utmccn=(referral)|utmcmd=referral|utmcct=/") { Domain = target.Host });
        coookies.Add(new Cookie("premium", "0") { Domain = target.Host });
        coookies.Add(new Cookie("username", "pappucha") { Domain = target.Host });
        coookies.Add(new Cookie("timezone", "330") { Domain = target.Host });
        coookies.Add(new Cookie("__gads", "ID=6492bfbd66e783bc:T=1415100824:S=ALNI_Mb9a7LtsXyth5AfSlpXNKEddoUDsw") { Domain = target.Host });
        coookies.Add(new Cookie("has_bubble", "1") { Domain = target.Host });
        request.CookieContainer = coookies;
        //request.UseDefaultCredentials = true;
        //request.Proxy.Credentials = System.Net.CredentialCache.DefaultCredentials;
        var responce = (HttpWebResponse)request.GetResponse();
        StreamReader responcereader = new StreamReader(responce.GetResponseStream());
        var responsedata = responcereader.ReadToEnd();
        string details = responsedata.ToString();
        txtResult.Text = details;
        var serialize = Newtonsoft.Json.JsonConvert.DeserializeObject(details);
        var ConnectionString = ConfigurationManager.ConnectionStrings["Glams"].ConnectionString;
        if (txturl.Text.Contains("ajax_first_load"))
        {
            dynamic x = Newtonsoft.Json.JsonConvert.DeserializeObject(details);
            var result = x.result;
            foreach (var item in result)
            {
                var username = item.username;
                // Save it in Db and Then Call mail function.
                
                using (var sql = new SqlConnection(ConnectionString))
                {
                    sql.Open();
                    var query = "insert into UserUpdateStatus values('" + username + "',0)";
                    SqlCommand cmd = new SqlCommand(query, sql);
                    cmd.ExecuteNonQuery();
                }

            }
        }
        else
        {
            /// Desrialize in Another way
            /// 
            dynamic x = Newtonsoft.Json.JsonConvert.DeserializeObject(details);
            foreach (var item in x)
            {
                var userName = item.username;
                using (var sql = new SqlConnection(ConnectionString))
                {
                    sql.Open();
                    var query = "insert into UserUpdateStatus values('" + userName + "',0)";
                    SqlCommand cmd = new SqlCommand(query, sql);
                    cmd.ExecuteNonQuery();
                }
            }
        }




    }
}