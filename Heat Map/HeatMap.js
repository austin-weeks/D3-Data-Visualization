import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadGraph() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const resp = await fetch(url);
    const json = await resp.json();
    const temps = json.monthlyVariance;

    const width = 800;
    const height = 500;
    const padding = 50;

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "border");

    document.querySelector("#graph").append(svg.node());

    const xScale = d3.scaleLinear()
        .domain([d3.min(temps, d => d.year), d3.max(temps, d => d.year)])
        .range([padding, width - padding]);


    svg.append("g")
        .attr("transform", `translate(0,${height - padding})`)
        .call(d3.axisBottom(xScale));

}

loadGraph();