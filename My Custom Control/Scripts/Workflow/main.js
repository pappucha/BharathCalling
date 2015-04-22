/*JS Plumb styles */
var connectorStyle = {
    lineWidth: 2,
    strokeStyle: "#008dc2",
    joinstyle: "round",
    outlineColor: "#008dc2",
    outlineWidth: 0.5
};

var connectorStyleHover = {
    lineWidth: 3,
    strokeStyle: "#00223c",
    joinstyle: "round",
    outlineColor: "#00223c",
}

var sourceNodeOption = {
    maxConnections: -1,
    dragAllowedWhenFull: true,
    endpoint: "Dot",
    paintStyle: {
        fillStyle: "transparent",
        radius: 5
    },
    anchor: 'BottomCenter',
    connector: "Flowchart",
    connectorOverlays: [
                    ["Arrow", {
                width: 10,
                length: 10,
                location: 1
                    }]
    ],
    connectorStyle: connectorStyle,
    connectorHoverStyle: connectorStyleHover
};

var targetNodeOption = {
    maxConnections: -1,
    dragAllowedWhenFull: true,
    endpoint: "Dot",
    paintStyle: {
        fillStyle: "transparent",
        radius: 5
    },
    anchor: 'TopCenter',
    connector: "Flowchart",
    connectorOverlays: [
                    ["Arrow", {
                width: 10,
                length: 10,
                location: 1
                    }]
    ],
    connectorStyle: connectorStyle,
    connectorHoverStyle: connectorStyleHover
};

jsPlumbUtil.logEnabled = false;