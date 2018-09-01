function POIList() {
    this.head = null;
    this.length = 0;
    let lunch;
    let dinner;
    let hotel;

    // --------------- member methods --------------- //
    this.insertNode = function(position, id, weight, time) {
            if (position >= 0 && position <= this.length) {
                let newNode = new node(id, weight, time, null, null);
                let curr = this.head;
                let prev;
                let idx = 0;

                if (position == 0) {
                    newNode.next = curr;
                    this.head = newNode;
                } else {
                    while (idx++ < position) {
                        prev = curr;
                        curr = curr.next;
                    }
                    newNode.next = curr;
                    prev.next = newNode;
                }
                this.length++;
            } else {
                console.log("out of index");
            }

        }
        // append poi node
    this.addNode = function(id, weight, time) {
        const newNode = new node(id, weight, time, null, null);
        let curr;

        if (this.head == null) {
            this.head = newNode;
        } else {
            curr = this.head;
            while (curr.next) {
                curr = curr.next;
            }
            curr.next = newNode;
        }
        this.length++;

    }

    // add poi path
    this.addPath = function(new_path, tot_cost, tot_weight, idx) {
        const newPath = new path(new_path, tot_cost, tot_weight, null);
        let curr;

        curr = this.nodeIDX(idx);
        while (curr.down) {
            curr = curr.down;
        }
        curr.down = newPath;

    }

    // pop last poi node
    this.popNode = function() {
        let curr;
        let prev;
        if (this.head == null) {
            console.log("list already empty!!");
        } else {
            curr = this.head;
            while (curr.next) {
                prev = curr;
                curr = curr.next;
            }

            if (curr == this.head) { //if we're deleting the first node
                head = curr.next;
            } else {
                prev.next = curr.next; //delete curr (last node)
            }
        }
        this.length--;
    }

    // check if path contains node
    this.contains = function(node) {
        let curr = this.head;

        while (curr.next) {
            if (node.id == curr.id) {
                return true;
            }
            curr = curr.next;
        }

        return false;
    }

    // get total cost of path
    this.getTotalCost = function(graph) {
        let curr = this.head;
        var cost = 0;

        while (curr.next) {
            // add up average stay time at a poi node
            cost += curr.time; // console.log(curr.id + ":" + curr.time);

            // add up cost between this & next poi node
            var link_cost;
            for (var i = 0; i < graph.nodes.length; i++) {
                if ((graph.links[i].source.id == curr.id && graph.links[i].target.id == curr.next.id) ||
                    (graph.links[i].target.id == curr.id && graph.links[i].source.id == curr.next.id)) {
                    cost += graph.links[i].cost;
                    // console.log( "link between " + graph.links[i].source.id 
                    //     + " & " + graph.links[i].target.id 
                    //     + " link_cost = " + link_cost);
                    break;
                }
            }
            curr = curr.next;
        }
        // last node: simply add up its avg. stay time
        cost += curr.time; // console.log("last node -> " + curr.id + ":" + curr.time);
        return cost;
    }

    // get total weight (for sorting by path importance)
    this.getTotalWeight = function(graph) {
        let curr = this.head;
        var weight = 0;

        while (curr.next) {
            // add up weight at a poi node
            weight += curr.weight;
            curr = curr.next;
        }

        return weight;
    }

    // check empty
    this.isEmpty = function() {
        return (this.head == null);
    }

    // input index, return node
    this.nodeIDX = function(index) {
        let curr = this.head;
        while (index--) {
            curr = curr.next;
        }
        return curr;
    }

    // returns tail node
    this.tailNode = function() {
        let curr = this.head;
        while (curr.next) {
            curr = curr.next;
        }
        return curr;
    }

}

// new node constructor
function node(id, weight, time, next, down) {
    this.id = id;
    this.weight = weight;
    this.time = time;
    this.next = next;
    this.down = down;
}

// new path constructor
function path(new_path, total_cost, total_weight, down) {
    this.path = _.cloneDeep(new_path);
    this.total_cost = total_cost;
    this.total_weight = total_weight;
    this.down = down;
}


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(function(d) {
        return 5 * d.cost;
    }).strength(1).id(function(d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody().strength(-20))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
        return d.weight;
    }));

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("color", "blue")
    .style("font-size", "13px")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Text");



// Loader
var target = document.getElementById('loader');

var opts = {
    lines: 11, // The number of lines to draw
    length: 6, // The length of each line
    width: 15, // The line thickness
    radius: 47, // The radius of the inner circle
    scale: 1.3, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000000', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
};

var spinner = new Spinner(opts).spin(target);

d3.json("http://localhost:8000/test.json", function(error, graph) {
    if (error) throw error;

    // stop loader
    spinner.stop();

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    // mouseover event
    link.on("mouseover", function(d) {
            tooltip.style("color", "#33CC33FF");
            tooltip.text("Cost=" + d.cost);
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", function(d) {
            return d.type + " node"
        });


    var circle = node.append("circle")
        .attr("r", function(d) {
            return d.weight;
        })
        .attr("fill", function(d) {
            return color(d.type);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var marker = node.append("circle")
    marker.attr("r", 10)
        .attr("transform", "translate(" + [461, 294] + ")");

    // transition();

    function transition(allLine, j = 0) {
        if (j == allLine.length) {
            j = 0;
        }
        marker.transition()
            .duration(1000)
            .attrTween("transform", translateAlong(allLine[j]))
            .on("end", function() {
                rotate_count++;
                if(rotate_count == allLine.length){
                    rotate_count = 0;
                }
                transition(allLine, j + 1);
            }); // infinite loop
    }

    function translateAlong(path) {
        var l = path.getTotalLength();
        return function(d, i, a) {
            return function(t) {
                atLength = rotate[rotate_count] === 1 ? (t * l) : (l - (t * l));
                var p = path.getPointAtLength(atLength);
                return "translate(" + p.x + "," + p.y + ")"; //Move marker
            }
        }
    }

    // mouseover event
    node.on("mouseover", function(d) {
            tooltip.style("color", "#FF6666FF")
            tooltip.text("Time=" + d.time);
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });


    // show ID beside node
    var label = node.append("text")
        .text(function(d) {
            return d.id;
        })
        .attr("dx", 10)
        .attr("dy", 0);

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        circle
            .attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });

        label
            .attr("x", function(d) {
                return d.x;
            })
            .attr("y", function(d) {
                return d.y;
            });

    }



    // ------------------------- start planning ------------------------ //

    const poiIDX = new POIList();

    // poi index
    for (var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].type === "tourist_attraction")
            poiIDX.addNode(graph.nodes[i].id, graph.nodes[i].weight, graph.nodes[i].time);
    }

    // test: dijkstra
    console.log(graph.nodes[2].id);
    console.log(graph.nodes[10].id);
    dijkstra(graph, graph.nodes[2], graph.nodes[10]);


    //user input H
    var H;
    var Final = [];
    var Day = 0;
    var countDay = 0;
    var reArr;
    var FinalSchedule = []; // with hotel & restaurant

    var rest = [];
    var restcount = 0;

    //check if link need to rotate
    var rotate = [];
    var rotate_count = 0;

    // Go button click call initRcmd function
    document.getElementById("Go").onclick = function() {
        //document.getElementById("myTab").style.display="none";
        // document.getElementById("myTab").style.visibility="hidden";

        Day = getValue();
        countDay = 0;

        // jump to suggest page
        $('#page2-tab').tab('show');

        // user input H
        currH = getValue();
        if (H != currH) {
            // clean POI
            clrPOIList(poiIDX);

            // clean path box(UI)
            clrPathBox();

            // clean FinalArray & FinalScheduleArray
            Final.length = 0;
            FinalSchedule.length = 0;

            // generate path starting from each node and store under poiIDX
            for (var idx = 0; idx < poiIDX.length; idx++) {
                var newPath = new POIList();
                genPath(poiIDX.nodeIDX(idx), 400, newPath, idx);
            }
            reArr = genAllPathArr();
            // add path box to suggest page
            addPathBox(getMaxWeight(reArr));

            H = currH;
        }
    };

    // path box click event
    $('#recommend').on('click', '#path-box', function(e) {
        addChooseBox(getStr($(this).text()), getMaxWeight(reArr));
    });

    // ChooseBox click event
    $('#choose').on('click', '#choosen', function(e) {
        if (countDay < Day) {
            console.log(document.getElementById('choose-node').innerHTML);
            document.getElementById("day-select").innerHTML = "Day " + (countDay + 1);
            var str = document.getElementById('choose-node').innerHTML + getUpperCase(document.getElementById('choose-content').innerHTML);
            str = str.replace(/\s+/g, "");
            var arr = [];
            var temp = "";
            var j = 0,
                k = 0;
            for (var i = 0; i < str.length; i++) {
                temp += str.charAt(i);
                if ((str.charAt(i + 1) == 'P') || (i == str.length - 1)) {
                    arr[j] = temp;
                    j = j + 1;
                    temp = "";
                }
            }
            Final[countDay] = arr;

            //console.log(str);
            console.log(Final);
            reArr = remain(Final[countDay]);
            var max = getMaxWeight(reArr);
            // console.log(max);
            clrPathBox();
            addPathBox(max);

            $('#choose').modal('hide');
            countDay++;
        }

        if (countDay == Day) {
            clrPathBox();
            $('#choose').modal('hide');
        }

    })

    // Show Path on click
    $('#card-area').on('click', '.card-link', function(e) {
        showPath(FinalSchedule[e.currentTarget.id]);
    })

    // trigger hotel/restaurant selection
    document.getElementById("genSchedule").onclick = function() {
        // transform 'Final' to path array 'FinalSchedule'
        for (var i = 0; i < Final.length; i++) {
            var path = new POIList();
            for (var j = 0; j < Final[i].length; j++) {
                var node = getNodeByID(graph, Final[i][j]);
                path.addNode(node.id, node.weight, node.time);
            }
            FinalSchedule.push(path);
        }

        // perform restaurant selection
        for (var i = 0; i < FinalSchedule.length; i++) {
            restaurant(FinalSchedule[i]);
        }

        // perform hotel selection
        hotel_selection(graph, FinalSchedule);

        // Day Card appear in planning page.
        addDayCard(FinalSchedule);

    }


    // ----------------------------------------------------------------- //


    // ----------------------- self-defined graph functions -------------------- //

    function getUpperCase(str) {
        var str2 = "";

        for (var i = 0; i < str.length; i++) {
            c = str.charAt(i);
            if (((c >= 'A') && (c <= 'Z')) || ((c >= 0) && (c <= 9))) {
                str2 += c;
            }
        }
        str = str.split(" ");
        console.log(str2);
        return str2;
    }

    function getStr(str) {
        var str2 = str.substr(3, 2);
        c = str.charAt(5);
        if ((c >= 0) && (c <= 9)) {
            str2 += c;
        }
        str2 = str2.replace(/\s+/g, "");
        return str2;
    }

    function getStr2(str) {
        var str2 = str.substr(0, 2);
        c = str.charAt(2);
        if ((c >= 0) && (c <= 9)) {
            str2 += c;
        }
        console.log(str2);
        return str2;
    }


    //clean POIList
    function clrPOIList(POIList) {
        let curr = POIList.head;
        for (var i = 0; i < POIList.length; i++) {
            curr.down = null;
            curr = curr.next;
        }
    }

    // clean path box
    function clrPathBox() {
        $("div #path-box").detach();
    }

    //show Day Card
    function addDayCard(path) {
        $('div .card').detach();
        var start = "";
        var str = "";
        let curr;
        for (var i = 0; i < Day; i++) {
            curr = path[i].head;
            while (curr) {
                str += curr.id;
                curr = curr.next;
                if (curr) {
                    str += "->";
                }
            }
            // console.log(str);
            $('#card-area').append("<div class=\"card\" style=\"width: 20rem; margin-right: 5rem; margin-bottom: 1rem;\">" +
                "<div class=\"card-body\">" +
                "<h5 class=\"card-title\">Day " + (i + 1) + "</h5><div class=\"row justify-content-between\" id=\"choose-box\">" +
                "</h3><div id=\"choose-content\" \"text-align:left\">" + str + "</div></div>" +
                "<a href=\"#\" class=\"card-link\" id=" + i + ">Show Path</a></div></div>");
            str = "";
        }
    }

    //show all the path of choosen node
    function addChooseBox(start, max) {
        $("div #choose-box").detach();
        var Arr = getPathofMaxWeight(max);
        //console.log(Arr);
        //console.log(start);
        var isStart = 0;
        var isShow = 0;
        var path = "";
        for (var i = 0; i < Arr.length; i++) {
            if (Arr[i][0] == start) {
                //console.log(Arr[i][0]);
                for (var j = 1; j < Arr[i].length; j++) {
                    path += " -> " + Arr[i][j];
                }
                isShow = 0;
                isStart = 1;
            }
            //console.log(path);
            if (isStart == 1 && isShow == 0) {
                $("#choose-body").append("<div class=\"row justify-content-between\" id=\"choose-box\">" +
                    "<h3 id=" + "choose-node>" + start + "</h3>" + "<div id=" + "choose-content>" + path + "</div>" +
                    "<button type=button class=\"btn-sm btn-primary\"" + "id=\"choosen\">選擇</button></div>");
                path = "";
                isShow = 1;
            }
        }
    }

    // show all the first node of each first-day route
    function addPathBox(max) {
        // get first day route
        var Arr = getPathofMaxWeight(max);
        //console.log(Arr);
        var tmp = Arr[0][0];
        var num = 0;
        // get the first node of each first-day route
        for (var i = 0; i < Arr.length; i++) {
            if (Arr[i][0] != tmp) {
                $("#recommend").append(
                    "<div class=" + "col-md-2 col-md-offset-2" + " id=" + "path-box" + " data-toggle=" + "modal" + " data-target=" + "#choose>" +
                    "<div id=" + "content" + ">出發地</div>" +
                    "<h3 id=" + "node" + ">" + tmp + "</h3>" +
                    "<div id=" + "count" + ">" + " " + num + "</div>" +
                    "<div id=" + "\"count\"" + "style=" + "\"color: gray;margin-right: 15px;\"" + ">選項</div></div>");
                tmp = Arr[i][0];
                num = 0;
            }
            num++;
        }
        $("#recommend").append("<div class=" + "col-md-2 col-md-offset-2" + " id=" + "path-box" + " data-toggle=" + "modal" + " data-target=" + "#choose>" +
            "<div id=" + "content" + ">出發地</div>" +
            "<h3 id=" + "node" + ">" + tmp + "</h3>" +
            "<div id=" + "count" + ">" + " " + num + "</div>" +
            "<div id=" + "\"count\"" + "style=" + "\"color: gray;margin-right: 15px;\"" + ">選項</div></div>");
    }

    // get the value of each element from the form in planning.html
    function getValue() {
        var x = document.getElementById("frm");
        console.log("Day: " + x.elements[1].value);
        return x.elements[1].value;
    }

    // check if a node is connected to the last poi in a path
    function isConnected(path, node) {
        // iterate to last node in path
        let curr = path.head;
        while (curr.next) {
            curr = curr.next;
        }

        // check connectivity 
        for (var i = 0; i < graph.links.length; i++) {

            // source = path.lastNode && target = nodeToCheck OR vice versa
            if ((graph.links[i].source.id == curr.id && graph.links[i].target.id == node.id) ||
                (graph.links[i].target.id == curr.id && graph.links[i].source.id == node.id))
                return true;
        }
        return false;
    }

    // Return the line between node1 and node2
    function getLine(id1, id2) {
        for (var i = 0; i < graph.links.length; i++) {
            if ((graph.links[i].source.id == id1 && graph.links[i].target.id == id2) || (graph.links[i].target.id == id1 && graph.links[i].source.id == id2)) {
                return d3.selectAll("line")._groups[0][i];
                // console.log(d3.selectAll("line")._groups[0][i]);
            }
        }
        return null;
    }

    function removeAllSpace(str) {
        return str.replace(/\s+/g, "");
    }
    // generate all path with total_cost(link.cost + node.time) under a given threshold from a certain start point  
    // only consider nodes that are of type "tourist_attraction"
    function genPath(node, threshold, newPath, idx) {

        // append to path
        newPath.addNode(node.id, node.weight, node.time);
        var tot_cost = newPath.getTotalCost(graph);

        if (threshold > tot_cost) {
            for (var i = 0; i < graph.nodes.length; i++) {
                if (isConnected(newPath, graph.nodes[i]) &&
                    !newPath.contains(graph.nodes[i]) &&
                    graph.nodes[i].type === "tourist_attraction") {
                    // able to append node to path
                    genPath(graph.nodes[i], threshold, newPath, idx);
                }
            }

        }

        // store path
        poiIDX.addPath(newPath, newPath.getTotalCost(graph), newPath.getTotalWeight(graph), idx);
        newPath.popNode();
        return;

    }

    // Reduce the opacity of all node but the best path
    // can be optimize: each node save its own index, don't have to search all node over and over again.
    function showPath(path) {
        let curr = path.head;
        let d;
        let line;
        let allLine = [];
        let j = 0;
        rotate = [];
        rotate_count = 0;

        circle.style("opacity", 0.1);
        link.style("opacity", 0.1);
        while (curr.next) {
            // change node opacity
            for (var i = 0; i < graph.nodes.length; i++) {
                d = d3.selectAll("circle")._groups[0][i];
                if (d.__data__.id == curr.id) {
                    console.log(curr.id);
                    d.style.opacity = 1;
                    break;
                }
            }
            console.log(curr);
            // console.log(d);
            curr = curr.next;

            // change line opacity (for nodes that are directly connected)
            line = getLine(d.__data__.id, curr.id);
            if (line) {
                line.style.opacity = 1;
                allLine[j] = line;
                rotate[j] = isLinkRotate(d.__data__.id, curr.id);
            }

            // for nodes that are not directly connected
            if (!line) {
                let optPath = dijkstra(graph, getNodeByID(graph, d.__data__.id), getNodeByID(graph, curr.id)).pathArr;
                line = getLine(d.__data__.id, optPath[0]);
                allLine[j] = line;
                rotate[j] = isLinkRotate(d.__data__.id, optPath[0]);
                j++;
                line.style.opacity = 1;
                for (var i = 0; i < optPath.length - 1; i++) {
                    line = getLine(optPath[i], optPath[i + 1]);
                    line.style.opacity = 1;
                    allLine[j] = line;
                    rotate[j] = isLinkRotate(optPath[i], optPath[i + 1]);
                    j++;
                }
            }
        }

        // highlight hotel node
        for (var i = 0; i < graph.nodes.length; i++) {
            d = d3.selectAll("circle")._groups[0][i];
            if (d.__data__.id == path.tailNode().id) {
                // console.log(curr.id);
                d.style.opacity = 1;
                break;
            }
        }
        console.log(allLine);
        console.log(rotate);
        transition(allLine);

    }

    // convert path objects list to array and sort by weight, then return the sorted array
    function sortByWeight(headIDX) {
        var head = poiIDX.nodeIDX(headIDX);
        var sortArr = [];
        let curr = head;

        // push every path node into "sortArr"
        while (curr.down) {
            sortArr.push(curr.down);
            curr = curr.down;
        }

        // sort by total weight
        sortArr = sortArr.sort(function(a, b) {
            return a.total_weight < b.total_weight ? 1 : -1;
        });
        return sortArr;
    }

    // using sortbyweight function to construct allpatharray
    function genAllPathArr() {
        var pathArr = [];

        //2-d array generating
        for (var idx = 0; idx < poiIDX.length; idx++) {
            pathArr[idx] = sortByWeight(idx);
        }
        return pathArr;
    }

    //first day route
    function Gen1() {
        Arr = getPathofMaxWeight(max);
        list(Arr);
    }

    //other day route
    function Gen() {

        var path = [];
        //get the next day route
        path = genMultiItinerary(temp);
        //user choose which path they want
        chosen = UserChoose(path);
        temp = temp.concat(chosen);

        console.log(chosen);
        Result[i] = chosen;
        path = genMultiItinerary(temp);
        //generate next day dropdown list
        list(path);
        console.log(Result);
        i++;


        return Result;
    }

    //generate dropdown list
    function list(DayArray) {
        //reset dropdown list
        document.getElementById("DayArray").options.length = 0;
        select = document.getElementById('DayArray');
        for (index in DayArray) {
            select.add(new Option("path" + [index]));
        }

    }

    //for user to choose path
    function UserChoose(DayArray) {
        console.log(DayArray);
        var ddl = document.getElementById("DayArray")
        var choose = ddl.selectedIndex;
        console.log(index);

        return DayArray[choose];
    }


    function genMultiItinerary(Arr) {
        var remax;
        var ReArr = [];
        var DayArray = [];
        var Array1 = [];

        ReArr = remain(Arr);
        ReMax = getMaxWeight2(ReArr);
        Array1 = getPathofMaxWeight2(ReMax, ReArr);
        DayArray = Array1;
        return DayArray;
    }

    //getting the max weight of all path with 2-D array
    function getMaxWeight(AllPathArr) {
        var pathArr = [];
        var length = AllPathArr.length;
        var weightArr = [];
        var totweightArr = [];

        //generating pure weight array for max function
        for (var i = 0; i < length; i++) {
            for (var j = 0; j < AllPathArr[i].length; j++) {
                weightArr[j] = AllPathArr[i][j].total_weight;
            }
            totweightArr[i] = weightArr;
            weightArr = [];
        }

        //getting the max of 2-D array

        //first get the max of row 
        var maxRow = totweightArr.map(function(row) {
            return Math.max.apply(Math, row);
        });

        //overall max value
        var max = Math.max.apply(null, maxRow);
        return max;
    }

    //getting the max weight of all path with 2-D array
    function getMaxWeight2(ReArr) {
        var pathArr = [];
        var length = ReArr.length;
        var weightArr = [];

        //generating pure weight array for max function
        for (var i = 0; i < length; i++) {
            weightArr[i] = ReArr[i].total_weight;
        }

        //overall max value
        var max = Math.max.apply(null, weightArr);
        return max;
    }


    //get path of max weight (2-D array)
    function getPathofMaxWeight(max) {
        var AllPathArr = [];
        AllPathArr = reArr;
        var MaxArr = [];
        var PathArr = [];
        var PathArrnum = 0;
        var MaxArrnum = 0;
        for (var i = 0; i < AllPathArr.length; i++) {
            for (var j = 0; j < AllPathArr[i].length; j++) {
                if (AllPathArr[i][j].total_weight == max) {
                    var curr = AllPathArr[i][j].path.head;
                    while (curr) {
                        PathArr[PathArrnum] = curr.id;
                        curr = curr.next;
                        PathArrnum++;
                    }
                    MaxArr[MaxArrnum] = PathArr;
                    PathArr = [];
                    MaxArrnum++;
                    PathArrnum = 0;
                }
            }
        }
        return MaxArr;
    }

    //get path of max weight (1-D array)
    function getPathofMaxWeight2(ReMax, ReArr) {
        var AllPathArr = [];
        AllPathArr = genAllPathArr();
        var ReMaxArr = [];
        var PathArr = [];
        var PathArrnum = 0;
        var MaxArrnum = 0;
        for (var i = 0; i < ReArr.length; i++) {
            if (ReArr[i].total_weight == ReMax) {
                var curr = ReArr[i].path.head;
                while (curr) {
                    PathArr[PathArrnum] = curr.id;
                    curr = curr.next;
                    PathArrnum++;
                }
                ReMaxArr[MaxArrnum] = PathArr;
                PathArr = [];
                MaxArrnum++;
                PathArrnum = 0;
            }
        }
        return ReMaxArr;
    }

    //eliminate the duplicate node from all path
    function remain(MaxArr) {
        AllPathArr = reArr;
        var RemainArr = [];
        var s = [];
        var count = 0;
        for (var i = 0; i < AllPathArr.length; i++) {
            for (var j = 0; j < AllPathArr[i].length; j++) {
                var curr = AllPathArr[i][j].path.head;
                while (curr) {
                    if (MaxArr.indexOf(curr.id) == -1) {
                        curr = curr.next;
                    } else {
                        break;
                    }
                }
                if (curr === null) {
                    s[count] = AllPathArr[i][j];
                    count++;
                }
            }
            RemainArr[i] = s;
            s = [];
            count = 0;
        }
        return RemainArr;
    }

    // check connectivity between nodes
    function connected(node1, node2) {
        // check connectivity 
        for (var i = 0; i < graph.links.length; i++) {
            // source = node1 && target = node2 OR vice versa
            if ((graph.links[i].source.id == node1.id && graph.links[i].target.id == node2.id) ||
                (graph.links[i].target.id == node1.id && graph.links[i].source.id == node2.id))
                return true;
        }
        return false;
    }

    // returns unprocessed, lowest-cost node
    function lowestCostNode(costs, processed) {
        // remove some extra stuff
        delete costs["0"];
        delete costs["1"];
        delete costs["2"];
        return Object.keys(costs).reduce((lowest, node) => {
            if (lowest === null || costs[node] < costs[lowest]) {
                if (!processed.includes(node)) {
                    lowest = node;
                }
            }
            return lowest;
        }, null);
    }

    // returns link between 2 nodes
    function getLink(node1, node2) {
        for (var i = 0; i < graph.links.length; i++) {
            // source = node1 && target = node2 OR vice versa
            if ((graph.links[i].source.id == node1.id && graph.links[i].target.id == node2.id) ||
                (graph.links[i].target.id == node1.id && graph.links[i].source.id == node2.id))
                return graph.links[i];
        }
        return null;
    }

    // check if link need to rotate
    function isLinkRotate(id1, id2) {
        for (var i = 0; i < graph.links.length; i++) {
            if ((graph.links[i].source.id == id1 && graph.links[i].target.id == id2)) {
                return 1;
            } else if ((graph.links[i].target.id == id1 && graph.links[i].source.id == id2)) {
                return -1;
            }
        }
        return null;
    }

    // get node by node_id
    function getNodeByID(graph, id) {
        for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].id === id) {
                return graph.nodes[i];
            }
        }
        return null;
    }

    function restaurant(path) {
        cutPath(path, 75, 150);
        getmin(path);
    }

    //get min path for restaurant
    function getmin(path) {
        var cost1 = 0,
            cost2 = 0;
        var result = [];
        var i;
        //console.log(path);
        var temp1, temp2, nodetemp;
        for (i = 0; i < graph.nodes.length; i++) {
            if ((graph.nodes[i].type === 'restaurant') && restcheck(i)) {
                temp1 = cost1;
                cost1 = dijkstra(graph, path.lunch, graph.nodes[i]).minCost + dijkstra(graph, path.lunch.next, graph.nodes[i]).minCost;

                if (cost1 > temp1) {
                    result[0] = i;
                    rest[restcount] = i;
                }
            }
        }
        restcount = restcount + 1;

        for (i = 0; i < graph.nodes.length; i++) {
            if ((graph.nodes[i].type === 'restaurant') && restcheck(i)) {

                if (path.dinner.next == null) {
                    temp2 = cost2;
                    cost2 = dijkstra(graph, path.dinner, graph.nodes[i]).minCost;
                } else {
                    temp2 = cost2;
                    cost2 = dijkstra(graph, path.dinner, graph.nodes[i]).minCost + dijkstra(graph, path.dinner.next, graph.nodes[i]).minCost;
                }
                if (cost2 > temp2) {
                    result[1] = i;
                    rest[restcount] = i;
                }
            }
        }

        restcount = restcount + 1;

        var index = getIndex(path);
        path.insertNode(index[0] + 1, graph.nodes[result[0]].id, graph.nodes[result[0]].weight, graph.nodes[result[0]].time);
        path.insertNode(index[1] + 2, graph.nodes[result[1]].id, graph.nodes[result[1]].weight, graph.nodes[result[1]].time);

        return result;
    }

    function restcheck(d) {
        for (var i = 0; i < rest.length; i++) {
            if (d == rest[i]) {
                return false
            }
        }
        return true;
    }

    function getIndex(path) {
        let curr = path.head;
        var index = [];
        var count = 0;
        while (curr) {
            if (curr.id == path.lunch.id) {
                index[0] = count;
            }

            if (curr.id == path.dinner.id) {
                index[1] = count;
                return index;
            }

            curr = curr.next;
            count++;
        }
    }

    function cutPath(path, time1, time2) {
        let curr = path.head;
        var node = [];
        var flag = 0;
        var cost = 0;
        var condition = 0;
        let prev;
        while (curr) {


            if (condition == 1) {
                cost += getLink(prev, curr).cost + curr.time;
            }

            if (condition == 0) {
                cost += curr.time;
                condition = 1;
            }

            if (flag == 0 && cost > time1) {
                path.lunch = curr;
                cost = 0;
                condition = 0;
                flag = 1;
            } else if (flag == 1 && cost > time2) {
                path.dinner = curr;
                break;
            }

            prev = curr;
            curr = curr.next;

        }

    }

    // Dijkstra shortest path: returns the minimum cost to travel from src to dest & the optimal path
    function dijkstra(graph, src, dest) {
        // add destination and cost = INF
        // add source and cost = 0
        var costs = {};
        costs[dest.id] = Infinity;
        costs[src.id] = 0;

        // for optimal path
        var parents = {};
        parents[dest.id] = null;
        for (var i = 0; i < graph.nodes.length; i++) {
            if (connected(graph.nodes[i], src)) {
                // add src as these nodes' parent
                parents[graph.nodes[i].id] = src.id;
            }
        }

        // add the neighbors of source and their costs
        for (var i = 0; i < graph.nodes.length; i++) {
            if (connected(src, graph.nodes[i])) {
                costs = Object.assign(costs, graph.nodes[i].id);
                costs[graph.nodes[i].id] = getLink(src, graph.nodes[i]).cost;
            }
        }


        // to keep track of processed nodes
        const processed = [];

        let nodeID = lowestCostNode(costs, processed);
        while (nodeID) {
            let cost = costs[nodeID];
            let node = getNodeByID(graph, nodeID);

            for (var i = 0; i < graph.nodes.length; i++) {

                if (connected(node, graph.nodes[i])) {
                    let newCost = cost + getLink(node, graph.nodes[i]).cost;
                    if (!costs[graph.nodes[i].id]) {
                        costs[graph.nodes[i].id] = newCost;
                        parents[graph.nodes[i].id] = node.id;
                    }

                    if (costs[graph.nodes[i].id] > newCost) {
                        costs[graph.nodes[i].id] = newCost;
                        parents[graph.nodes[i].id] = node.id;
                    }
                }
            }

            processed.push(nodeID);
            nodeID = lowestCostNode(costs, processed);
        }

        // get optimal path, trace destination node's parent
        let optPath = [];
        optPath.push(dest.id);
        let parentID = parents[dest.id];
        while (parentID != src.id) {
            optPath.push(parentID);
            parentID = parents[parentID];
        }

        optPath.reverse(); //correct order

        const results = {
            minCost: costs[dest.id],
            pathArr: optPath
        };
        console.log(results);
        return results;
    }

    // hotel-selection: cost(prev_day, hotel) + cost(next_day, hotel) ----> min-cost 
    // for trips on same region (small scale)
    // not for cross-region
    function hotel_selection(graph, scheduleArr) {
        var hotels = [];
        var cost_to_hotel_arr = [];
        var hotelCandidates = [];
        var cost_to_hotel; // cost(prev_day, hotel) + cost(next_day, hotel)

        // get all the hotels
        for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].type === 'hotel') {
                hotels.push(graph.nodes[i]);
            }
        }

        // calculate cost_to_hotel between each day, for each hotel
        // e.g. 3-day trip: hotelA -> [cost1 + cost2]  hotelB -> [cost1 + cost2]  hotelC -> [cost1 + cost2]
        // e.g. 4-day trip: hotelA -> [cost1 + cost2 + cost3]  hotelB -> [cost1 + cost2 + cost3]  hotelC -> [cost1 + cost2 + cost3]
        for (var i = 0; i < hotels.length; i++) {
            cost_to_hotel = 0;
            for (var j = 0; j < scheduleArr.length - 1; j++) {
                // walk through everyday's path, calculate cost_to_hotel
                cost_to_hotel += dijkstra(graph, scheduleArr[j].tailNode(), hotels[i]).minCost + dijkstra(graph, hotels[i], scheduleArr[j + 1].head).minCost;
            }
            cost_to_hotel_arr.push(cost_to_hotel);
        }

        // get min-cost in cost_to_hotel_arr
        var minCost = Infinity;
        for (var i = 0; i < cost_to_hotel_arr.length; i++) {
            if (cost_to_hotel_arr[i] < minCost) {
                minCost = cost_to_hotel_arr[i];
            }
        }

        // find all the candidates with minCost
        for (var i = 0; i < cost_to_hotel_arr.length; i++) {
            if (cost_to_hotel_arr[i] == minCost) {
                hotelCandidates.push(hotels[i]);
            }
        }

        // only option: then simply append to every day
        // multiple candidates: pick the hotel with max-weight
        var maxWeight = 0;
        var hotelWinner;
        if (hotelCandidates.length == 1) {
            hotelWinner = hotelCandidates[0];
        } else {
            for (var i = 0; i < hotelCandidates.length; i++) {
                if (hotelCandidates[i].weight > maxWeight) {
                    maxWeight = hotelCandidates[i].weight;
                    hotelWinner = hotelCandidates[i];
                }
            }
        }

        //add hotel to final schedule
        for (var i = 0; i < scheduleArr.length; i++) {
            scheduleArr[i].hotel = hotelWinner;
            scheduleArr[i].addNode(hotelWinner.id, hotelWinner.weight, hotelWinner.time);
        }

    }

});

// zoomable
var zoom = d3.zoom()
    .translateExtent([
        [0, 0],
        [width, height]
    ])
    .scaleExtent([1, 10])
    .extent([
        [0, 0],
        [width, height]
    ])
    .on("zoom", function() {
        svg.selectAll("g").attr("transform", d3.event.transform);
        svg.selectAll("line").attr("transform", d3.event.transform);
    });

svg.call(zoom);


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
