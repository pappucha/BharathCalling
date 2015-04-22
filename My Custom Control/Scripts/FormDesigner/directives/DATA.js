var FORM = 'form';
var FORM_HEAD = 'form-header';
var FORM_CONTAINER = 'form-container';
var INPUT_CONTAINER = 'input-template';
var CONTEXTMENU = 'context-menu';
var PROPERTYGRID = 'property-grid';
var FORM_TOOLS = 'form-tools';
var BODY = 'body';
var DROPOVER = 'dropover';
var FOOTER = 'footer';
var FORM_TEMPLATE = 'form-template';
var TOOLS = 'tools';

var TOOL = {
    BLOCK: {
        ROW: 'Row',
        COLUMN: 'Column',
        TABS: 'Tabs',
        TAB: 'Tab',
        SECTION: 'Section',
        FORM: 'Form',
        LINEBREAK: 'LineBreak',
        PARAGRAPH: 'Paragraph',
        GROUPPANEL: 'GroupPanel'
    },
    INPUT: {
        TEXTBOX: 'TextBox',
        TEXTAREA: 'Textarea',
        PASSWORD: 'Password',
        RADIOGROUP: 'RadioGroup',
        SINGLECHECKBOX: 'SingleCheckBox',
        CHECKBOXGROUP: 'CheckboxGroup',
        FILEUPLOAD: 'FileUpload',
        GRID: 'Grid',
        SELECT: 'Select',
        DATE: 'Date',
        TIME: 'Time',
        BUTTON: 'Button',
        HIDDEN: 'Hidden',
        CUSTOMCONTROL: 'CustomControl',
        MANAGEDDATA: 'ManagedData',
        ITEMINFO: 'ItemInfo',
        MANAGEDDATAGROUP: 'ManagedDataGroup',
        USERS: 'Users',
        BARCODE: 'BarCode',
        ITEMINFOCOLLECTION: 'ItemInfoCollection'
    },
    DEFAULT: {
        RESIZER: 'Resizer',
        FORMTEMPLATE: 'FormTemplate'
    }
};

var VALIDATIONS = [{
    Name: "required",
    RegEx: ".+",
    Error: "This field is required"
}, {
    Name: "number",
    RegEx: "^[-+]?[0-9]*[\\.]?[0-9]*$",
    Error: "This field requires number"
}, {
    Name: "email",
    RegEx: "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    Error: "Please enter valid email"
}, {
    Name: "url",
    RegEx: "[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)",
    Error: "Please enter valid url"
}, {
    Name: "alphanum",
    RegEx: "^[a-zA-Z0-9\s]*$",
    Error: "This field requires AlphaNumeric values"
}, {
    Name: "alphabets",
    RegEx: "^[a-zA-Z]*$",
    Error: "This field requires Alphabets"
}, {
    Name: "password",
    RegEx: "^[a-zA-Z0-9'@&#.\\s]{7,10}$",
    Error: "Enter valid password. Allowed characters 'a-z,A-Z,0-9,@,&,#,.s'"
}, {
    Name: "minlength",
    RegEx: "^.{MIN_VAL_HERE,}$",
    Error: "You have not entered minimum length required"
}, {
    Name: "maxlength",
    RegEx: "^.{0,MAX_VAL_HERE}$",
    Error: "You have exceeded maximum length"
}, {
    Name: "minmax",
    RegEx: "^.{MIN_VAL_HERE,MAX_VAL_HERE}$",
    Error: "The value entered doesnot match minimum and maxlength required"
}];

var TEMPLATE = {
    TEXTBOX: 'Default.html',
    TEXTAREA: 'Textarea.html',
    PASSWORD: 'Default.html',
    RADIOGROUP: 'RadioGroup.html',
    CHECKBOXGROUP: 'CheckboxGroup.html',
    SINGLECHECKBOX: 'SingleCheckBox.html',
    FILEUPLOAD: 'FileUpload.html',
    SELECT: 'Select.html',
    DATE: 'Date.html',
    TIME: 'Time.html',
    BUTTON: 'Button.html',
    HIDDEN: 'Hidden.html',
    CUSTOMCONTROL: 'CustomControl.html',
    MANAGEDDATA: 'ManagedData.html',
    MANAGEDDATAGROUP: 'ManagedDataGroup.html',
    USERS: 'Users.html',
    ITEMINFO: 'ItemInfo.html',
    ITEMINFOCOLLECTION:'ItemInfoCollection.html',
    FORM: 'Form.html',
    GRID: 'Grid.html',
    BARCODE: 'BarCode.html'
};

var CREATE = {
    Form: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.FORM,
            Properties: {
                Name: 'FormName',
                IsMaster: false,
                Visible: true,
                Error: '',
                Validator: [],
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Row: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.ROW,
            Properties: {
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: [CREATE.Column()]
        };
    },
    Column: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.COLUMN,
            Properties: {
                Visible: true,
                Roles: []
            },
            Style: {
                width: '100%'
            },
            Items: []
        };
    },
    GroupPanel: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.GROUPPANEL,
            Properties: {
                Align: 'left',
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Resizer: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.DEFAULT.RESIZER,
            Properties: {
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Section: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.SECTION,
            Properties: {
                Name: "Untitled",
                Active: true,
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Tabs: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.TABS,
            Properties: {
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: [CREATE.Tab()]
        }
    },
    Tab: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.TAB,
            Properties: {
                Active: false,
                Name: 'Tab',
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    Paragraph: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.PARAGRAPH,
            Properties: {
                Name: 'Your Text Here....',
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    LineBreak: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.BLOCK.LINEBREAK,
            Properties: {
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    TextBox: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.TEXTBOX,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Size: 30,
                MaxLength: 100,
                WaterMarkText: "Text Input",
                Visible: true,
                Value: "",
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                IsNumeric: false,
                ReadOnly: false,
                Error: '',
                Validator: [],
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Password: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.PASSWORD,
            Properties: {
                Name: "InputName",
                Visible: true,
                Label: "Label",
                Size: 30,
                MaxLength: 100,
                WaterMarkText: "Password Input",
                Value: "",
                Error: '',
                Validator: [],
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                ReadOnly: false,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    FileUpload: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.FILEUPLOAD,
            Properties: {
                Name: "InputName",
                Visible: true,
                Label: "Label",
                Accept: "",
                Value: "",
                Error: '',
                Validator: [],
                MaxFiles: 1,
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Date: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.DATE,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Visible: true,
                Size: 30,
                Error: '',
                Validator: [],
                WaterMarkText: "Date Input",
                Value: "",
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                AllowPrevious: false,
                ReadOnly: false,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Textarea: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.TEXTAREA,
            Properties: {
                Name: "InputName",
                Label: "Label",
                MaxLength: 100,
                WaterMarkText: "MultilineText Input",
                Value: "",
                Rows: 5,
                Columns: 30,
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                ReadOnly: false,
                Error: '',
                Validator: [],
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Select: function () {
        var option = CREATE.Option();
        option.Selected = true;
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.SELECT,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Multiple: false,
                Size: 1,
                Options: [option],
                Required: false,
                Error: '',
                Validator: [],
                IsItemData: false,
                IsPostBack: false,
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Option: function () {
        return {
            Text: 'Option Name',
            Selected: false,
        };
    },
    Button: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.BUTTON,
            Properties: {
                Name: "",
                Value: "Button",
                Type: "button",
                Visible: true,
                IsPostBack: false,
                TaskTemplate: "",
                ModalPosition: "",
                StyleClass: "",
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Hidden: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.HIDDEN,
            Properties: {
                Name: "InputName",
                Value: "",
                Visible: true,
                IsItemData: false,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    RadioGroup: function () {
        var cRadio = CREATE.Radio();
        cRadio.Checked = true;
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.RADIOGROUP,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Options: [cRadio, CREATE.Radio(), CREATE.Radio()],
                Required: false,
                Visible: true,
                IsItemData: false,
                IsPostBack: false,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Radio: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Label: 'Option Name',
            Value: '',
            Checked: false
        };
    },
    CheckboxGroup: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.CHECKBOXGROUP,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Options: [CREATE.Checkbox(), CREATE.Checkbox(), CREATE.Checkbox()],
                Required: false,
                Error: '',
                Validator: [],
                IsItemData: false,
                IsPostBack: false,
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Checkbox: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Label: 'Option Name',
            Value: '',
            Checked: false
        };
    },
    SingleCheckBox: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.SINGLECHECKBOX,
            Properties: {
                Name: "InputName",
                Label: "Label",
                Value: false,
                Required: false,
                Error: '',
                Validator: [],
                IsItemData: false,
                IsPostBack: false,
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        };
    },
    Grid: function () {
        return {
            Id: uuid(),
            Type: TOOL.INPUT.GRID,
            Properties: {
                GridSettings: {
                    IsCustomGrid: false,
                    Visible: true,
                    columns: [],
                    actions: []
                }
            },
            Items: []
        };
    },
    CustomControl: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.CUSTOMCONTROL,
            Properties: {
                Name: 'CustomControl',
                Config: "",
                Visible: true,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    ManagedData: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.MANAGEDDATA,
            Properties: {
                Name: 'ManagedDataName',
                Label: 'Managed Data',
                Multiple: false,
                Value: '',
                Visible: true,
                Error: '',
                Validator: [],
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                ShowAttributes: false,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    ManagedDataGroup: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.MANAGEDDATAGROUP,
            Properties: {
                Name: 'ManagedDataGroupName',
                Label: 'Managed Data Group',
                Multiple: false,
                Value: '',
                Visible: true,
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                Defaults: [],
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    Users: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.USERS,
            Properties: {
                Name: 'Users',
                Label: 'Users',
                Multiple: false,
                Value: '',
                Visible: true,
                Required: false,
                IsItemData: false,
                IsPostBack: false,
                Defaults: "",
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    ItemInfo: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.ITEMINFO,
            Properties: {
                Name: '',
                Label: 'Item Info',
                IsItemData: false,
                Visible: true,
                IsPostBack: false,
                ShowAttributes: false,
                Roles: []
            },
            Style: {},
            Items: []
        }
    },
    ItemInfoCollection: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.ITEMINFOCOLLECTION,
            Properties: {
                Name: '',
                Label: 'Item Info Collection',
                IsItemData: false,
                Visible: true,
                IsPostBack: false,
                ShowAttributes: false,
                Options: [],
                Roles: [],
                Defaults:[]
            },
            Style: {},
            Items: []
        }
    },
    BarCode: function () {
        return {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Type: TOOL.INPUT.BARCODE,
            Properties: {
                Name: '',
                Label: 'Barcode',
                IsItemData: false,
                Error: '',
                Validator: [],
                Visible: true,
                IsPostBack: false,
                ReadOnly: false,
                Roles: []
            },
            Style: {},
            Items: []
        }
    }
};