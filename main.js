const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let nodes_type = [
    {
        name: "test",
        input: [
            {
                name: "test-in",
                type: "",
                default: null,
            }
        ],
        output: [
            {
                name: "test-out",
                type: "",
                default: null,
            }
        ]
    },
    {
        name: "test2",
        input: [
            {
                name: "test-in0",
                type: "",
                default: null,
            },
            {
                name: "test-in1",
                type: "",
                default: null,
            }
        ],
        output: [
            {
                name: "test-out",
                type: "",
                default: null,
            }
        ]
    }
];

let nodes = [];


function onChangeContext(){

}

function drawLine(line, x1, y1, x2, y2) {

    if(y1 > y2){
        line.setAttribute("stroke", "url(#gradient)");
    }
    else{
        line.setAttribute("stroke", "url(#gradient2)");
    }

    let delta = x2 - x1;
    let delta0 = x1 + delta * 0.5;
    let delta1 = x2 - delta * 0.5;

    line.setAttribute("d", "M"+x1+","+y1+" C"+delta0+","+y1+" "+delta1+","+y2+" "+x2+","+y2);
}

function onChangeNode(node){

    if(node.output.length > 0){
        for (let i = 0; i < node.output.length; i++) {
            let con = node.output[i];

            let btn0 = $(node.html).children(".node-output-context").children("li").children(".node-io-button").eq(con.output);
            let btn1 = $(con.node.html).children(".node-input-context").children("li").children(".node-io-button").eq(con.input);

            let startX = btn0.offset().left + btn0.width() / 2;
            let startY = btn0.offset().top + btn0.height() / 2;

            let endX = btn1.offset().left + btn1.width() / 2;
            let endY = btn1.offset().top + btn1.height() / 2;
            drawLine(con.line, startX, startY, endX, endY);
        }
    }


    if(node.input.length > 0){
        for (let i = 0; i < node.input.length; i++) {
            let con = node.input[i];

            let btn0 = $(con.node.html).children(".node-output-context").children("li").children(".node-io-button").eq(con.output);
            let btn1 = $(node.html).children(".node-input-context").children("li").children(".node-io-button").eq(con.input);

            let startX = btn0.offset().left + btn0.width() / 2;
            let startY = btn0.offset().top + btn0.height() / 2;

            let endX = btn1.offset().left + btn1.width() / 2;
            let endY = btn1.offset().top + btn1.height() / 2;
            drawLine(con.line, startX, startY, endX, endY);
        }
    }

}

function addNode(type){
    let c = $("<div>").addClass("node");

    c.attr("id", nodes.length);

    let title = $("<div>").addClass("node-title").html(type.name);

    c.append(title);

    let input = $("<ul>").addClass("node-input-context");
    for (let i = 0; i < type.input.length; i++) {
        let btn = $("<div>").addClass("node-io-button");
        btn.attr("id", i);

        let li = $("<li>").addClass("node-input");
        li.append(btn);

        input.append(li);
    }
    c.append(input);


    let output = $("<ul>").addClass("node-output-context");
    for (let i = 0; i < type.output.length; i++) {
        let btn = $("<div>").addClass("node-io-button");
        btn.attr("id", i);

        let li = $("<li>").addClass("node-output");
        li.append(btn);

        output.append(li);
    }
    c.append(output);

    c.append(`<div style="clear: both;"></div>`);

    
    $(".node-container").append(c);

    nodes.push({
        name: type.name,
        type: type,
        input: [],
        output: [],
        connected_to: [],
        connected_from: [],
        nodes: [],
        html: c,
    });

    nodeMoveEvent();
    nodeLineEvent();
}

function nodeMoveEvent(){
    let selectedNode = null;
    let selectedNodeStartPos = null;
    let selectedNodeStartMousePos = null;

    $(".node-title").mousedown(function(e){
        selectedNode = $(this).parent();
        let o = selectedNode.offset();
        selectedNodeStartPos = { x: o.left, y: o.top };
        selectedNodeStartMousePos = { x: e.pageX, y: e.pageY };
    });

    $(document).mousemove(function(e){
        if(selectedNode !== null){
            selectedNode.css({
                left: selectedNodeStartPos.x + (e.pageX - selectedNodeStartMousePos.x),
                top: selectedNodeStartPos.y + (e.pageY - selectedNodeStartMousePos.y),
                position:'absolute'
            });
            onChangeNode(nodes[Number(selectedNode.attr("id"))]);
        }
    });

    $(".node-title").mouseup(function(e){
        selectedNode = null;
    });
}

function nodeLineEvent(){
    let node = null;
    let nodeOut = null;
    let selectedNodeStartMousePos = null;
    let line = null;

    let startX;
    let startY;

    let startMX;
    let startMY;

    $(".node-io-button").mousedown(function(e){
        if($(this).parent().hasClass("node-output")){
            node = nodes[Number($(this).parent().parent().parent().attr("id"))];
            nodeOut = Number($(this).attr("id"));

            startX = $(this).offset().left + $(this).width() / 2;
            startY = $(this).offset().top + $(this).height() / 2;

            startMX = e.pageX;
            startMY = e.pageY;

            line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            line.setAttribute("stroke", "url(#gradient)");
            line.setAttribute("stroke-width", "6px");
            line.setAttribute("stroke-linecap", "round");
            line.setAttribute("fill", "none");

            $(".node-line-container").append(line);
        }
    });

    $(document).mousemove(function(e){
        if(node !== null){
            let endX = (e.pageX - startMX) + node.html.offset().left + node.html.width();
            let endY = (e.pageY - startMY) + node.html.offset().top + node.html.height();
            drawLine(line, startX, startY, endX, endY);
        }
    });

    $(document).mouseup(function(e){
        if(node !== null){
            if($(e.toElement).hasClass("node-io-button")){
                let id = Number($(e.toElement).parent().parent().parent().attr("id"));

                node.output.push({
                    node: nodes[id],
                    input: Number($(e.toElement).attr("id")),
                    output: nodeOut,
                    line: line
                });
                
                nodes[id].input.push({
                    node: node,
                    input: Number($(e.toElement).attr("id")),
                    output: nodeOut,
                    line: line
                });

                node.nodes.push(nodes[id]);

                let endX = $(e.toElement).offset().left + $(e.toElement).width() / 2;
                let endY = $(e.toElement).offset().top + $(e.toElement).height() / 2;
                drawLine(line, startX, startY, endX, endY);
            }
            else{
                $(".node-line-container").remove(line);
            }

            node = null;
        }
    });

}

function save(filename) {
    let data = {
        lang: {
            name: "test",
            inside: true,
            other: null,
            nodes: nodes_type,
        },
        nodes: [],
        tree: [],
    };

    let root = new Array();

    for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        if(n.input.length == 0){
            console.log("Root: ");
            console.log(n);
            root.push(n);
        }
    }
    console.log(root);

    // for (let i = 0; i < nodes.length; i++) {
    //     let n = nodes[i];
    //     let node = {
    //         name: n.name,
    //         id: crypto.createHash("md5").update(i + JSON.stringify(n.type)).digest("hex"),
    //         input: [],
    //         output: [],
    //         style: {
    //             position: {
    //                 x: n.html.offset().left,
    //                 y: n.html.offset().top,
    //             },
    //             size: {
    //                 x: n.html.width(),
    //                 y: n.html.height(),
    //             },
    //             css: null
    //         }
    //     };

    // }

    fs.writeFileSync(filename, JSON.stringify(data));
}

$(document).ready(function(){
    console.log("OK");

    addNode(nodes_type[0]);
    addNode(nodes_type[0]);
    addNode(nodes_type[0]);
    addNode(nodes_type[0]);
    addNode(nodes_type[0]);
    addNode(nodes_type[1]);
    addNode(nodes_type[1]);
    addNode(nodes_type[1]);


});