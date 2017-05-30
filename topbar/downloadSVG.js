function downloadSVG(fileName) {

    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }

    const svgAsText = getSVGAsText(d3.select("svg")[0][0].innerHTML);
    const blob = new Blob([svgAsText], {type: "image/svg+xml"});
    saveAs(blob, fileName);
}

function getSVGAsText(svgNodeText) {
    var result =

    `
<svg xmlns="http://www.w3.org/2000/svg">
    ${svgNodeText}
</svg>
    `;
    return result;
}

function getSVGNodesAsText(svgNodes) {
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

    return getSVGAsText(svgBodyAsText);
}