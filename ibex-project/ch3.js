const formatDate = d3.timeParse("%d/%m/%Y")


const loadData = d3.json('data.json').then(data => {

    data.map(d => {
        d.date = formatDate(d.date)
    })
    initialiseChart(data);

})


const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const width = window.innerWidth - margin.left - margin.right; // Use the window's width
const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

// add chart SVG to the page
const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin['left'] + margin['right'])
    .attr('height', height + margin['top'] + margin['bottom'])
    .append('g')
    .attr('transform', `translate(${margin['left']}, ${margin['top']})`);


const elementGroup = svg.append("g").attr("id", "elementGroup")
    //.attr("transform", `translate(${margin['left']}, ${margin['top']})`);


const initialiseChart = data => {

    // find data range
    const xMin = d3.min(data, d => {
        //console.log(d);
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

    // scale using range
    const xScale = d3
        .scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([yMin - 5, yMax])
        .range([height * (3 / 4), 0]);


    const axisGroup = svg.append("g").attr("id", "axisGroup")
    const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
        //.attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr('transform', `translate(0, ${height*(3/4)})`)


    var xAxis = d3.axisBottom().scale(xScale)

    xAxisGroup.call(xAxis)

    const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup")
        //.attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        //.attr('transform', `translate(0, ${height*(3/4)})`)


    var yAxis = d3.axisLeft().scale(yScale)

    yAxisGroup.call(yAxis)

    //mioo añadiendo el eje del primer gráfico
    /*svg
        .append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height*(3/4)})`)
        .call(d3.axisBottom(xScale));*/
    // create the axes component
    /*svg
        .append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg
        .append('g')
        .attr('id', 'yAxis')
        //.attr('transform', `translate(${width}, 0)`)
        .call(d3.axisLeft(yScale));*/

    // renders close price line chart and moving average line chart

    // generates lines when called
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
        .data([data]) // binds data to the line
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '3.5')
        .attr('d', line);

    // renders x and y crosshair
    const focus = elementGroup
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('circle').attr('r', 2.5);
    focus.append('line').classed('x', true);
    focus.append('line').classed('y', true);

    elementGroup
        .append('rect')
        .data([data])
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', () => focus.style('display', null))
        .on('mouseout', removeHighlight)

    .on('mousemove', generateCrosshair);

    elementGroup.select('.overlay').style('fill', 'none');
    elementGroup.select('.overlay').style('pointer-events', 'all');

    elementGroup.selectAll('.focus line').style('fill', 'none');
    elementGroup.selectAll('.focus line').style('stroke', '#67809f');
    elementGroup.selectAll('.focus line').style('stroke-width', '1px');
    elementGroup.selectAll('.focus line').style('stroke-dasharray', '3 3');

    //returs insertion point
    const bisectDate = d3.bisector(d => d.date).left;

    /* mouseover function to generate crosshair */
    function generateCrosshair() {
        //returns corresponding value from the domain
        const correspondingDate = xScale.invert(d3.mouse(this)[0]);
        //gets insertion point
        const i = bisectDate(data, correspondingDate, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const currentPoint =
            correspondingDate - d0.date > d1.date - correspondingDate ? d1 : d0;
        focus.attr(
            'transform',
            `translate(${xScale(currentPoint.date)}, ${yScale(
            currentPoint.close
          )})`
        );

        focus
            .select('line.x')
            .attr('x1', 0)
            .attr('x2', -xScale(currentPoint.date))
            .attr('y1', 0)
            .attr('y2', 0);

        focus
            .select('line.y')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height - yScale(currentPoint.close));

        // updates the legend to display the date, open, close, high, low, and volume of the selected mouseover area
        //updateLegends(currentPoint);
        //console.log(currentPoint);
        // no leyendas
        highlight(currentPoint);
        //removeHighlight();
    }

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

        focus.style('display', 'none')
            //d3.selectAll("div.tooltip").remove()
        Tooltip
            .html("")
            .style("background-color", "transparent");
    };

    /* Legends */
    const updateLegends = currentData => {


        elementGroup.selectAll('.lineLegend').remove();

        const legendKeys = Object.keys(data[0]);
        //console.log(legendKeys);
        const lineLegend = svg
            .selectAll('.lineLegend')
            .data(legendKeys)
            .enter()
            .append('g')
            .attr('class', 'lineLegend')
            .attr('transform', (d, i) => {
                return `translate(0, ${i * 20})`;
            });
        lineLegend
            .append('text')
            .text(d => {

                if (d === 'date') {
                    return `${d}: ${currentData[d].toLocaleDateString()}`;
                } else if (
                    d === 'high' ||
                    d === 'low' ||
                    d === 'open' ||
                    d === 'close'
                ) {
                    return `${d}: ${currentData[d].toFixed(2)}`;
                } else {
                    return `${d}: ${currentData[d]}`;
                }

            })
            .style('fill', 'black')
            .attr('transform', 'translate(15,9)') //align texts with boxes

    };

    // PARTE DEL VOLUMEN
    /* Volume series bars */
    //const volData = data.filter(d => d['volume'] !== null && d['volume'] !== 0);

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
        //.attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr('transform', `translate(0, ${height})`)
    var vxAxis = d3.axisBottom().scale(xScale)

    vxAxisGroup.call(vxAxis)

    const vyAxisGroup = axisGroup.append("g").attr("id", "vAyxisGroup")
        //.attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        //.attr('transform', `translate(0, ${height*(3/4)})`)


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
                return data[i - 1].close > d.close ? 'red' : 'green'; // green bar if price is rising during that period, and red when price  is falling
            }
        })
        .style("opacity", 0.8)
        .attr('width', 3)
        .attr('height', d => {
            return height - yVolumeScale(d.volume);
        });

    elementGroup.append('g').call(d3.axisLeft(yVolumeScale));



}