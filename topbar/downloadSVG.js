function downloadSVG(fileName) {

    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }

    const svgAsText = getSVGAsText(d3.selectAll("svg")[0]);
    const blob = new Blob([svgAsText], {type: "image/svg+xml"});
    saveAs(blob, fileName);
}

function getSVGAsText(svgNodes) {
    const gap = 30;
    let currY = 0;

    const svgBodyAsText = svgNodes.map(function (svgNode, i) {
        const svgLineAsText =
            `<!--LINE ${i + 1} -->
            <svg y='${currY + gap}'>
                ${svgNode.innerHTML}
            </svg>
             `;
        currY += parseInt(svgNode.getAttribute("height")) + gap;
        return svgLineAsText;
    }).join("\n");

    return
        `
    <svg xmlns="http://www.w3.org/2000/svg">
        ${svgBodyAsText}
    </svg>`;
}