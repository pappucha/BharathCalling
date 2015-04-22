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

public partial class Zorpia_ZorpiaOffice : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void btnsubmit_Click(object sender, EventArgs e)
    {
        List<string> url = new List<string>();
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_first_load=1&ajax_search=1&browse=zorpian");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=32&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=64&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=96&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=128&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=160&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=192&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=224&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=256&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=288&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=320&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=352&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=384&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=416&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=448&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=480&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=512&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=544&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=576&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        //url.Add("http://www.zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=608&update_criteria=1&pool=0&order=attractive&online=0&country=India&gender=female&age_from_search=17&age_to_search=40");
        url.Add("http://zorpia.com/search/zorpians?ajax_first_load=1&ajax_search=1&browse=zorpian&online=1?ajax_first_load:1&ajax_search:1&browse:zorpian&online:1");
        url.Add("http://zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=32&update_criteria=1&pool=0&order=attractive&online=1&country=India&state=&city=&gender=female&age_from_search=17&age_to_search=40&_=904?ajax_search:1$keyword_quote:''&start:32&update_criteria:1&pool:0&order:attractive&online:1&country:India&state:''&city:''&gender:female&age_from_search:17&age_to_search:40&_:904");
        //url.Add("http://zorpia.com/search/zorpians?ajax_search=1&keyword_quote=&start=32&update_criteria=1&pool=0&order=attractive&online=1&country=India&state=&city=&gender=female&age_from_search=17&age_to_search=40&_=904?ajax_search:1$keyword_quote:''&start:32&update_criteria:1&pool:0&order:attractive&online:1&country:India&state:''&city:''&gender:female&age_from_search:17&age_to_search:40&_:904");


        foreach (var itemss in url)
        {
            var request = (HttpWebRequest)WebRequest.Create(itemss);
            request.Method = "GET";
            //request.ContentType = "application/json, text/javascript, */*";
            request.UserAgent = "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0";
            request.Accept = "application/json, text/javascript, */*";
            request.Referer = "http://www.zorpia.com/";
            request.Host = "www.zorpia.com";

            Uri target = new Uri("http://www.zorpia.com/");
            var coookies = new CookieContainer();
            coookies.Add(new Cookie("zorpia_session", "e856def1ef914efdfae5f6eae9015dd4a3cac8b6") { Domain = target.Host });
            coookies.Add(new Cookie("__utma", "1.91853943.1415007994.1415007994.1415007994.1") { Domain = target.Host });
            coookies.Add(new Cookie("__utmb", "1.3.10.1415007994") { Domain = target.Host });
            coookies.Add(new Cookie("__utmc", "1") { Domain = target.Host });
            coookies.Add(new Cookie("__utmz", "1.1415007994.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)") { Domain = target.Host });
            coookies.Add(new Cookie("premium", "0") { Domain = target.Host });
            coookies.Add(new Cookie("username", "pappucha") { Domain = target.Host });
            coookies.Add(new Cookie("timezone", "330") { Domain = target.Host });
            coookies.Add(new Cookie("__gads", "ID=e5a6405a51115186:T=1415008037:S=ALNI_MZ3T90TXk25fNu58RuFHmE9yLjxAw") { Domain = target.Host });
            coookies.Add(new Cookie("has_bubble", "1") { Domain = target.Host });
            request.CookieContainer = coookies;
            var responce = (HttpWebResponse)request.GetResponse();
            StreamReader responcereader = new StreamReader(responce.GetResponseStream());
            var responsedata = responcereader.ReadToEnd();
            string details = responsedata.ToString();
            txtResult.Text = details;
            var serialize = Newtonsoft.Json.JsonConvert.DeserializeObject(details);
            var ConnectionString = ConfigurationManager.ConnectionStrings["Glams"].ConnectionString;
            if (itemss.Contains("ajax_first_load"))
            {
                dynamic x = Newtonsoft.Json.JsonConvert.DeserializeObject(details);
                var result = x.result;
                foreach (var item in result)
                {
                    var username = item.username;
                    var Gender = item.gender;
                    // Save it in Db and Then Call mail function.

                    using (var sql = new SqlConnection(ConnectionString))
                    {
                        sql.Open();
                        var query = "insert into UserUpdateStatus values('" + username + "',0,'"+Gender+"')";
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
                    var Gender = item.gender;
                    using (var sql = new SqlConnection(ConnectionString))
                    {
                        sql.Open();
                        var query = "insert into UserUpdateStatus values('" + userName+ "',0,'" + Gender + "')";
                        SqlCommand cmd = new SqlCommand(query, sql);
                        cmd.ExecuteNonQuery();
                    }
                }
            }


        }

    }
    protected void btntest_Click(object sender, EventArgs e)
    {
        var ConnectionString = ConfigurationManager.ConnectionStrings["Glams"].ConnectionString;
        using (var sql = new SqlConnection(ConnectionString))
        {
            sql.Open();
            string username = "asdasd";
            var query = "insert into UserUpdateStatus values('" + username + "',0)";
            SqlCommand cmd = new SqlCommand(query, sql);
            cmd.ExecuteNonQuery();
        }

    }
}