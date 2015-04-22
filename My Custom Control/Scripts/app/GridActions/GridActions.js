function ReAssign(event, rowArr) {
    var id = [];
    $.each(rowArr, function (i, row) {
        id.push(row.ID);
    });
    var prompt = $.prompt('Select User', {
        inputs: [{
            type: 'select',
            required: true,
            label: 'Select User',
            value: '',
            list: [{ text: "Loading users...", value: "" }]
        }],
        onComplete: function (res, values) {
            if (res == 'Ok') {
                $.ajax({
                    headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                    url: path + 'api/grid/ReAssign?userName=' + values + '&ID=' + id.toString(),
                    method: 'GET'
                }).success(function (data) {
                    window.location.reload();
                });
            }
        }
    });

    $.ajax({
        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        url: path + 'api/grid/GetGroupUsers',
        method: 'GET'
    }).success(function (data) {
        var select = prompt.Popup.find('select');
        select.find('option').eq(0).html('--Select--');
        $.each(data, function (i, l) {
            select.append('<option value="' + l + '">' + l + '</option>');
        });
    });

}

function AssignToMe(event, rowArr) {
    if (!rowArr || !rowArr.length)
        return false;
    var id = [];
    $.each(rowArr, function (i, row) {
        id.push(row.ID);
    });
    $.ajax({
        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
        url: path + 'api/grid/AssignToMe?ID=' + id.toString(),
        method: 'GET'
    }).success(function (data) {
        window.location.reload();
    });
}

function DisplayArchived(event, rowArr, scope) {
    var elm = $(event.target).closest('a');
    elm.toggleClass('active');
    var dipslayArchived = elm.hasClass('active');
    scope.gridOptions.extendedObject.Cancel = false;
    scope.gridOptions.extendedObject.Archived = dipslayArchived;
    scope.grid.loadDataSet();
}

function DisplayCancel(event, rowArr, scope) {
    var elm = $(event.target).closest('a');
    elm.toggleClass('active');
    var dipslayCancel = elm.hasClass('active');
    scope.gridOptions.extendedObject.Archived = false;
    scope.gridOptions.extendedObject.Cancel = dipslayCancel;
    scope.grid.loadDataSet();
}


function Cancel(event, rowArr, scope) {
    if (!rowArr || !rowArr.length)
        return false;

    var jobId = [];
    $.each(rowArr, function (i, row) {
        jobId.push(row.JobID);
    });

    if (confirm("Are you sure want to cancel ?")) {
        $.ajax({
            url: path + 'api/Grid/Cancel?JobId=' + jobId.toString(),
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
            success: function (data) {
                window.location.reload();
            },
            error: function (error) {

            }
        })
    }
    return false;
}

function ExportToExcel(event, rowArr, $scope) {
    
    var groups = [];
    groups = (typeof $scope.grid.extendedObject.SelectedGroup == 'string') ?
                            [$scope.grid.extendedObject.SelectedGroup] :
                                $scope.grid.extendedObject.SelectedGroup;

    var data = {
        GridID: $scope.grid.extendedObject.GridID,
        PageID: $scope.grid.extendedObject.PageID,
        ItemType: $scope.grid.extendedObject.ItemType,
        pageSize: $scope.pagination.pageSize,
        pageIndex: $scope.pagination.currentPage,
        Archived: $scope.grid.extendedObject.Archived,
        Cancel: $scope.grid.extendedObject.Cancel,
        pagingEnabled: $scope.grid.serverPaging,
        filterExp: $scope.grid.extendedObject.filterExp,
        parentID: $scope.grid.extendedObject.parentID,
        SelectedGroup: groups.toString(),
    };

    var params = $.param(data);

    window.location.href = path + 'api/Grid/ExportToExcel?' + params;
    //console.log(params);
}

window.glams.Actions.Add('Cancel', Cancel);
window.glams.Actions.Add('ReAssign', ReAssign);
window.glams.Actions.Add('AssignToMe', AssignToMe);
window.glams.Actions.Add('DisplayArchived', DisplayArchived);
window.glams.Actions.Add('DisplayCancel', DisplayCancel);
window.glams.Actions.Add('ExportToExcel', ExportToExcel);