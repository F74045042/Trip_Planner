var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(function(d) {
        return d.cost;
    }).strength(0.001).id(function(d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("color", "blue")
    .style("font-size", "15px")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Text");

d3.json("https://raw.githubusercontent.com/F74045042/Trip_Planner/master/test.json", function(error, graph) {
    if (error) throw error;

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .on("mouseover", function(d) {
            tooltip.text(d.cost);
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
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", function(d) {
            return d.weight;
        })
        .attr("fill", function(d) {
            return color(d.time);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", function(d) {
            tooltip.text(d.id);
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    // node.append("title")
    //     .text(function(d) {
    //         return d.id;
    //     });

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

        node
            .attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            })
    }
});

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
