import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const gameUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const moviesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const kickstarterUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
let curUrl = "";

const colorBtn = document.querySelector("#use-color");

function setPageInfo(url) {
    let title;
    let description;
    switch (url) {
        case gameUrl:
            title = "Video Game Sales";
            description = "Most Sold Video Games by Platform";
            break;
        case moviesUrl:
            title = "Movie Sales";
            description = "Highest Grossing Films by Genre";
            break;
        case kickstarterUrl:
            title = "Kickstarter Funding";
            description = "Most Funded Kickstarter Campaigns by Category";
    }
    document.querySelector("#title").textContent = title;
    document.querySelector("#description").textContent = description;
}
function getTooltip(prod) {
    switch (curUrl) {
        case gameUrl:
            return `<strong>${prod.data.name}</strong><br>
                ${prod.data.category}<br>
                ${parseFloat(prod.data.value).toFixed(1)} M Copies Sold`;
        case kickstarterUrl:
        case moviesUrl: return `<strong>${prod.data.name}</strong><br>
                ${prod.data.category}<br>
                $${parseInt(prod.data.value).toLocaleString()}`;
    }
}

async function loadGraph(url, forceChange = false) {
    if (curUrl === url && !forceChange) return;
    curUrl = url;
    setPageInfo(url);
    document.querySelector("#graph").innerHTML = "";

    const gameResp = await fetch(url);
    const data = await gameResp.json();

    let curData = data;

    const width = 900;
    const height = 550;
    const padding = 50;
        
    function getColor(category) {
        if (!colorBtn.checked) return "no-color";
        const ind = data.children.findIndex(d => d.name === category);
        return `color-${ind}`;
    }

    const treeMap = d3.treemap()
        .size([width, height])
        .padding(0);

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "border");
    document.querySelector("#graph").append(svg.node());

    //Setting Data?
    const root = d3.hierarchy(curData)
        .eachBefore(function (d) {
            d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
        })
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    treeMap(root);


    const groups = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "data-group")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .attr("class", d => getColor(d.data.category));

    groups.append("rect")
        .attr("id", d => d.data.id)
        .attr("class", "data-tile")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value);

    groups.append("text")
        .attr("class", "tile-text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 12 + i * 10)
        .text(d => d);

    //Legend
    if (colorBtn.checked) {
        document.querySelector("#legend").innerHTML = `
        ${data.children.map((d, i) => {
            return `<div class="legend-item">
            <div class="legend-color color-${i}"></div>
            <span class="legend-text">${d.name}</span>
            </div>`
        }).join("")}`;
    }


    //Tooltip Logic
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.classList.add("border");
    document.body.append(tooltip);

    const tiles = document.querySelectorAll(".data-tile");
    tiles.forEach(tile => {
        tile.addEventListener("mousemove", e => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";

            const data = e.target.__data__;
            tooltip.innerHTML = getTooltip(data);
        });
        tile.addEventListener("mouseleave", e => {
            tooltip.style.display = "none";
        });
    });
}

loadGraph(gameUrl);

document.querySelector("#game-data").addEventListener("click", () => loadGraph(gameUrl));
document.querySelector("#movie-data").addEventListener("click", () => loadGraph(moviesUrl));
document.querySelector("#kickstarter-data").addEventListener("click", () => loadGraph(kickstarterUrl));

colorBtn.addEventListener("change", () => loadGraph(curUrl, true));