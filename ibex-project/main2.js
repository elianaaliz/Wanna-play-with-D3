// format the date
const formatDate = d3.timeParse("%d/%m/%Y")

// load the data
const loadData = d3.json('data.json').then(data => {

    data.map(d => {
        d.date = formatDate(d.date)
    })
    initialiseChart(data);

})

// set a dimension
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const width = window.innerWidth - margin.left - margin.right; // Use the window's width
const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

// create a svg
const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin['left'] + margin['right'])
    .attr('height', height + margin['top'] + margin['bottom'])
    .append('g')
    .attr('transform', `translate(${margin['left']}, ${margin['top']})`);


const elementGroup = svg.append("g").attr("id", "elementGroup")



const initialiseChart = data => {

    // find data range
    const xMin = d3.min(data, d => {
        return d.date;
    });

    const xMax = d3.max(data, d => {
        return d.date;
    });

    const yMin = d3.min(data, d => {
        return d.close;
    });

    const yMax = d3.max(data, d => {
        return d.close;
    });

    // scale using domain and range
    const xScale = d3
        .scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([yMin - 5, yMax])
        .range([height * (3 / 4), 0]);

    // Add and call X and Y axis
    const axisGroup = svg.append("g").attr("id", "axisGroup")
    const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
        .attr('transform', `translate(0, ${height*(3/4)})`)


    var xAxis = d3.axisBottom().scale(xScale)

    xAxisGroup.call(xAxis)

    const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup")


    var yAxis = d3.axisLeft().scale(yScale)

    yAxisGroup.call(yAxis)


    // Funcion para generar Linea en d3
    const line = d3
        .line()
        .x(d => {
            return xScale(d.date);
        })
        .y(d => {
            return yScale(d.close);
        });

    elementGroup
        .append('path')
        .data([data])
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '3.5')
        .attr('d', line);

    // x and y network/gang
    const zoom = elementGroup
        .append('g')
        .attr('class', 'zoom')
        .style('display', 'none');

    zoom.append('circle').attr('r', 2.5);
    zoom.append('line').classed('x', true);
    zoom.append('line').classed('y', true);

    elementGroup
        .append('rect')
        .data([data])
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', () => zoom.style('display', null))
        .on('mouseout', removeHighlight)

    .on('mousemove', doNet);

    elementGroup.select('.overlay').style('fill', 'none');
    elementGroup.select('.overlay').style('pointer-events', 'all');

    elementGroup.selectAll('.zoom line').style('fill', 'none');
    elementGroup.selectAll('.zoom line').style('stroke', '#67809f');
    elementGroup.selectAll('.zoom line').style('stroke-width', '1px');
    elementGroup.selectAll('.zoom line').style('stroke-dasharray', '3 3');

    //returs insertion point
    const insertionDate = d3.bisector(d => d.date).left;

    // function to generate a net 
    function doNet() {
        //returns corresponding value from the domain
        const correspondingDate = xScale.invert(d3.mouse(this)[0]);
        //gets insertion point
        const i = insertionDate(data, correspondingDate, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const currentPoint =
            correspondingDate - d0.date > d1.date - correspondingDate ? d1 : d0;
        zoom.attr(
            'transform',
            `translate(${xScale(currentPoint.date)}, ${yScale(
            currentPoint.close
          )})`
        );

        zoom
            .select('line.x')
            .attr('x1', 0)
            .attr('x2', -xScale(currentPoint.date))
            .attr('y1', 0)
            .attr('y2', 0);

        zoom
            .select('line.y')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height - yScale(currentPoint.close));

        highlight(currentPoint);

    }

    // Tooltip part

    var Tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0.8)
        .attr("class", "tooltip")
        .style("background-color", "white")

    const highlight = currentData => {

        Tooltip
            .html("Date: " + currentData['date'].toLocaleDateString() + "<br/>" + "High: " + currentData['high'].toFixed(2) + "<br/>" + "Low: " + currentData['low'].toFixed(2) + "<br/>" + "Open: " + currentData['open'].toFixed(2) + "<br/>" + "Close: " + currentData['close'].toFixed(2) + "<br/>" + "Volume: " + currentData['volume'])
            .style("background-color", "#FF8C00")
            .style("opacity", 0.8)
            .style("left", (xScale(currentData.date) + 80) + "px")
            .style("top", (yScale(currentData.close) + 10) + "px");

    };

    function removeHighlight() {

        zoom.style('display', 'none')
        Tooltip
            .html("")
            .style("background-color", "transparent");
    };


    // PARTE DEL VOLUMEN

    const yMinVolume = d3.min(data, d => {
        return Math.min(d.volume);
    });

    const yMaxVolume = d3.max(data, d => {
        return Math.max(d.volume);
    });

    const yVolumeScale = d3
        .scaleLinear()
        .domain([yMinVolume, yMaxVolume])
        .range([height, height * (3 / 4)]);

    const vxAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
        .attr('transform', `translate(0, ${height})`)
    var vxAxis = d3.axisBottom().scale(xScale)

    vxAxisGroup.call(vxAxis)

    const vyAxisGroup = axisGroup.append("g").attr("id", "vAyxisGroup")


    var vyAxis = d3.axisLeft().scale(yVolumeScale)

    vyAxisGroup.call(vyAxis)

    elementGroup
        .selectAll()
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => {
            return xScale(d.date);
        })
        .attr('y', d => {
            return yVolumeScale(d.volume);
        })
        .attr('class', 'vol')
        .attr('fill', (d, i) => {
            if (i === 0) {
                return 'green';
            } else {
                return data[i - 1].close > d.close ? 'red' : 'green'; // green if price is rising during that period, and red when price is down/fall
            }
        })
        .style("opacity", 0.8)
        .attr('width', 3)
        .attr('height', d => {
            return height - yVolumeScale(d.volume);
        });

    elementGroup.append('g').call(d3.axisLeft(yVolumeScale));



}