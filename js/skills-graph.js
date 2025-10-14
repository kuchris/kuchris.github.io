// Global variables for the force graph
let skillsGraph = {
    svg: null,
    simulation: null,
    nodes: null,
    links: null,
    labels: null,
    width: 0,
    height: 0
};

async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        if (!response.ok) {
            throw new Error('Failed to load skills.json');
        }
        const data = await response.json();
        renderSkillsGraph(data);
    } catch (error) {
        console.error('Error loading skills data:', error);
        const skillsGraph = document.getElementById('skills-graph');
        if (skillsGraph) {
            skillsGraph.innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load skills graph. Please try again later.</p>';
        }
    }
}

function renderSkillsGraph(data) {
    const container = document.getElementById('skills-graph');
    if (!container) {
        console.error('Skills container not found');
        return;
    }

    initSkillsGraph(container, data);
    window.addEventListener('resize', () => handleResize(container, data));
}

function initSkillsGraph(container, data) {
    const rect = container.getBoundingClientRect();
    skillsGraph.width = rect.width;
    skillsGraph.height = rect.height;

    // Clear existing content
    d3.select(container).selectAll("*").remove();

    // Add controls
    const controlsDiv = d3.select(container)
        .append("div")
        .attr("class", "graph-controls")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("z-index", "100")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("border-radius", "8px")
        .style("padding", "8px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)");

    controlsDiv.append("button")
        .attr("class", "control-btn")
        .style("background", "#667eea")
        .style("color", "white")
        .style("border", "none")
        .style("padding", "6px 10px")
        .style("margin", "2px")
        .style("border-radius", "4px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .text("Reset")
        .on("click", resetSkillsGraph);

    // Add tooltip
    const tooltip = d3.select(container)
        .append("div")
        .attr("class", "skills-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", "0")
        .style("z-index", "1000");

    // Create SVG
    skillsGraph.svg = d3.select(container)
        .append("svg")
        .attr("width", skillsGraph.width)
        .attr("height", skillsGraph.height)
        .attr("viewBox", [0, 0, skillsGraph.width, skillsGraph.height]);

    // Add zoom and pan
    const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => {
            skillsGraph.svg.select(".graph-group")
                .attr("transform", event.transform);
        });

    skillsGraph.svg.call(zoom);

    const g = skillsGraph.svg.append("g").attr("class", "graph-group");

    // Create links
    const linkGroup = g.append("g").attr("class", "links");
    skillsGraph.links = linkGroup.selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", "#999")
        .style("stroke-opacity", "0.4");

    // Create nodes
    const nodeGroup = g.append("g").attr("class", "nodes");
    skillsGraph.nodes = nodeGroup.selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", d => getSkillNodeRadius(d, data))
        .attr("fill", d => getSkillNodeColor(d))
        .style("stroke", "#fff")
        .style("stroke-width", "1.5px")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => handleSkillMouseOver(event, d, data, tooltip))
        .on("mouseout", () => handleSkillMouseOut(tooltip))
        .on("click", handleSkillNodeClick)
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    // Create labels
    const labelGroup = g.append("g").attr("class", "labels");
    skillsGraph.labels = labelGroup.selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .attr("class", d => `label ${getSkillNodeType(d, data)}`)
        .style("font-family", "Segoe UI, Tahoma, Geneva, Verdana, sans-serif")
        .style("font-size", d => getSkillLabelSize(d, data))
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle")
        .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")
        .text(d => d[currentLang] || d.id);

    // Initialize simulation
    skillsGraph.simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(d => getSkillDistance(d, data)))
        .force("charge", d3.forceManyBody().strength(d => getSkillCharge(d, data)))
        .force("center", d3.forceCenter(skillsGraph.width / 2, skillsGraph.height / 2))
        .force("collision", d3.forceCollide().radius(d => getSkillNodeRadius(d, data) + 5))
        .force("boundary", boundaryForce)
        .on("tick", tickSkillsGraph);
}

function getSkillNodeRadius(d, data) {
    const isMobile = window.innerWidth < 768;
    if (d.group === 0) return isMobile ? 15 : 18; // Root

    const isCategory = data.links.some(link =>
        link.source === "Technical Expertise" && link.target === d.id
    );

    if (isCategory) return isMobile ? 10 : 12; // Categories
    return isMobile ? 6 : 8; // Individual skills
}

function getSkillNodeColor(d) {
    const colors = [
        '#667eea', '#f093fb', '#4facfe', '#43e97b',
        '#fa709a', '#fee140', '#a8edea', '#d299c2',
        '#ffecd2', '#fcb69f', '#89f7fe'
    ];
    return colors[d.group] || '#999';
}

function getSkillNodeType(d, data) {
    if (d.group === 0) return 'root';
    const isCategory = data.links.some(link =>
        link.source === "Technical Expertise" && link.target === d.id
    );
    return isCategory ? 'category' : 'skill';
}

function getSkillLabelSize(d, data) {
    const isMobile = window.innerWidth < 768;
    const type = getSkillNodeType(d, data);

    if (type === 'root') return isMobile ? '12px' : '14px';
    if (type === 'category') return isMobile ? '10px' : '12px';
    return isMobile ? '8px' : '11px';
}

function getSkillDistance(d, data) {
    const isMobile = window.innerWidth < 768;
    const baseDistance = isMobile ? 40 : 60;
    return d.source.group === 0 ? baseDistance * 1.5 : baseDistance;
}

function getSkillCharge(d, data) {
    const isMobile = window.innerWidth < 768;
    const baseCharge = isMobile ? -150 : -200;
    if (d.group === 0) return baseCharge * 2;

    const isCategory = data.links.some(link =>
        link.source === "Technical Expertise" && link.target === d.id
    );

    return isCategory ? baseCharge * 1.2 : baseCharge;
}

function boundaryForce() {
    const padding = 30;
    for (let node of skillsGraph.simulation.nodes()) {
        node.x = Math.max(padding, Math.min(skillsGraph.width - padding, node.x));
        node.y = Math.max(padding, Math.min(skillsGraph.height - padding, node.y));
    }
}

function tickSkillsGraph() {
    skillsGraph.links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    skillsGraph.nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    skillsGraph.labels
        .attr("x", d => d.x)
        .attr("y", d => d.y + 3);
}

function handleSkillMouseOver(event, d, data, tooltip) {
    // Highlight connected nodes and links
    const connectedNodeIds = new Set();
    connectedNodeIds.add(d.id);

    skillsGraph.links
        .style("stroke", link => {
            const isConnected = link.source.id === d.id || link.target.id === d.id;
            if (isConnected) {
                connectedNodeIds.add(link.source.id);
                connectedNodeIds.add(link.target.id);
                return "#f39c12";
            }
            return "#999";
        })
        .style("stroke-opacity", link => {
            const isConnected = link.source.id === d.id || link.target.id === d.id;
            return isConnected ? 0.8 : 0.2;
        })
        .style("stroke-width", link => {
            const isConnected = link.source.id === d.id || link.target.id === d.id;
            return isConnected ? 2 : 1;
        });

    skillsGraph.nodes
        .style("stroke", node => connectedNodeIds.has(node.id) ? "#e74c3c" : "#fff")
        .style("stroke-width", node => connectedNodeIds.has(node.id) ? "3px" : "1.5px");

    // Show tooltip
    tooltip
        .style("opacity", 1)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .html(`<strong>${d.id}</strong><br/>Type: ${getSkillNodeType(d, data)}`);
}

function handleSkillMouseOut(tooltip) {
    skillsGraph.links
        .style("stroke", "#999")
        .style("stroke-opacity", "0.4")
        .style("stroke-width", "1");

    skillsGraph.nodes
        .style("stroke", "#fff")
        .style("stroke-width", "1.5px");

    tooltip.style("opacity", 0);
}

function handleSkillNodeClick(event, d) {
    // Double-click to fix/unfix node
    if (event.detail === 2) {
        d.fx = d.fx ? null : d.x;
        d.fy = d.fy ? null : d.y;
        skillsGraph.simulation.alpha(0.3).restart();
    }
}

function dragStarted(event, d) {
    if (!event.active) skillsGraph.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) skillsGraph.simulation.alphaTarget(0);
}

function resetSkillsGraph() {
    // Unfix all nodes and restart simulation
    skillsGraph.simulation.nodes().forEach(d => {
        d.fx = null;
        d.fy = null;
    });
    skillsGraph.simulation.alpha(1).restart();
}

function handleResize(container, data) {
    let resizeTimer;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initSkillsGraph(container, data);
    }, 250);
}
