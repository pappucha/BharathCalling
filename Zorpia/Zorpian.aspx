<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Zorpian.aspx.cs" Inherits="Zorpia_Zorpian" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

</head>
<body>
    <form id="form1" runat="server">
        <div>
            <p>
                <asp:TextBox ID="txturl" runat="server"></asp:TextBox>
            </p>
            <p>
                <asp:Button ID="btnsubmit" runat="server" Text="Submit" OnClick="btnsubmit_Click" />
            </p>
            <p>
                <asp:TextBox ID="txtarea" runat="server" TextMode="MultiLine" Height="350" Width="650"></asp:TextBox>
            </p>
            <div id='update'>This is a div. This will be updated with Contents from xml file using AJAX.</div>
            <table>
                <tr>
                    <th>User_Name</th>
                    <th>score</th>
                    <th>team</th>
                </tr>
            </table>
        </div>
    </form>
</body>
</html>
