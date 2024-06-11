import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadGraph() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const resp = await fetch(url);
    const data = await resp.json();
    const temps = data.monthlyVariance;

    const floor = d3.min(temps, d => d.variance);
    const ceil = d3.max(temps, d => d.variance);


    function formatMonth(numMonth) {
        let month;
        switch (numMonth) {
            case 1: month = "Jan"; break;
            case 2: month = "Feb"; break;
            case 3: month = "Mar"; break;
            case 4: month = "Apr"; break;
            case 5: month = "May"; break;
            case 6: month = "Jun"; break;
            case 7: month = "Jul"; break;
            case 8: month = "Aug"; break;
            case 9: month = "Sep"; break;
            case 10: month = "Oct"; break;
            case 11: month = "Nov"; break;
            case 12: month = "Dec"; break;
        }
        return month;
    }
    function formatVariance(variance) {
        return `${parseFloat(variance).toFixed(2)} &deg;C`;
    }
    function getTemp(variance) {
        return `${parseFloat(variance + data.baseTemperature).toFixed(2)} &deg;C`;
    }
    function getColor(variance) {
        let step = (variance - floor) / (ceil - floor);
        return `${step * 100}%`;
    }
    
    const width = 800;
    const height = 500;
    const padding = 50;
    const paddingTop = 30;
    const paddingBottom = 100;

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "border");

    document.querySelector("#graph").append(svg.node());

    //Creating Scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(temps, d => d.year), d3.max(temps, d => d.year)])
        .range([padding, width - padding]);

    const yScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([paddingTop, height - paddingBottom]);

    //Creating Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - paddingBottom})`)
        .call(d3.axisBottom(xScale).tickFormat(tick => tick));

    svg.append("g")
        .attr("transform", `translate(${padding},0)`)
        .call(d3.axisLeft(yScale).tickFormat(formatMonth));

    //Creating Heatmap
    svg.selectAll("rect")
        .data(temps)
        .join("rect")
        .attr("class", "cell")
        .attr("data-year", d => d.year)
        .attr("data-month", d => d.month)
        .attr("data-temp", d => getTemp(d.variance))
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month))
        .attr("width", d => xScale(d.year + 1) - xScale(d.year))
        .attr("height", yScale.bandwidth())
        .attr("opacity", d => getColor(d.variance));

    //Creating Legend
    const legendLength = 300;
    const legendScale = d3.scaleLinear()
        .domain([floor, ceil])
        .range([padding, legendLength]);

    const legend = svg.append("g")
        .attr("transform", `translate(0, ${height - padding * 0.75})`)
        .call(d3.axisBottom(legendScale).tickFormat(d => `${d > 0 ? "+" : ""}${d.toFixed(1)}C`)
            .tickValues([floor, (ceil + floor) / 2, ceil]));

    legend.append("rect")
        .attr("x", padding)
        .attr("y", -23)
        .attr("width", legendLength - padding)
        .attr("height", 20)
        .attr("class", "legend-color");

    const gradient = svg.append("linearGradient").attr("id", "legend-gradient");
        gradient.append("stop")
                .attr("offset", "0%")
                .attr("class", "legend-color-start");
        gradient.append("stop")
                .attr("offset", "100%")
                .attr("class", "legend-color-end");

    //Tooltip Logic
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.classList.add("border");
    document.body.append(tooltip);

    const cells = document.querySelectorAll(".cell");
    cells.forEach(temp => {
        temp.addEventListener("mouseenter", e => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
            
            const data = e.target.__data__;
            tooltip.innerHTML = `${data.year} - ${formatMonth(data.month)}<br>
                ${getTemp(data.variance)}<br>
                &Delta; ${formatVariance(data.variance)}<br>`;
        });
        temp.addEventListener("mouseleave", e => {
            tooltip.style.display = "none";
        });
    });
}

loadGraph();