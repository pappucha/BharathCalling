using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Windows.Forms;

public partial class SaveToOtherServer_SaveServer : System.Web.UI.Page
{
    string fileName = "";
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    private string GetImagePath()
    {
        string GetFilePath = "";
        var Url = "";
        return GetFilePath = "D:\\Users\\Rakesh.Chaubey\\Downloads\\xpath_values.JPG";
    }

    protected void btn1_Click(object sender, EventArgs e)
    {
        HttpCookie yourCookie = new HttpCookie("serverIP", "190.165.14.21");
        HttpCookie yourCookie1 = new HttpCookie("Name", "Rakesh");
        HttpCookie yourCookie2 = new HttpCookie("Tittle", "Chaubey");
        HttpCookie yourCookie3 = new HttpCookie("Gender", "male");
        HttpCookie yourCookie4 = new HttpCookie("Fix", "None");
        Response.Cookies.Add(yourCookie);
        Response.Cookies.Add(yourCookie1);
        Response.Cookies.Add(yourCookie2);
        Response.Cookies.Add(yourCookie3);
        Response.Cookies.Add(yourCookie4);

        //string fileName = "";
        //WebClient client = new WebClient();
        //NetworkCredential nc = new NetworkCredential("administrator", "nele5*3c2h");
        ////Uri addy = new Uri(@"\\192.168.2.4\UploadDocs\" + fileName);
        //Uri addy = new Uri(@"\\192.168.30.30\e$\backup\" + fileName);
        //client.Credentials = nc;
        //var localPath = GetImagePath();
        //byte[] arrReturn = client.UploadFile(addy, localPath);
        //MessageBox.Show(arrReturn.ToString());
    }
}