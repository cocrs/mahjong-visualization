let vm = new Vue({
  el: "#game_board",
  data: {
    gameflow: [],
    gameflowSude: [],
  },
  mounted() {
    fetch("./gameRecordDict.json")
      .then((res) => res.json())
      .then((result) => {
        this.gameflow = result;
        this.gameflowSude = [];
        this.gameflow.playRecord.forEach((element) => {
          if (element.actionNum == 1) {
            this.gameflowSude.push(JSON.parse(JSON.stringify(element)));
            this.gameflowSude[this.gameflowSude.length - 1].tehai = [].concat(...this.gameflowSude[this.gameflowSude.length - 1].tehai);
            //console.log(this.gameflowSude[this.gameflowSude.length -1].tehai)
          }
        });
        //console.log(this.gameflowSude)
        this.draw_game_board();
        this.init_board(JSON.parse(JSON.stringify(this.gameflow.initCard)));
        this.slider(this.gameflow.initCard, this.gameflowSude);
      });
  },
  methods: {
    draw_game_board() {
      var margin = { top: 80, right: 25, bottom: 30, left: 60 },
        width = 1085 - margin.left - margin.right,
        height = 280 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3
        .select("#game_board")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // pic path array
      var numX = [];
      for (i = 0; i < 34; i++) {
        numX.push("" + i);
      }
      var myPics = [];
      for (j = 0; j < 3; j++) {
        switch (j) {
          case 0:
            fuda = "w";
            break;
          case 1:
            fuda = "t";
            break;
          case 2:
            fuda = "s";
            break;
        }
        for (i = 0; i < 9; i++) {
          myPics.push({ img: "./pic/" + (i + 1) + fuda + ".png" });
        }
      }
      myPics.push({ img: "./pic/east.png" });
      myPics.push({ img: "./pic/south.png" });
      myPics.push({ img: "./pic/west.png" });
      myPics.push({ img: "./pic/north.png" });
      myPics.push({ img: "./pic/bai.png" });
      myPics.push({ img: "./pic/fa.png" });
      myPics.push({ img: "./pic/chong.png" });

      numY = [];
      for (i = 0; i < 4; i++) {
        numY.push("player" + (i + 1));
      }

      // Build X scales and axis:
      var x = d3.scaleBand().range([0, width]).domain(numX).padding(0.05);
      svg
        .append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain")
        .remove();

      svg
        .selectAll(".tick")
        .data(myPics)
        .append("svg:image")
        .attr("xlink:href", function (d) {
          return d.img;
        })
        .attr("width", 30)
        .attr("height", 30)
        .attr("x", -15)
        .attr("y", 0);

      // Build Y scales and axis:
      var y = d3.scaleBand().range([height, 0]).domain(numY).padding(0.05);
      svg.append("g").style("font-size", 15).call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

      // create a tooltip
      var tooltip = d3
        .select("#game_board")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", 1);
      };
      var mousemove = function (d) {
        tooltip
          .html(d.yy + "<br/>持有數: " + d.num_of_cards)
          .style("left", d3.event.pageX - 20 + "px")
          .style("top", d3.event.pageY + 20 + "px");
      };
      var mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
      };

      // square data
      var num_of_blocks = [];
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 34; j++) {
          num_of_blocks.push({ xx: numX[j], yy: numY[i], owner: "無", num_of_cards: 0 });
        }
      }

      // add the squares
      svg
        .selectAll()
        .data(num_of_blocks)
        .enter()
        .append("g")
        .attr("x", function (d) {
          return x(d.xx);
        })
        .attr("y", function (d) {
          return y(d.yy);
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
      

        svg.selectAll("g")
        .append("rect")
        

      // Add title to graph
      svg.append("text").attr("y", -20).style("font-size", "22px").style("font-family", "Microsoft JhengHei").text("牌局視覺化");

      // let label = d3.select("svg")
      //   .selectAll(".label")
      //   .data(numY)
      //   .enter()
      //   .append("g")
      //   .attr("transform", "translate(" + 1000 + "," + 100 + ")");

      // label
      //   .append("rect")
      //   .attr("x", 0)
      //   .attr("y", function (d, i) {
      //     return 20
      //   })
      //   .attr("rx", "10")
      //   .attr("ry", "10")
      //   .attr("width", 50)
      //   .attr("height", 20)
      //   .style("fill", "blue")
    },
    init_board(initCard) {
      console.log(JSON.parse(JSON.stringify(initCard)));
      console.log(initCard);
      var linear = d3.scaleLinear().domain([1, 4]).range([0.4, 1]);

      d3.selectAll("rect").style("fill", (d) => {
        color = "";
        initCard.forEach((player, playerIndex) => {
          player.forEach((element) => {
            if (~~(element / 4) == d.xx && playerIndex == parseInt(d.yy.replace("player", "")) - 1) {
              d.owner = d.yy;
              d.num_of_cards++;
              //player.splice(index, 1)
              //console.log(gameflow.initCard[playerIndex], ~~(element / 4))
              switch (playerIndex) {
                case 0:
                  color = d3.interpolatePurples(linear(d.num_of_cards));
                  break;
                case 1:
                  color = d3.interpolateBlues(linear(d.num_of_cards));
                  break;
                case 2:
                  color = d3.interpolateOranges(linear(d.num_of_cards));
                  break;
                case 3:
                  color = d3.interpolateReds(linear(d.num_of_cards));
                  break;
              }
            }
          });
        });

        return color;
      });
    },
    slider(initCard, gameflowSude) {
      gameLength = gameflowSude.length;
      console.log(gameLength);
      var dataTime = [];
      for (i = 1; i <= gameLength; i++) {
        if (i % 4 == 0 || i == 1 || i == gameLength) {
          dataTime.push(i);
        }
      }

      var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .width(1000)
        .step(1)
        .tickFormat(d3.format(""))
        .tickValues(dataTime)
        .default(1)
        .on("onchange", (val) => {
          //console.log(val)
          this.update(JSON.parse(JSON.stringify(initCard)), gameflowSude, val - 2);
        });

      var gTime = d3
        .select("div#slider-time")
        .append("svg")
        .attr("width", 1050)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(35,30)");

      gTime.call(sliderTime);
    },
    update(initCard, gameflowSude, curkyoku) {
      console.log(initCard);
      playerLeft = [0, 1, 2, 3];
      console.log(curkyoku);
      d3.selectAll("rect").style("fill", (d) => {
        d.owner = "無";
        d.num_of_cards = 0;
        //console.log(d)
      });
      while (playerLeft.length > 0 && curkyoku >= 0) {
        if (playerLeft.includes(gameflowSude[curkyoku].who)) {
          for (i = 0; i < playerLeft.length; i++) {
            if (gameflowSude[curkyoku].who == playerLeft[i]) {
              playerLeft.splice(i, 1);
            }
          }
          initCard[gameflowSude[curkyoku].who] = gameflowSude[curkyoku].tehai;
        }
        curkyoku--;
      }
      this.init_board(initCard);
    },
  },
});
