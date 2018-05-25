
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

function onChangeNode(node){

    if(node.connected_to.length > 0){
        for (let i = 0; i < node.connected_to.length; i++) {
            let con = node.connected_to[i];

            let btn0 = $(node.html).children(".node-output-context").children("li").children(".node-io-button").eq(con.from);
            let btn1 = $(con.node.html).children(".node-input-context").children("li").children(".node-io-button").eq(con.to);

            let startX = btn0.offset().left + btn0.width() / 2;
            let startY = btn0.offset().top + btn0.height() / 2;

            let endX = btn1.offset().left + btn1.width() / 2;
            let endY = btn1.offset().top + btn1.height() / 2;

            let delta = endX - startX;
            let delta0 = startX + delta * 0.5;
            let delta1 = endX - delta * 0.5;

            con.line.setAttribute("d", "M"+startX+","+startY+" C"+delta0+","+startY+" "+delta1+","+endY+" "+endX+","+endY);

        }
    }


    if(node.connected_from.length > 0){
        for (let i = 0; i < node.connected_from.length; i++) {
            let con = node.connected_from[i];

            let btn0 = $(con.node.html).children(".node-output-context").children("li").children(".node-io-button").eq(con.from);
            let btn1 = $(node.html).children(".node-input-context").children("li").children(".node-io-button").eq(con.to);

            let startX = btn0.offset().left + btn0.width() / 2;
            let startY = btn0.offset().top + btn0.height() / 2;

            let endX = btn1.offset().left + btn1.width() / 2;
            let endY = btn1.offset().top + btn1.height() / 2;

            let delta = endX - startX;
            let delta0 = startX + delta * 0.5;
            let delta1 = endX - delta * 0.5;

            con.line.setAttribute("d", "M"+startX+","+startY+" C"+delta0+","+startY+" "+delta1+","+endY+" "+endX+","+endY);

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
        html: c,
        connected_to: [],
        connected_from: [],
        nodes: [],
    });
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
    let selectedNode = null;
    let selectedNodeStartPos = null;
    let selectedNodeStartMousePos = null;
    let line = null;

    $(".node-io-button").mousedown(function(e){
        if($(this).parent().hasClass("node-output")){
            selectedNode = $(this).parent().parent().parent();
            node = nodes[Number($(this).parent().parent().parent().attr("id"))];
            nodeOut = Number($(this).attr("id"));

            let o = $(this).offset();
            selectedNodeStartPos = { x: o.left + $(this).width() / 2, y: o.top + $(this).height() / 2 };
            selectedNodeStartMousePos = { x: e.pageX, y: e.pageY };

            line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            
            let x = selectedNodeStartPos.x;
            let y = selectedNodeStartPos.y;

            line.setAttribute("d", "M"+x+","+y+" C"+x+","+y+" "+x+","+y+" "+x+","+y);
            line.setAttribute("stroke", "url(#gradient)");
            line.setAttribute("stroke-width", "6px");
            line.setAttribute("stroke-linecap", "round");
            line.setAttribute("fill", "none");

            $(".node-line-container").append(line);
        }
    });

    $(document).mousemove(function(e){
        if(selectedNode !== null){
            let startX = selectedNodeStartPos.x;
            let startY = selectedNodeStartPos.y;

            let endX = (e.pageX - selectedNodeStartMousePos.x) + selectedNode.offset().left + selectedNode.width();
            let endY = (e.pageY - selectedNodeStartMousePos.y) + selectedNode.offset().top + selectedNode.height();

            let delta = endX - startX;
            let delta0 = startX + delta * 0.5;
            let delta1 = endX - delta * 0.5;

            line.setAttribute("d", "M"+startX+","+startY+" C"+delta0+","+selectedNodeStartPos.y+" "+delta1+","+endY+" "+endX+","+endY);
        }
    });

    $(document).mouseup(function(e){
        if(selectedNode !== null){
            if($(e.toElement).hasClass("node-io-button")){
                let id = Number($(e.toElement).parent().parent().parent().attr("id"));

                node.connected_to.push({
                    node: nodes[id],
                    to: Number($(e.toElement).attr("id")),
                    from: nodeOut,
                    line: line
                });
                
                nodes[id].connected_from.push({
                    node: node,
                    to: Number($(e.toElement).attr("id")),
                    from: nodeOut,
                    line: line
                });

                node.nodes.push(nodes[id]);

                let startX = selectedNodeStartPos.x;
                let startY = selectedNodeStartPos.y;

                let endX = $(e.toElement).offset().left + $(e.toElement).width() / 2;
                let endY = $(e.toElement).offset().top + $(e.toElement).height() / 2;

                let delta = endX - startX;
                let delta0 = startX + delta * 0.5;
                let delta1 = endX - delta * 0.5;

                line.setAttribute("d", "M"+startX+","+startY+" C"+delta0+","+selectedNodeStartPos.y+" "+delta1+","+endY+" "+endX+","+endY);
            }
            else{
                $(".node-line-container").remove(line);
            }
            selectedNode = null;
        }
    });

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

    nodeMoveEvent();
    nodeLineEvent();


});