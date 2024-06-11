import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadGraph() {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    const resp = await fetch(url);
    const times = await resp.json();

    const width = 800;
    const height = 500;
    const padding = 50;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "border");

    document.querySelector("#graph").append(svg.node());

    //Creating Scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(times, d => d.Year) - 1, d3.max(times, d => d.Year) + 1])
        .range([padding, width - padding]);
    const yScale = d3.scaleLinear()
        .domain([d3.max(times, d => d.Seconds) + 10, d3.min(times, d => d.Seconds) - 10])
        .range([height - padding, padding]);

    //Creating Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - padding})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${padding},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => formatTime(d)));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("fill", "currentColor")
        .attr("x", -height / 2)
        .attr("y", padding * 1.5)
        .style("text-anchor", "middle")
        .attr("font-size", "0.8em")
        .text("Time");

    //Creating Points
    svg.selectAll("circle")
    .data(times)
    .join("circle")
        .attr("stroke", d => d.Doping ? "none" : "currentColor")
        .attr("stroke-width", 1.5)
        .attr("class", d => d.Doping ? "dot dot-clickable" : "dot")
        .attr("fill", d => d.Doping? "currentColor" : "#212121")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Seconds))
        .attr("r", 5)

    const noDope = document.querySelector("#no-dope");
    const dope = document.querySelector("#dope");
    noDope.style.stroke = "currentColor";
    noDope.style.strokeWidth = 1.5;
    dope.style.fill = "currentColor";

    //Tooltip Logic
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.classList.add("border");
    document.body.append(tooltip);

    const plots = document.querySelectorAll(".dot");
    plots.forEach(plot => {
        plot.addEventListener("mouseenter", e => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
            
            const data = e.target.__data__;
            tooltip.innerHTML = `${data.Name} - ${data.Nationality}<br>
                ${data.Year} - ${data.Time}<br>
                <br>
                ${data.Doping ? data.Doping : "No History of PED Use"}`;

        });
        plot.addEventListener("mouseleave", e => {
            tooltip.style.display = "none";
        });

        plot.addEventListener("click", e => {
            const data = e.target.__data__;
            if (data.Doping) window.open(data.URL, "_blank");
        });
    });
}

loadGraph();