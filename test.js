function POIList() {
    this.head = null;


    // --------------- member methods --------------- //
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
                    link_cost = graph.links[i].cost;
                    // console.log( "link between " + graph.links[i].source.id 
                    //     + " & " + graph.links[i].target.id 
                    //     + " link_cost = " + link_cost);
                    break;
                }
            }
            cost += link_cost;
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
        return d.weight
    }));

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("color", "blue")
    .style("font-size", "13px")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Text");


d3.json("http://localhost:8000/test.json", function(error, graph) {
    if (error) throw error;

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
        .enter().append("g");

    var circle = node.append("circle")
        .attr("r", function(d) {
            return d.weight;
        })
        .attr("fill", function(d) {
            return color(d.time);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // mouseover event
    circle.on("mouseover", function(d) {
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
        poiIDX.addNode(graph.nodes[i].id, graph.nodes[i].weight, graph.nodes[i].time);
    }

    // generate path starting from each node and store under poiIDX
    for (var idx = 0; idx < graph.nodes.length; idx++) {
        var newPath = new POIList();
        genPath(graph.nodes[idx], 500, newPath, idx);
    }














    // ----------------------------------------------------------------- //





    // ----------------------- self-defined graph functions -------------------- //

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

    // generate all path with total_cost(link.cost + node.time) under a given threshold from a certain start point  
    function genPath(node, threshold, newPath, idx) {

        // append to path
        newPath.addNode(node.id, node.weight, node.time);
        var tot_cost = newPath.getTotalCost(graph);

        if (threshold > tot_cost) {
            for (var i = 0; i < graph.nodes.length; i++) {
                if (isConnected(newPath, graph.nodes[i]) &&
                    !newPath.contains(graph.nodes[i])) {
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


});

//zoomable
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
