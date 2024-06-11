import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadGraph() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    const width = 800;
    const height = 500;
    const padding = 50;

    //Fetching Data
    const resp = await fetch(url);
    const json = await resp.json();
    const gdpData = json.data;

    function filterDate(date) {
        let quarter;
        const month = date.substring(5, 7);
        switch (month) {
            case "01": quarter = "Q1"; break;
            case "04": quarter = "Q2"; break;
            case "07": quarter = "Q3"; break;
            case "10": quarter = "Q4"; break;
            default: quarter = "Q1"; break;
        }
        return `${date.substring(0, 4)} ${quarter}`
    }

    const years = gdpData.map(d => {
        let quarter;
        const month = d[0].substring(5, 7);
        switch (month) {
            case "01": quarter = "Q1"; break;
            case "04": quarter = "Q2"; break;
            case "07": quarter = "Q3"; break;
            case "10": quarter = "Q4"; break;
            default: quarter = "Q1"; break;
        }
        return `${d[0].substring(0, 4)} ${quarter}`;
    });
    const utcDate = gdpData.map(d => new Date(d[0]));

    //Creating Scales
    const xScale = d3.scaleTime()
        .domain([d3.min(utcDate), d3.max(utcDate)])
        .range([padding, width - padding]);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(gdpData, d => d[1])])
        .range([height - padding, padding])

    //Building Graph
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "border");

        document.querySelector("#graph").append(svg.node());

    //X Axis
    svg.append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(xScale).tickSizeOuter(0));
    //Y Axis
    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    //Y Axis Label
    svg.append("text")
        .attr("y", padding * 1.5)
        .attr("x", 0 - height / 1.75)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#00ff0d")
        .text("Gross Domestic Product (Billions USD)")
        .attr("font-size", ".65em");


    //Creating Bars
    svg.append("g")
    .selectAll()
    .data(gdpData)
    .join("rect")
        .attr("class", "bar")
        .attr("data-date", d => filterDate(d[0]))
        .attr("data-gdp", d => d[1])
        .attr("x", (d, i) => xScale(utcDate[i]))
        .attr("y", d => yScale(d[1]))
        .attr("width", 3)
        .attr("height", d => yScale(0) - yScale(d[1]));


    //Overlay Logic
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.classList.add("border");
    document.body.append(tooltip);
    tooltip.innerHTML = "Year: 2000 Q1";

    const bars = document.querySelectorAll(".bar");
    bars.forEach(bar => {
        bar.addEventListener("mouseenter", e => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
            tooltip.innerHTML = `${filterDate(e.target.__data__[0])}<br>
                GDP: $${e.target.__data__[1]} Billion`

        });
        bar.addEventListener("mouseleave", e => {
            tooltip.style.display = "none";
        });
    });
}

loadGraph();