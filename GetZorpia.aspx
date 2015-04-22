<%@ Page Language="C#" AutoEventWireup="true" CodeFile="GetZorpia.aspx.cs" Inherits="Zorpia_GetZorpia" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    <asp:TextBox ID="txturl" runat="server"></asp:TextBox>
        <asp:Button ID="btnsubmit" runat="server" Text="Submit" OnClick="btnsubmit_Click" />
        <asp:TextBox ID="txtResult" runat="server" TextMode="MultiLine" Width="500" Height="500"></asp:TextBox>
    </div>
    </form>
</body>
</html>
