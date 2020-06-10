var LineDataset = { "和了率": [], "平均和了点": [], "和了点期待値": [] };

// data
d3.json("./agariJunme.json").then(function (json) {
    for (j in json) {
        for (d in LineDataset) {
            console.log(LineDataset[d])
            LineDataset[d].push({ x_value: json[j]['巡目'], y_value: json[j][d] })
        }
    }
    update_chart("和了率");
});

var margin = { top: 10, right: 80, bottom: 30, left: 50 },
    width = 550 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// x axis
var x = d3.scaleLinear().range([0, width]);
var xAxis = d3.axisBottom().scale(x);
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "xAxis")

// y axis
var y = d3.scaleLinear().range([height, 50]);
var yAxis = d3.axisLeft().scale(y);
svg.append("g")
    .attr("class", "yAxis")

// title
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .style("font-size", "20px")
    .attr("x", (width / 2))
    .attr("y", (margin.top))
    .text("麻將折線圖");

// x axis text
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .style("font-size", "10px")
    .attr("x", width + 10)
    .attr("y", height + 10)
    .text("巡目");

// y axis text
var y_label = svg.append('text')
    .attr("class", "x label")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .style("font-size", "10px")
    .attr('x', -40)
    .attr('y', 40)

// update x axis, y axis, line
function update(data) {
    // x axis
    x.domain([1, d3.max(data, function (d) { return d.x_value })]);
    svg.selectAll(".xAxis").transition()
        .duration(2000)
        .call(xAxis);

    // y axis
    y.domain([0, d3.max(data, function (d) { return d.y_value })]);
    svg.selectAll(".yAxis")
        .transition()
        .duration(2000)
        .call(yAxis);

    // line
    var line = svg.selectAll(".line")
        .data([data], function (d) { return d.x_value });

    line.enter()
        .append("path")
        .attr("class", "line")
        .merge(line)
        .transition()
        .duration(2000)
        .attr("d", d3.line()
            .x(function (d) { return x(d.x_value); })
            .y(function (d) { return y(d.y_value); }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
}

// update y axis label
function update_y_label(s) {
    y_label
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .transition().duration(500)
        .style("opacity", 1)
        .text(s)
}

function hover(svg, data, start) {
    if (start === false) {
        svg.on("mousemove", not_moved)
            .on("mouseenter", not_entered)
            .on("mouseleave", not_left);
        return
    }
    if ("ontouchstart" in document)
        // Touch
        svg.style("-webkit-tap-highlight-color", "transparent")
            .on("touchmove", moved)
            .on("touchstart", entered)
            .on("touchend", left)
    else
        // Mouse
        svg.on("mousemove", moved)
            .on("mouseenter", entered)
            .on("mouseleave", left);

    // Dot
    const dot = svg.append("g")
        .attr("display", "none");

    dot.append("circle")
        .attr("r", 10)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("fill", "white");

    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 20)
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("x", -10)
        .attr("y", -20);

    function not_moved() {

    }
    function not_entered() {

    }
    function not_left() {

    }

    function moved() {
        console.log("Move");
        d3.event.preventDefault();
        const xm = x.invert(d3.event.offsetX)-3;
        var data_key = []
        for (d in data) {
            data_key.push(d);
        }
        const i1 = d3.bisectLeft(data_key, xm, 1);
        const i0 = i1 - 1;
        const i = xm - data_key[i0] > data_key[i1] - xm ? i1 : i0;

        dot.attr("transform", `translate(${x(data[i].x_value)},${y(data[i].y_value)})`);
        dot.select("text").text('巡目' + data[i].x_value + ": " + data[i].y_value.toFixed(2));
    }

    function entered() {
        console.log("Enter");
        dot.attr("display", null);
    }

    function left() {
        console.log("Left");
        dot.attr("display", "none");
    }
}

// update chart
function update_chart(s) {
    svg.call(hover, LineDataset[s], false);
    update(LineDataset[s]);
    update_y_label(s);
    setTimeout(() => { svg.call(hover, LineDataset[s], true); }, 2000);
}