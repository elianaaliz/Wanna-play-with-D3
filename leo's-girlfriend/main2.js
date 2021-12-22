const diCaprioBirthYear = 1974;
const age = function(year) { return year - diCaprioBirthYear }
const today = new Date().getFullYear()
const ageToday = age(today)

// ----------------------------------------------------------


// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 40, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
// create svg element, respecting margins
var svg = d3.select("#chart")
    .append("svg")
    .attr('id', 'svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const elementGroup = svg.append('g').attr('id', "elementGroup")

const axisGroup = svg.append('g').attr('id', "axisGroup")
const xAxisGroup = axisGroup.append("g").attr('id', "xAxisGroup")
    .attr("transform", "translate(0," + height + ")")

const yAxisGroup = axisGroup.append("g").attr('id', "yAxisGroup")

//Read the data
d3.csv("data.csv").then(data => {
    data.map(d => {
            d.year = +d.year
            d.age = +d.age
        })
        //console.log(data)

    // Add X axis
    var x = d3.scaleBand().domain(data.map(d => d.year)).range([0, width]).padding(0.2);

    let xAxis = d3.axisBottom().scale(x)
    xAxisGroup.call(xAxis)

    // Add Y axis
    var y = d3.scaleLinear().domain([(ageToday - 31), ageToday]).range([height, 0]);

    let yAxis = d3.axisLeft().scale(y)
    yAxisGroup.call(yAxis)


    // Add X axis label:
    elementGroup.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height + margin.top + 15)
        .text("X: Años de salida/noviazgo")

    // Y axis label:
    elementGroup.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Y: Edades de Leo Dicaprio")



    elementGroup
        .selectAll('rect').data(data)
        .enter()
        .append("rect")
        .attr("id", "barras")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.age))
        .attr("height", d => height - y(d.age))
        .attr("width", x.bandwidth())
        //.attr("fill", randomColor)
        //.style("fill", function(d) { return myColor(d.name) })
        .style("fill", function(d) {
            if (d.name == "Gisele Bündchen") {
                return "#762a83"
            }
            if (d.name == "Bar Rafaeli") {
                return "#9970ab"
            }
            if (d.name == "Blake Lively") {
                return "#c2a5cf"
            }
            if (d.name == "Erin Heatherson") {
                return "#e7d4e8"
            }
            if (d.name == "Toni Garrn") {
                return "#d9f0d3"
            }
            if (d.name == "Kelly Rohrbach") {
                return "#a6dba0"
            }
            if (d.name == "Nina Agdal") {
                return "#5aae61"
            }
            if (d.name == "Camila Morrone") {
                return "#1b7837"
            }
        })
        .style("opacity", 0.9)
        .on('mouseover', highlight)
        .on('mouseout', removeHighlight)



    // Add X axis
    var xleo = d3.scaleTime().domain(d3.extent(data.map(d => d.year))).range([0, width]);


    // Add Y axis
    var yleo = d3.scaleLinear().domain([16, ageToday]).range([height, 0]);


    elementGroup //.selectAll().data(data).enter()
        .datum(data)
        .append('path')
        // binds data to the line
        .attr('id', 'ageDiCaprio')
        .attr('stroke', '#FF8C00')
        .attr('stroke-width', '2.5')
        .attr('d', d3.line()
            .x(d => {
                //console.log(xleo(d.year));
                return xleo(d.year);
            })
            .y(d => {
                return (yleo(d.year - diCaprioBirthYear));
            }))
        .style("opacity", 0.6)

    elementGroup.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return xleo(d.year); })
        .attr("cy", function(d) { return yleo(d.year - diCaprioBirthYear); })
        .style("stroke", "#FF8C00")
        .style("fill", function(d) {
            if (d.name == "Gisele Bündchen") {
                return "#762a83"
            }
            if (d.name == "Bar Rafaeli") {
                return "#9970ab"
            }
            if (d.name == "Blake Lively") {
                return "#c2a5cf"
            }
            if (d.name == "Erin Heatherson") {
                return "#e7d4e8"
            }
            if (d.name == "Toni Garrn") {
                return "#d9f0d3"
            }
            if (d.name == "Kelly Rohrbach") {
                return "#a6dba0"
            }
            if (d.name == "Nina Agdal") {
                return "#5aae61"
            }
            if (d.name == "Camila Morrone") {
                return "#1b7837"
            }
        })
        .style("opacity", 0.9)
        .on('mouseover', highlight)
        .on('mouseout', removeHighlight)

    var Tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0.9)
        .attr("class", "tooltip")
        .style("background-color", "#7bccc4")

    //nuevo siguiendo el ejercicio 11

    function highlight(d) {

        Tooltip
            .html("Año: " + (d.year) + "<br/>" + "Nombre: " + d.name + "<br/>" + "Edad: " + d.age + "<br/>" + "----------------------" + "<br/>" + "Leo(Edad): " + (d.year - diCaprioBirthYear) + "<br/>" + "Diferencia de Edad: " + ((d.year - diCaprioBirthYear) - d.age))
            .style("background-color", "#FF8C00");
    }

    function removeHighlight() {

        Tooltip
            .html("")
            .style("background-color", "#7bccc4");
    }

})