//MODULES.push('sd');
//angular.module('sd', ['ngTable'])
//.service('GridService', ['$q', '$http', function ($q, $http) {
//    var GridService = {};
//    $http = $http
//    //GridService.Test = function (data, $scope) {
//    //    var dobj = $q.defer();

//    //}
//    return GridService;
//}])
//.controller('GridController', ['$scope', 'GridService', '$http', '$compile', '$timeout', function ($scope, UpdateUserService, $http, $compile, $timeout) {

//    $scope.clicker = function () {
//        alert('Clicked');
//    };

//    $scope.filterOptions = {
//        filterText: "",
//        useExternalFilter: true
//    };
//    $scope.totalServerItems = 0;
//    $scope.pagingOptions = {
//        pageSizes: [5, 10, 20],
//        pageSize: 5,
//        currentPage: 1
//    };
//    $scope.setPagingData = function (data, page, pageSize) {
//        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
//        $scope.myData = pagedData;
//        $scope.totalServerItems = data.length;
//        if (!$scope.$$phase) {
//            $scope.$apply();
//        }
//    };
//    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
//        setTimeout(function () {
//            var data;
//            var largeload = {};
//            largeload = [{ "name": "Moroni", "allowance": 505050505050505050, "paid": true },
//{ "name": "Tiancum", "allowance": 53, "paid": false },
//{ "name": "Jacob", "allowance": 27, "paid": false },
//{ "name": "Nephi", "allowance": 29, "paid": false },
//{ "name": "Enos", "allowance": 34, "paid": false },
//{ "name": "Ether", "allowance": 42, "paid": false },
//{ "name": "Alma", "allowance": 43, "paid": true },
//{ "name": "Jared", "allowance": 21, "paid": true },
//{ "name": "Moroni", "allowance": 50, "paid": true },
//{ "name": "Tiancum", "allowance": 53, "paid": false },
//{ "name": "Jacob", "allowance": 27, "paid": false },
//{ "name": "Nephi", "allowance": 29, "paid": false },
//{ "name": "Enos", "allowance": 34, "paid": false },
//{ "name": "Ether", "allowance": 42, "paid": false },
//{ "name": "Alma", "allowance": 43, "paid": true },
//{ "name": "Jared", "allowance": 21, "paid": true },
//{ "name": "Moroni", "allowance": 50, "paid": true },
//{ "name": "Tiancum", "allowance": 53, "paid": false },
//{ "name": "Jacob", "allowance": 27, "paid": false },
//{ "name": "Nephi", "allowance": 29, "paid": false },
//{ "name": "Enos", "allowance": 34, "paid": false },
//{ "name": "Ether", "allowance": 42, "paid": false },
//{ "name": "Alma", "allowance": 43, "paid": true },
//{ "name": "Jared", "allowance": 21, "paid": true },
//{ "name": "Moroni", "allowance": 50, "paid": true },
//{ "name": "Tiancum", "allowance": 53, "paid": false },
//{ "name": "Jacob", "allowance": 27, "paid": false },
//{ "name": "Nephi", "allowance": 29, "paid": false },
//{ "name": "Enos", "allowance": 34, "paid": false },
//{ "name": "Ether", "allowance": 42, "paid": false },
//{ "name": "Alma", "allowance": 43, "paid": true },
//{ "name": "Jared", "allowance": 21, "paid": true },
//{ "name": "Moroni", "allowance": 50, "paid": true },
//{ "name": "Tiancum", "allowance": 53, "paid": false }];
//            if (searchText) {
//                var ft = searchText.toLowerCase();
//                //   $http.get('largeLoad.json').success(function (largeLoad) {
//                data = largeLoad.filter(function (item) {
//                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
//                    //});
//                    $scope.setPagingData(data, page, pageSize);
//                });
//            } else {
//                // $http.get('largeLoad.json').success(function (largeLoad) {
//                $scope.setPagingData(largeLoad, page, pageSize);
//                // });
//            }
//        }, 100);
//    };

//    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

//    $scope.$watch('pagingOptions', function (newVal, oldVal) {
//        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
//            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
//        }
//    }, true);
//    $scope.$watch('filterOptions', function (newVal, oldVal) {
//        if (newVal !== oldVal) {
//            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
//        }
//    }, true);

//    $scope.gridOptions = {
//        data: 'myData',
//        enablePaging: true,
//        showFooter: true,
//        totalServerItems: 'totalServerItems',
//        pagingOptions: $scope.pagingOptions,
//        filterOptions: $scope.filterOptions
//    };












//    //var data = [{ name: "Moroni", age: 50 },
//    //           { name: "Tiancum", age: 43 },
//    //           { name: "Jacob", age: 27 },
//    //           { name: "Nephi", age: 29 },
//    //           { name: "Enos", age: 34 },
//    //           { name: "Tiancum", age: 43 },
//    //           { name: "Jacob", age: 27 },
//    //           { name: "Nephi", age: 29 },
//    //           { name: "Enos", age: 34 },
//    //           { name: "Tiancum", age: 43 },
//    //           { name: "Jacob", age: 27 },
//    //           { name: "Nephi", age: 29 },
//    //           { name: "Enos", age: 34 },
//    //           { name: "Tiancum", age: 43 },
//    //           { name: "Jacob", age: 27 },
//    //           { name: "Nephi", age: 29 },
//    //           { name: "Enos", age: 34 }];

//    //$scope.tableParams = new ngTableParams({
//    //    page: 1,            // show first page
//    //    count: 10           // count per page
//    //}, {
//    //    total: data.length, // length of data
//    //    getData: function ($defer, params) {
//    //        $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
//    //    }
//    //});

//}]);



////var app = angular.module('main', ['ngTable']).
////        controller('DemoCtrl', function ($scope, ngTableParams, $sce) {



////        });


var TestData = angular.module('Qatar', ['ngGrid']);
MODULES.push('Qatar');
TestData.service('TestDataService', ['$q', '$http',
function ($q, $http) {
    var TestDataService = {};
    $http = $http;

}]);
TestData.controller('QatarController', ['$scope', '$http', '$compile', '$timeout', 'TestDataService',
function ($scope, $http, $compile, $timeout, TestDataService) {

    $scope.clicker = function () {
        alert('dsfdsf');
    };

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [5, 10, 20],
        pageSize: 5,
        currentPage: 1
    };
    $scope.setPagingData = function (data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            var largeLoad = {};
            largeLoad = [{ "name": "Moroni", "allowance": 505050505050505050, "paid": true },
{ "name": "Tiancum", "allowance": 53, "paid": false },
{ "name": "Jacob", "allowance": 27, "paid": false },
{ "name": "Nephi", "allowance": 29, "paid": false },
{ "name": "Enos", "allowance": 34, "paid": false },
{ "name": "Ether", "allowance": 42, "paid": false },
{ "name": "Alma", "allowance": 43, "paid": true },
{ "name": "Jared", "allowance": 21, "paid": true },
{ "name": "Moroni", "allowance": 50, "paid": true },
{ "name": "Tiancum", "allowance": 53, "paid": false },
{ "name": "Jacob", "allowance": 27, "paid": false },
{ "name": "Nephi", "allowance": 29, "paid": false },
{ "name": "Enos", "allowance": 34, "paid": false },
{ "name": "Ether", "allowance": 42, "paid": false },
{ "name": "Alma", "allowance": 43, "paid": true },
{ "name": "Jared", "allowance": 21, "paid": true },
{ "name": "Moroni", "allowance": 50, "paid": true },
{ "name": "Tiancum", "allowance": 53, "paid": false },
{ "name": "Jacob", "allowance": 27, "paid": false },
{ "name": "Nephi", "allowance": 29, "paid": false },
{ "name": "Enos", "allowance": 34, "paid": false },
{ "name": "Ether", "allowance": 42, "paid": false },
{ "name": "Alma", "allowance": 43, "paid": true },
{ "name": "Jared", "allowance": 21, "paid": true },
{ "name": "Moroni", "allowance": 50, "paid": true },
{ "name": "Tiancum", "allowance": 53, "paid": false },
{ "name": "Jacob", "allowance": 27, "paid": false },
{ "name": "Nephi", "allowance": 29, "paid": false },
{ "name": "Enos", "allowance": 34, "paid": false },
{ "name": "Ether", "allowance": 42, "paid": false },
{ "name": "Alma", "allowance": 43, "paid": true },
{ "name": "Jared", "allowance": 21, "paid": true },
{ "name": "Moroni", "allowance": 50, "paid": true },
{ "name": "Tiancum", "allowance": 53, "paid": false }];
            if (searchText) {
                var ft = searchText.toLowerCase();
                // $http.get('largeLoad.json').success(function (largeLoad) {
                data = largeLoad.filter(function (item) {
                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    // });
                    $scope.setPagingData(data, page, pageSize);
                });
            } else {
                // $http.get('largeLoad.json').success(function (largeLoad) {
                $scope.setPagingData(largeLoad, page, pageSize);
                /// });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };

}
]);
