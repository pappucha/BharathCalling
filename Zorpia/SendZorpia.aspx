<%@ Page Language="C#" AutoEventWireup="true" CodeFile="SendZorpia.aspx.cs" Inherits="Zorpia_SendZorpia" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script type="text/javascript">
        var HttpObject;
        var url = "http://www.zorpia.com/messages/lb_send";
        function SendRequest(url) {
            HttpObject = getHttpObject();
            HttpObject.open("POST", url, true);
            HttpObject.onreadystatechange = getHttpResponse();
            HttpObject.send(null);
        }

        function getHttpResponse() {
            if (HttpObject.readyState == 4) {
                alert(HttpObject.responseText);
            }
            else {
                alert(HttpObject.readyState);
            }
        }
        function getHttpObject() {
            // gets the object fine so i took this part out
        }
        function sendMail() {

            var http = new XMLHttpRequest();
            var url = "http://www.zorpia.com/messages/lb_send";
            var params = "app_id=&abmini=profile&pm_app=new_mini_lb&sec=&send_greeting_pm=1&to=silpasilpa9999&subject=Subject&text=Message";
            http.open("POST", url, true);

            //Send the proper header information along with the request
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.setRequestHeader("Content-length", params.length);
            http.setRequestHeader("Connection", "close");

            http.onreadystatechange = function () {//Call a function when the state changes.
                if (http.readyState == 4 && http.status == 200) {
                    alert(http.responseText);
                }
            }
            http.send(params);
        }
    </script>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <asp:Button ID="btnSend" runat="server" Text="Send Mail" OnClick="btnSend_Click" />
            <asp:Button Text="Submit" runat="server" ID="btnsubmit" OnClick="btnsubmit_Click" />
        </div>
    </form>
</body>
</html>
