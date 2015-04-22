/*The name of the file does not matter. You can keep as many controllers as you want.
 However a controller will be called by Angular only if you declare in HTML that for a
 given view this controller is to be used. This is how you declare:

 <div ng-controller="myController"></div>

 */
var scopeGlobal;

function myController($scope){
    //I didn't wanted to use window.alert() to show that controller is called first
    console.log("First: Inside AngularJS Controller: called when DOM tree is created");

    //Stock price object.
    $scope.stockPrice = {
        "Google":  "600$",
        "Microsoft": "400$",
        "VMWare": "500$"
    };

    //Select VMWare by default
    $scope.selectedCompany = "VMWare";

    //Store $scope in a global variable so that subscribeBtnClicked()
    //which is not part of controller code can also see values of scope
    scopeGlobal = $scope;
}

function subscribeBtnClicked(){
    //You need to read value from DOM tree. It is auto populated
    alert("Mail id:  " + scopeGlobal.emailId);
}

function onDomLoaded(){
    console.log("Second: Inside HTML onload, called when DOM is rendered");
}