
$(document).ready(function() {

    for (let i = 0; i < language.nodes.length; i++) {
        let node = language.nodes[i];
        let div = $("<div>").addClass("menu-item");
        div.append($("<div>").addClass("menu-item-title").html(node.name));

        let c = $("<div>").addClass("node").attr("id", i);
        let title = $("<div>").addClass("node-title").html(node.name);
        c.append(title);

        let input = $("<ul>").addClass("node-input-context");
        for (let i = 0; i < node.input.length; i++) {
            let btn = $("<div>").addClass("node-io-button");
            btn.attr("id", i);
            let li = $("<li>").addClass("node-input");
            li.append(btn);
            input.append(li);
        }
        c.append(input);

        let values = $("<ul>").addClass("node-value-context");
        for (let i = 0; i < node.values.length; i++) {
            let v = node.values[i];
            if(v.type == "string"){
                values.append(`
                <li class="node-value" id="` + v.name + `">
                    <div class="node-value-title">` + v.name + `</div>
                    <div class="node-value-container">
                        <input type="text" class="node-value-in">
                    </div>
                </li>
                `);
            }
        }
        c.append(values);

        let output = $("<ul>").addClass("node-output-context");
        for (let i = 0; i < node.output.length; i++) {
            let btn = $("<div>").addClass("node-io-button");
            btn.attr("id", i);
            let li = $("<li>").addClass("node-output");
            li.append(btn);
            output.append(li);
        }
        c.append(output);
        c.append(`<div style="clear: both"></div><div class="node-footer"><span class="node-resize"></span></div>`);
        c.css("transform", "scale(0.65)").css("position", "initial");
        div.append(c);

        $(".menu-container").append(div);
    }
    
    let drag = false;
    let node = null;

    $(".menu-item").mousedown(function(e) {
        drag = true;
        let id = Number($(this).children(".node").attr("id"));
        node = addNode(language.nodes[id]);
        node.html.css({
            left: e.pageX - node.html.width() / 2,
            top:  e.pageY - node.html.height() / 2,
        });
    });

    $(document).mousemove(function(e) {
        if(drag && node !== null){
            node.html.css({
                left: e.pageX - node.html.width() / 2,
                top:  e.pageY - node.html.height() / 2,
            });
        }
    });

    $(document).mouseup(function(e) {
        if(drag){
            drag = false;
            node = null;  
        }
    });

});
