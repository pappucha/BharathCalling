//angular.module('ui.bootstrap.demo',['ui.bootstrap'])
//.controller('TabsDemoCtrl',function($scope, $window){
//$scope.tabs = [
//    { title:'Role Details', content:'Role Details' },
//    { title:'History', content:'History', disabled: false }
//  ];
//	$scope.countrylist = [
//    {
//        "name": "Afghanistan",
//        "code": "AF"
//    },
//    {
//        "name": "Åland Islands",
//        "code": "AX"
//    },
//		
//   
//    {
//        "name": "Botswana",
//        "code": "BW"
//    },
//    {
//        "name": "Bouvet Island",
//        "code": "BV"
//    }];
//	$scope.SaveUser=function($scope)
//	{
//		console.log($scope);
//		console.log($scope.userName);
//		console.log($scope.branchName);
//		console.log($scope.ManagerName);
//	};
//
//});

angular.module('ui.bootstrap.demo',['ui.bootstrap'])
 .service('UserService', ['$q', '$http', function ($q, $http) {
	 var UserService = {};
        $http = $http
		
		UserService.SaveUser=function(data,$scope)
		{
			alert('sddsd');
			  var dobj = $q.defer();
        $http({
            url: path + 'api/user/bindGrid',
            method: "POST",
            data: data,
        }).success(function (data) {
			alert('Success');
            dobj.resolve(true);
        }).error(function (err) {
			alert('Fail');
            dobj.reject(err);
        });
        return dobj.promise;
			
		};
		 
 }])
 .controller('TabsDemoCtrl', ['$scope', 'UserService', '$http','$compile', function ($scope, UserService, $http,$compile) {
	 var msg = [];
	 $scope.data = {}
	 
//	 $scope.tabs = [
//    { title:'Role Details', content:'Role Details' },
//    { title:'History', content:'History', disabled: false }
//  ];
	$scope.countrylist = [
    {
        "name": "Afghanistan",
        "code": "AF"
    },
    {
        "name": "Åland Islands",
        "code": "AX"
    },
		
   
    {
        "name": "Botswana",
        "code": "BW"
    },
    {
        "name": "Bouvet Island",
        "code": "BV"
    }];
	 
	 $scope.clik=function()
	 {
		alert($scope.ten); 
	 };
	 
	  $scope.editupdateEmailTemplate = function () {
        var elm = $compile('<div ng-include="\'updateEmail.html\'"></div>')($scope);
       //$scope.popup = $.modal('Email Templates', elm);
		  //alert('sdff');
    };
	 
	   $scope.initRecord = function()
        {
            $http({
		url:"http://www.w3schools.com/angular/customers.php",
		method:"GET"	
		}).success(function(data){
			console.log(data);
		$scope.data.tabledata=data;
		}).error(function(data){
		console.log('Something is wrong');
		});

        };
	 
	 $scope.getTable=function()
	 {
		 
		
	 };
	 
	 $scope.SaveUser=function(){
		 console.log(branchName.value);
		 //console.log($scope.data.branchName);
		 var data={userName:userName.value,branchName:branchName.value,ManagerName:ManagerName.value,assigned:assigned.value};
		 console.log(data.userName);
		 console.log(data.toString);
		 console.log(data.toString());
		 //http://g4web.glams.ie/api/user/ResetPasswordByUserName?username=sdfsdf
		  //url:'http://localhost:1432/api/user/saveData?details='+data.userName.value,
		  $http({
            url:'http://localhost:1432/api/user/saveData?details='+data.userName,
            method: "GET",
           // data: data,
        }).success(function (data) {
			alert('Success');
            //dobj.resolve(true);
        }).error(function (err) {
			alert('Fail');
            //dobj.reject(err);
        });
		 //UserService.SaveUser(data,$scope).then(function(data){$.notify('User Details has been updated successfully', { type: 'success' });},function(err){$.notify('Unable to update. Please Check with Admin', { type: 'error' });});
		 
		 
		 //$.notify('User Details Has Been Saved SuccessFully','success');
		 
		 
	 };
	  }]);
//.controller('TabsDemoCtrl',function($scope, $window){
//$scope.tabs = [
//    { title:'Role Details', content:'Role Details' },
//    { title:'History', content:'History', disabled: false }
//  ];
//	$scope.countrylist = [
//    {
//        "name": "Afghanistan",
//        "code": "AF"
//    },
//    {
//        "name": "Åland Islands",
//        "code": "AX"
//    },
//		
//   
//    {
//        "name": "Botswana",
//        "code": "BW"
//    },
//    {
//        "name": "Bouvet Island",
//        "code": "BV"
//    }];
//	$scope.SaveUser=function($scope)
//	{
//		console.log($scope);
//		console.log($scope.userName);
//		console.log($scope.branchName);
//		console.log($scope.ManagerName);
//	};
//
//});