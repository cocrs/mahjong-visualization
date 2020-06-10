function wordCloud(selector) {
    var fill = d3v3.scale.category20();
    var fill2 = d3v3.scale.category20b();
    var fill3 = d3v3.scale.category20c();

    //Construct the word cloud's SVG element
    var svg = d3v3.select(selector)
        .select(".cloud")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600)
        .append("g")
        .attr("transform", "translate(400,300)");

    //Draw the word cloud
    function draw(words) {
        var cloud = svg.selectAll("g text").data(words, function (d) {
            return d.text;
        });

        //Entering words
        cloud
            .enter()
            .append("text")
            //.style("opacity", 0.7)
            .style("font-family", 'Noto Sans JP')
            .style("fill", function (d, i) {
                if (i >= 20) return fill2(i - 20);
                if (i >= 40) return fill3(i - 40);
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .attr("font-size", 1)
            .text(function (d) {
                return d.text;
            });

        //Entering and existing words
        cloud
            .transition()
            .duration(600)
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        let tooltip = d3
            .select("body")
            .append("div")
            .style("visibility", "hidden")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("position", "center")
            .style("padding", "4px")
            .style("border-width", "2px")
            .style("border-radius", "3px")
            .style("display", "block")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("font-size", "20px");

        cloud.on("mouseover", function () {
            d3v3.select(this)
                .transition()
                .style("opacity", 1)
                .attr("d", function (d) {
                    label = d.text + "<br/>出現次數： " + d.freq + "<br/>出現機率： " + (d.freq / 2000) + "%";
                });
            let target = this
            d3v3.selectAll(".cloud text")
                .transition()
                .style("opacity", function (t) {
                    return this == target ? 1 : 0.2
                });
        });
        cloud.on("mousemove", function () {
            tooltip
                .html(label)
                .style("left", d3v3.event.pageX - 20 + "px")
                .style("top", d3v3.event.pageY + 20 + "px")
                .style("visibility", "visible");
        });
        cloud.on("mouseout", function () {
            d3v3.selectAll(".cloud text")
                .transition()
                .style("opacity", 1);
            //d3v3.select(this).style("opacity", 0.7);
            tooltip.style("visibility", "hidden");
        });
    }

    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {
        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function (dataset, linear) {
            d3.layout
                .cloud()
                .size([800, 600])
                .words(dataset)
                .padding(5)
                .rotate(function () {
                    return ~~(Math.random() * 2) * 90;
                })
                .font('Noto Sans JP')
                .fontSize(function (d) {
                    return linear(d.size);
                })
                .on("end", draw)
                .start();
        },
    };
}

//Prepare one of the sample sentences by removing punctuation,
// creating an array of words and computing a random size attribute.
function getWords(i) {
    return words[i]
        .replace(/[!\.,:;\?]/g, "")
        .split(" ")
        .map(function (d) {
            return { text: d, size: 10 + Math.random() * 60 };
        });
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

//This method tells the word cloud to redraw with a new set of words.
//In reality the new words would probably come from a server request,
// user input or some other source.
function showNewWords(vis, i) {
    i = i || 0;
    d3v3.json("./yakuFreqFormedSimple.json", (error, data) => {
        if (error) {
            console.log(error);
        } else {
            dataset = data.map(function (d) {
                return { text: d.name, size: d.freq, freq: d.freq };
            });
            var max = 0;
            dataset.forEach((elm) => {
                if (elm.freq > max) max = elm.freq;
            });
            console.log(max);
            var linear = d3v3.scale.linear().domain([1, max]).range([12, 100]);

            //console.log(dataset)
            vis.update(dataset, linear);
        }
    });
}

//Create a new instance of the word cloud visualisation.
var myWordCloud = wordCloud("body");

//Start cycling through the demo data
showNewWords(myWordCloud);