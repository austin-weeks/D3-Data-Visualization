import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm";

async function loadGraph() {
    const educationUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
    const topology = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

    const eduResp = await fetch(educationUrl);
    const topoResp = await fetch(topology);
    const eduData = await eduResp.json();
    const topoData = await topoResp.json();

    const floor = d3.min(eduData, d => d.bachelorsOrHigher);
    const ceil = d3.max(eduData, d => d.bachelorsOrHigher);

    function getOpacity(fips) {
        const edRate = eduData.find(d => d.fips === fips).bachelorsOrHigher;

        let step = (edRate - floor) / (ceil - floor);
        return `${step * 100}%`;
    }
    function lerp(start, end, step) {
        return start + step * (end - start);
    }

    const width = 960;
    const height = 630;
    const padding = 30;

    const path = d3.geoPath();

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-padding, -padding, width + padding, height + padding])
        .attr("class", "border");

    document.querySelector("#graph").append(svg.node());

    //Creating Map
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topoData, topoData.objects.counties).features)
        .join("path")
        .attr("opacity", d => getOpacity(d.id))
        .attr("class", "county")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "#00ff0d")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    //Creating Legend
    const legendLength = 200;
    const legendScale = d3.scaleLinear()
        .domain([floor, ceil])
        .range([0, legendLength]);

    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width * 0.66}, ${padding + 15})`)
        .call(d3.axisBottom(legendScale).tickFormat(d => `${d.toFixed(0)}%`)
            .tickValues([floor, lerp(floor, ceil, 0.25), lerp(floor, ceil, 0.5), lerp(floor, ceil, 0.75), ceil]));

    legend.append("rect")
        .attr("x", 0)
        .attr("y", -28)
        .attr("width", legendLength)
        .attr("class", "legend-color")
        .attr("height", 25);

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

    const counties = document.querySelectorAll(".county");
    counties.forEach(county => {
        const data = eduData.find(d => d.fips === county.__data__.id);

        county.addEventListener("mouseenter", e => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";

            tooltip.innerHTML = `${data.area_name}, ${data.state} - ${data.bachelorsOrHigher}%`;
        });
        county.addEventListener("mouseleave", e => {
            tooltip.style.display = "none";
        });
    });

}

loadGraph();