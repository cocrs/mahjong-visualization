var vm = new Vue({
    el: "#game_board",
    data: {
        gameflow: [],
        gameflowSute: [],
    },
    mounted() {
        fetch("./gameRecordDict.json")
            .then((res) => res.json())
            .then((result) => {
                this.gameflow = result
                this.gameflowSute = []
                this.curSliderValue = 1
                this.gameflow.playRecord.forEach((element) => {
                    if (element.actionNum == 1) {
                        this.gameflowSute.push(JSON.parse(JSON.stringify(element)))
                        this.gameflowSute[this.gameflowSute.length - 1].tehai = [].concat(...this.gameflowSute[this.gameflowSute.length - 1].tehai)
                        //console.log(this.gameflowSute[this.gameflowSute.length -1].tehai)
                    }
                    /*
                    if (element.tehai !== undefined) {
                        element.tehai = [].concat(...element.tehai)
                    }*/
                })
                //console.log(this.gameflowSute)
                this.draw_game_board()
                this.init_board(JSON.parse(JSON.stringify(this.gameflow.initCard)), -1)
                this.slider(this.gameflow.initCard, this.gameflow.playRecord, 1)
            })
    },
    methods: {
        getShowStats() {
            return {
                'hands': Array(4).fill(null).map(function (_, index) {
                    return !document.getElementById('showHandsP' + (index + 1)).checked
                }),
                'throw': Array(4).fill(null).map(function (_, index) {
                    return !document.getElementById('showThrowP' + (index + 1)).checked
                }),
                'call': Array(4).fill(null).map(function (_, index) {
                    return !document.getElementById('showCallP' + (index + 1)).checked
                }),
                'wait': Array(4).fill(null).map(function (_, index) {
                    return !document.getElementById('showWaitP' + (index + 1)).checked
                }),
            }
        },
        draw_game_board() {
            var margin = { top: 80, right: 25, bottom: 30, left: 60 },
                width = 1085 - margin.left - margin.right,
                height = 280 - margin.top - margin.bottom

            // append the svg object to the body of the page
            var svg = d3
                .select("#game_board")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            // pic path array
            var numX = []
            for (i = 0; i < 34; i++) {
                numX.push("" + i)
            }
            var myPics = []
            for (j = 0; j < 3; j++) {
                switch (j) {
                    case 0:
                        fuda = "w"
                        break
                    case 1:
                        fuda = "t"
                        break
                    case 2:
                        fuda = "s"
                        break
                }
                for (i = 0; i < 9; i++) {
                    myPics.push({ img: "./pic/" + (i + 1) + fuda + ".png" })
                }
            }
            myPics.push({ img: "./pic/east.png" })
            myPics.push({ img: "./pic/south.png" })
            myPics.push({ img: "./pic/west.png" })
            myPics.push({ img: "./pic/north.png" })
            myPics.push({ img: "./pic/bai.png" })
            myPics.push({ img: "./pic/fa.png" })
            myPics.push({ img: "./pic/chong.png" })

            numY = []
            for (i = 0; i < 4; i++) {
                numY.push("player" + (i + 1))
            }

            // Build X scales and axis:
            var x = d3.scaleBand().range([0, width]).domain(numX).padding(0.1)
            svg
                .append("g")
                .style("font-size", 15)
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSize(0))
                .select(".domain")
                .remove()

            svg
                .selectAll(".tick")
                .data(myPics)
                .append("svg:image")
                .attr("xlink:href", function (d) {
                    return d.img
                })
                .attr("width", 30)
                .attr("height", 30)
                .attr("x", -15)
                .attr("y", 0)

            // Build Y scales and axis:
            var y = d3.scaleBand().range([height, 0]).domain(numY).padding(0.1)
            svg.append("g").style("font-size", 15).call(d3.axisLeft(y).tickSize(0)).select(".domain").remove()

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
                .style("padding", "5px")

            // Three function that change the tooltip when user hover / move / leave a cell
            var mouseover = function (d) {
                tooltip.style("opacity", 1)
                curx = d.xx
                cury = d.yy
                d3.selectAll("rect").style("opacity", (d) => {
                    if (d.xx == curx && d.yy == cury) {
                        return 1
                    }
                    return 0.8
                })
            }
            var mousemove = function (d) {
                tooltip
                    .html(d.yy + "<br/>持有數: " + d.num_of_cards)
                    .style("left", d3.event.pageX - 20 + "px")
                    .style("top", d3.event.pageY + 20 + "px")
            }
            var mouseleave = function (d) {
                tooltip.style("opacity", 0)
                d3.selectAll("rect").style("opacity", 0.8)
            }
            // square data
            var num_of_blocks = []
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 34; j++) {
                    num_of_blocks.push({ xx: numX[j], yy: numY[i], owner: "無", num_of_cards: 0 })
                }
            }

            // add the squares
            svg
                .selectAll()
                .data(num_of_blocks)
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.xx)
                })
                .attr("y", function (d) {
                    return y(d.yy) + 18.6
                })
                .attr("width", x.bandwidth() / 2)
                .attr("height", y.bandwidth() / 2)
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            svg
                .selectAll()
                .data(num_of_blocks)
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.xx) + 13.10
                })
                .attr("y", function (d) {
                    return y(d.yy) + 18.6
                })
                .attr("width", x.bandwidth() / 2)
                .attr("height", y.bandwidth() / 2)
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            svg
                .selectAll()
                .data(num_of_blocks)
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.xx)
                })
                .attr("y", function (d) {
                    return y(d.yy)
                })
                .attr("width", x.bandwidth() / 2)
                .attr("height", y.bandwidth() / 2)
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            svg
                .selectAll()
                .data(num_of_blocks)
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.xx) + 13.10
                })
                .attr("y", function (d) {
                    return y(d.yy)
                })
                .attr("width", x.bandwidth() / 2)
                .attr("height", y.bandwidth() / 2)
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            // Add title to graph
            svg.append("text").attr("y", -20).style("font-size", "22px").style("font-family", "Microsoft JhengHei").text("牌局視覺化")
            svg
                .append("text")
                .attr("id", "action")
                .attr("x", 120)
                .attr("y", -20)
                .style("font-size", "22px")
                .style("font-weight", "bold")
                .style("font-family", "Microsoft JhengHei")
                .text("")
        },
        init_board(initCard, targetIndex) {
            // console.log(JSON.parse(JSON.stringify(initCard)))
            console.log(targetIndex)
            let curAtion = ""
            let targetCard = -1
            let targetList = []
            let sutePair = []
            let skipDict = this.getShowStats()
            let skipShowHai = skipDict.hands
            let skipCallHai = skipDict.call
            let skipThrowHai = skipDict.throw
            let skipWaitHai = skipDict.wait
            let cardNumList = new Array(34).fill(0)
            if (targetIndex >= 0) {
                switch (this.gameflow.playRecord[targetIndex].actionNum) {
                    case 0:
                        curAtion = "摸牌"
                        break
                    case 1:
                        curAtion = "丟牌"
                        break
                    case 2:
                        curAtion = "鳴牌"
                        break
                }
            }
            console.log(JSON.parse(JSON.stringify(initCard)))
            initCard.forEach((player, index) => {
                player.forEach((card) => {
                    if (typeof card == typeof 0) {
                        if (!skipShowHai[index]) {
                            cardNumList[~~(card / 4)]++
                        }
                    } else {
                        card.forEach(c => {
                            if (!skipCallHai[index]) {
                                cardNumList[~~(c / 4)]++
                            }
                        })
                    }
                })
            })


            d3.select("#action").text(curAtion)
            tmpIndex = targetIndex
            while (tmpIndex >= 0) {
                if (this.gameflow.playRecord[tmpIndex].actionNum == 1) {
                    sutePair.push([this.gameflow.playRecord[tmpIndex].detail.targ, this.gameflow.playRecord[tmpIndex].who])
                    if (!skipThrowHai[this.gameflow.playRecord[tmpIndex].who]) {
                        cardNumList[~~(this.gameflow.playRecord[tmpIndex].detail.targ / 4)]++
                    }
                }
                if (this.gameflow.playRecord[tmpIndex].actionNum == 2) {
                    let detail = this.gameflow.playRecord[tmpIndex].detail
                    console.log(detail.type)
                    switch (detail.type) {
                        case 0:
                            let minCard = ~~(detail.minCard / 7) * 9 + detail.minCard % 7
                            cardNumList[minCard + detail.targNum] -= 1
                            break
                        case 1:
                        case 2:
                            console.log(detail.targ)
                            cardNumList[detail.targ] -= 1
                            break
                        default:
                            break
                    }
                }
                tmpIndex--
            }
            while (targetList.length < 5 && targetIndex >= 0) {
                if (this.gameflow.playRecord[targetIndex].actionNum == 0) {
                    targetList.unshift(this.gameflow.playRecord[targetIndex].detail.targ)
                    // console.log(targetCard)
                } else if (this.gameflow.playRecord[targetIndex].actionNum == 2) {
                    targetIndex--
                    targetList.unshift(this.gameflow.playRecord[targetIndex].detail.targ)
                    // console.log(targetCard)
                }
                targetIndex--
            }
            console.log(cardNumList)
            console.log(targetList)
            var linear = d3.scaleLinear().domain([1, 5]).range([0.6, 1])
            var cardLinear = d3.scaleLinear().domain([0, 4]).range([0.2, 0.8])

            d3.selectAll("rect").style("fill", (d) => {
                let color = ""
                sutePair.every((pair, curIndex) => {
                    //丟掉的牌
                    if (!skipThrowHai[pair[1]]) {
                        if (~~(pair[0] / 4) == d.xx && pair[1] == parseInt(d.yy.replace("player", "")) - 1) {
                            color = d3.interpolateLab("#456363", "#0ff2f2")((sutePair.length - curIndex) / sutePair.length)
                            sutePair.splice(curIndex, 1)
                            return false
                        }
                    }
                    return true
                })
                if (color == "") {
                    initCard.forEach((player, playerIndex) => {
                        player.every((card, index) => {
                            if (typeof card == typeof 0) {
                                if (!skipShowHai[playerIndex]) {
                                    if (color == "" && ~~(card / 4) == d.xx && playerIndex == parseInt(d.yy.replace("player", "")) - 1) {
                                        d.owner = d.yy
                                        d.num_of_cards++
                                        inter = 0.5
                                        if (targetList.includes(card)) {
                                            d = 4 - targetList.length
                                            inter = linear(targetList.indexOf(card) + d)
                                        }
                                        player.splice(index, 1)
                                        //console.log(gameflow.initCard[playerIndex], ~~(card / 4))
                                        color = d3.interpolatePurples(inter)
                                        return true
                                    }
                                    return true
                                }
                            } else {
                                card.forEach(function (c, i) {
                                    if (!skipCallHai[playerIndex]) {
                                        if (color == "" && ~~(c / 4) == d.xx && playerIndex == parseInt(d.yy.replace("player", "")) - 1) {
                                            d.owner = d.yy
                                            d.num_of_cards++
                                            inter = 0.5
                                            if (targetList.includes(card)) {
                                                d = 4 - targetList.length
                                                inter = linear(targetList.indexOf(card) + d)
                                            }
                                            card.splice(i, 1)
                                            //console.log(gameflow.initCard[playerIndex], ~~(card / 4))
                                            color = d3.interpolateOranges(inter)
                                            return true
                                        }
                                        return true
                                    }
                                })
                                if (card.length == 0) {
                                    player.splice(index, 1)
                                }
                                return true
                            }
                        })
                    })
                }
                if (color == "") {
                    color = d3.interpolateGreys(cardLinear(cardNumList[d.xx]))
                }
                return color
            })
        },
        slider(initCard, gameflowSute) {
            gameLength = gameflowSute.length
            // console.log(gameLength)
            var dataTime = []
            for (i = 1; i <= gameLength + 1; i++) {
                if (i % 4 == 0 || i == 1 || i == gameLength + 1) {
                    dataTime.push(i)
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
                    // console.log(val)
                    this.curSliderValue = val
                    this.update(JSON.parse(JSON.stringify(initCard)), gameflowSute, val - 2)
                })

            var gTime = d3.select("div#slider-time").append("svg").attr("width", 1050).attr("height", 100).append("g").attr("transform", "translate(35,30)")

            gTime.call(sliderTime)
        },
        update(initCard, gameflowSute, curkyoku) {
            tmp = curkyoku
            playerLeft = [0, 1, 2, 3]
            // console.log(curkyoku, gameflowSute[curkyoku])
            d3.selectAll("rect").style("fill", (d) => {
                d.owner = "無"
                d.num_of_cards = 0
            })
            while (playerLeft.length > 0 && curkyoku >= 0) {
                if (playerLeft.includes(gameflowSute[curkyoku].who)) {
                    for (i = 0; i < playerLeft.length; i++) {
                        if (gameflowSute[curkyoku].who == playerLeft[i]) {
                            playerLeft.splice(i, 1)
                        }
                    }
                    initCard[gameflowSute[curkyoku].who] = JSON.parse(JSON.stringify(gameflowSute[curkyoku].tehai))
                }
                curkyoku--
            }
            // console.log(JSON.parse(JSON.stringify(initCard)))
            // targetIndex = 0
            // if (tmp >= 0) {
            //   count = -1
            //   for (i = 0; i < this.gameflow.playRecord.length; i++) {
            //     if (this.gameflow.playRecord[i].actionNum == 1) count++
            //     if (count == tmp) {
            //       targetIndex = i
            //       break
            //     }
            //   }
            // }

            this.init_board(initCard, tmp)
        },
    },
})
