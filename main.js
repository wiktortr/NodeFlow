const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let language = JSON.parse(fs.readFileSync("lang.json"));

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

    let node = {
        name: type.name,
        type: type.id,
        input: [],
        output: [],
        values: [],
        nodes: [],
        html: $("<div>").addClass("node").attr("id", nodes.length),
    }

    let title = $("<div>").addClass("node-title").html(type.name);
    node.html.append(title);

    let input = $("<ul>").addClass("node-input-context");
    for (let i = 0; i < type.input.length; i++) {
        let btn = $("<div>").addClass("node-io-button");
        btn.attr("id", i);
        let li = $("<li>").addClass("node-input");
        li.append(btn);
        input.append(li);
    }
    node.html.append(input);

    let values = $("<ul>").addClass("node-value-context");
    for (let i = 0; i < type.values.length; i++) {
        let v = type.values[i];
        let li = $("<li>").attr("id", i).attr("name", v.name).addClass("node-value");
        li.append($("<div>").addClass("node-value-title").html(v.name));

        let inValue = null;

        if(v.type == "string"){
            inValue = $("<input>").attr("type", "text").addClass("node-value-in");
        }

        if(v.type == "number"){
            inValue = $("<input>").attr("type", "number").addClass("node-value-in");
        }

        if(v.type == "checkbox"){
            inValue = $("<input>").attr("type", "checkbox").addClass("node-value-in");
        }

        if(v.type == "combobox"){
            inValue = $("<select>").addClass("node-value-in");
            for (let j = 0; j < v.values.length; j++) {
                inValue.append($("<option>").attr("value", v.values[j]).html(v.values[j]));
            }
        }
        

        if(inValue !== null){
            li.append(inValue);
            values.append(li);

            node.values.push({
                name: v.name,
                type: v.type,
                value: null,
                html: inValue
            });

            inValue.keypress(function(e) {
                node.values[i].value = $(this).val();
            });

            inValue.change(function(e) {
                node.values[i].value = $(this).val();
            });

        }
    }
    node.html.append(values);

    let output = $("<ul>").addClass("node-output-context");
    for (let i = 0; i < type.output.length; i++) {
        let btn = $("<div>").addClass("node-io-button").attr("id", i);
        let li = $("<li>").addClass("node-output");
        li.append(btn);
        output.append(li);
    }
    node.html.append(output);

    node.html.append(`<div style="clear: both"></div><div class="node-footer"><span class="node-resize"></span></div>`);
    $(".node-container").append(node.html);

    for (let i = 0; i < node.values.length; i++){
        let v = node.values[i];
        
        for (let j = 0; j < type.output.length; j++) {
            let o = type.output[j];
            if(o.value == v.name){
                let html = output.children().eq(j);
                let mar = v.html.parent().offset().top - html.offset().top + 15 + v.html.parent().height() / 2;
                html.css("margin-top", mar + "px");
                break;
            }
        }

        for (let j = 0; j < type.input.length; j++) {
            let o = type.input[j];
            if(o.value == v.name){
                let html = input.children().eq(j);
                let mar = v.html.parent().offset().top - html.offset().top + 15 + v.html.parent().height() / 2;
                html.css("margin-top", mar + "px");
                break;
            }
        }
        
    }

    if(type.id === undefined){
        type["id"] = crypto.createHash("md5").update(JSON.stringify(type)).digest("hex");
    }

    nodes.push(node);
    return node;
}

function save(filename) {
    let data = {
        lang: language,
        nodes: []
    };

    for (let i = 0; i < data.lang.nodes.length; i++) {
        if(data.lang.nodes[i]["id"] === undefined){
            data.lang.nodes[i]["id"] = crypto.createHash("md5").update(JSON.stringify(data.lang.nodes[i])).digest("hex");
        }
    }
    
    let gb_index = 0;
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];

        let out_node = {
            name: node.name,
            type: node.type,
            id: gb_index,
            uuid: crypto.createHash("md5").update(gb_index + node.name + JSON.stringify(node.type)).digest("hex"),
            connects: [],
            values: [],
            style: {
                position: {
                    x: node.html.offset().left,
                    y: node.html.offset().top,
                },
                size: {
                    x: node.html.width(),
                    y: node.html.height(),
                },
                css: null
            }
        };
        gb_index += 1;

        for (let i = 0; i < node.output.length; i++) {
            let con = node.output[i];
            let found = -1;
            for (let j = 0; j < nodes.length; j++) {
                if(nodes[j] == con.node){
                    found = j;
                    break;
                }
            }
            out_node.connects.push({
                output: con.output,
                input: con.input,
                node: found
            });
        }

        for (let i = 0; i < node.values.length; i++) {
            let v = node.values[i];
            out_node.values.push({
                name: v.name,
                type: v.type,
                value: v.html.val()
            });
        }

        data.nodes.push(out_node);
    }

    console.log(data);
    fs.writeFileSync(filename, JSON.stringify(data));
}

function load(filename) {
    let data = JSON.parse(fs.readFileSync(filename));

    //Create Nodes
    for (let i = 0; i < data.nodes.length; i++) {
        let node = data.nodes[i];
        let found = null;
        for (let i = 0; i < data.lang.nodes.length; i++) {
            if(data.lang.nodes[i].id == node.type){
                found = data.lang.nodes[i];
                break;
            }
        }

        if(found === null){
            console.log("Can't load node: " + node.name + " ID: " + node.uuid);
            continue;
        }

        let n = addNode(found);
        n["uuid"] = node.uuid;
        n.html.css({
            left: node.style.position.x,
            top: node.style.position.y,
            width: node.style.size.x,
            // height: node.style.size.y,
        });

        for (let i = 0; i < node.values.length; i++) {
            n.values[i].html.val(node.values[i].value);
        }

    }

    //Create Line
    for (let j = 0; j < data.nodes.length; j++) {
        let node = data.nodes[j];
        let n = nodes[j];

        for (let i = 0; i < node.connects.length; i++) {
            let con = node.connects[i];
    
            // let found = false;
            // for (let i = 0; i < node.input.length; i++) {
            //     let n = node.input[i];
            //     if(n.node == node && n.output == nodeIO && n.input == id_in){
            //         found = true;
            //         break;
            //     }
            // }

            let line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            line.setAttribute("stroke", "url(#gradient)");
            line.setAttribute("stroke-width", "6px");
            line.setAttribute("stroke-linecap", "round");
            line.setAttribute("fill", "none");
            $(".node-line-container").append(line);
    
            n.output.push({
                node: nodes[con.node],
                input: con.input,
                output: con.output,
                line: line
            });
    
            nodes[con.node].input.push({
                node: n,
                input: con.input,
                output: con.output,
                line: line
            });
            n.nodes.push(nodes[con.node]);
        }
        onChangeNode(n);
        
    }

    

    console.log(data);
}

function translate() {

}

$(document).ready(function(){

    load("test.json");
    console.log(nodes);
    // addNode(nodes_type[0]);
    // addNode(nodes_type[0]);
    // addNode(nodes_type[0]);
    // addNode(nodes_type[0]);
    // addNode(nodes_type[0]);
    // addNode(nodes_type[1]);
    // addNode(nodes_type[1]);
    // addNode(nodes_type[1]);



});

//Move Node Events
{
    let selectedNode = null;
    let selectedNodeStartPos = null;
    let selectedNodeStartMousePos = null;

    $(document).on("mousedown", ".node-title", function(e) { 
        selectedNode = $(this).parent();
        let o = selectedNode.offset();
        selectedNodeStartPos = { x: o.left, y: o.top };
        selectedNodeStartMousePos = { x: e.pageX, y: e.pageY };
    });

    $(document).mousemove(function(e){
        if(selectedNode !== null){
            selectedNode.css({
                left: selectedNodeStartPos.x + (e.pageX - selectedNodeStartMousePos.x),
                top: selectedNodeStartPos.y + (e.pageY - selectedNodeStartMousePos.y)
            });
            onChangeNode(nodes[Number(selectedNode.attr("id"))]);
        }
    });
    
    $(document).mouseup(function(e){
        selectedNode = null;
    });
}

//Resize Events
{
    let resize = false;
    let node = null;

    let startX;
    let startY;

    let startMX;
    let startMY;

    $(document).on("mousedown", ".node-resize", function(e) { 
        resize = true;
        node = nodes[Number($(this).parent().parent().attr("id"))];

        startX = node.html.width();
        startY = node.html.height();

        startMX = e.pageX;
        startMY = e.pageY;
    });

    $(document).mousemove(function(e) {
        if(resize && node !== null){
            node.html.width(startX + (e.pageX - startMX));
            // node.html.height(startY + (e.pageY - startMY));
            onChangeNode(node);
        }
    });

    $(document).mouseup(function(e) {
        if(resize){
            resize = false;
            node = null;
        }
    });

}

//Line Node Events
{
    let node = null;
    let nodeIO = null;
    let nodeIO2 = null;
    let line = null;

    let startX;
    let startY;

    let startMX;
    let startMY;

    $(document).on("mousedown", ".node-io-button", function(e) { 
        if($(this).parent().hasClass("node-output")){
            node = nodes[Number($(this).parent().parent().parent().attr("id"))];
            nodeIO = Number($(this).attr("id"));
            nodeIO2 = $(this);

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

        if($(this).parent().hasClass("node-input")){
            let _node = nodes[Number($(this).parent().parent().parent().attr("id"))];
            let _nodeIO = Number($(this).attr("id"));
            nodeIO2 = $(this);

            for (let i = 0; i < _node.input.length; i++) {
                let con = _node.input[i];
                if(con.input == _nodeIO){

                    node = con.node;
                    line = con.line;

                    startMX = e.pageX;
                    startMY = e.pageY;

                    let o = null;

                    for (let j = 0; j < node.output.length; j++) {
                        if(node.output[j].node == _node && node.output[j].input == _nodeIO){
                            nodeIO = node.output[j].output;
                            o = $(node.html).children(".node-output-context").children("li").children(".node-io-button").eq(nodeIO);
                            node.output.splice(j, 1);
                            break;
                        }
                    }
                    _node.input.splice(i, 1);

                    startX = o.offset().left + o.width() / 2;
                    startY = o.offset().top + o.height() / 2;

                    break;
                }
            }

        }
    });

    $(document).mousemove(function(e){
        if(node !== null && line !== null){
            let endX = (e.pageX - startMX) + nodeIO2.offset().left + nodeIO2.width() / 2;
            let endY = (e.pageY - startMY) + nodeIO2.offset().top + nodeIO2.height() / 2;
            
            drawLine(line, startX, startY, endX, endY);
        }
    });

    $(document).mouseup(function(e){
        if(node !== null){
            if($(e.toElement).hasClass("node-io-button")){
                let id = Number($(e.toElement).parent().parent().parent().attr("id"));
                let id_in = Number($(e.toElement).attr("id"));

                let found = false;
                for (let i = 0; i < nodes[id].input.length; i++) {
                    let n = nodes[id].input[i];
                    if(n.node == node && n.output == nodeIO && n.input == id_in){
                        found = true;
                        break;
                    }
                }

                if(!found){
                    node.output.push({
                        node: nodes[id],
                        input: Number($(e.toElement).attr("id")),
                        output: nodeIO,
                        line: line
                    });
                    nodes[id].input.push({
                        node: node,
                        input: Number($(e.toElement).attr("id")),
                        output: nodeIO,
                        line: line
                    });
                    node.nodes.push(nodes[id]);

                    let endX = $(e.toElement).offset().left + $(e.toElement).width() / 2;
                    let endY = $(e.toElement).offset().top + $(e.toElement).height() / 2;
                    drawLine(line, startX, startY, endX, endY);
                }
                else{
                    $(line).remove();
                }
            }
            else{
                $(line).remove();
            }
            node = null;
        }
    });
}

//Rename Events
$(document).on("dblclick", ".node-title", function() {
    let t = $(this);
    let inp = $("<input>").attr("type", "text").addClass("node-title-rename").val(t.html());
    t.html(inp);
    inp.select();

    let node = null;
    for (let i = 0; i < nodes.length; i++) {
        if(nodes[i].html == t.parent()){
            node = nodes[i];
            break;
        }
    }

    $(document).keypress(function(e){
        if(e.key == "Enter"){
            t.html(inp.val());
            if(node !== null){
                node.name = t.html();
            }
        }
    });
    $(document).mousedown(function(e){
        if($(e.toElement) !== inp){
            t.html(inp.val());
            if(node !== null){
                node.name = t.html();
            }
        }
    });
});


//Move document
/*{
    let move = false;

    let startX;
    let startY;

    let startMX;
    let startMY;

    $(document).mousedown(function(e) {
        if(e.button == 1){
            move = true;

            startMX = e.pageX;
            startMY = e.pageY;

            let o = $(".node-container").offset();

            startX = o.left;
            startY = o.top;

        }
    });

    $(document).mousemove(function(e) {
        if(move){

            let mX = e.pageX - startMX;
            let mY = e.pageY - startMY;

            $(".node-container").css({
                left: startX + mX,
                top: startY + mY,
            });

            $(".node-line-container").css({
                left: startX + mX,
                top: startY + mY,
            });

            console.log("move");
        }
    });

    $(document).mouseup(function(e) {
        if(move){
            move = false;
        }
    });

}*/