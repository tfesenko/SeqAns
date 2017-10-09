var globalData;
var labelCounter = 1;


function draw(data) {
    globalData = data;
    labelCounter = globalData.annotations.length + 1;
    var numberOfLines = Math.max.apply(null, data.sequences.map(function (seq) {
            return seq.sequence.length;
        })) / lineLength;
    var currY = 0;
    var width = 0;
    const gap = 30;
    for (var i = 0; i < numberOfLines; i++) {
        const lineSvg = drawLine(data.sequences, i, lineLength, numberOfLines);
        var bbox = lineSvg.node().getBBox();
        width = Math.max(width, bbox.width + 20);
        lineSvg.attr("width", width)
            .attr("height", bbox.height + gap)
            .attr("y", currY);
        currY += bbox.height + gap;
    }
    svg.attr("width", width).attr("height", currY);
    updateAnnotations();

};

function updateAnnotations() {
    var annotationVMargin = 4;
    var letterRectWidth = d3.select(svg.selectAll("svg")[0][0]).selectAll("text.rna-seq")[0][0].getBBox().width / d3.select(svg.selectAll("svg")[0][0]).selectAll("text.rna-seq")[0][0].textContent.length;

    var sequenceNum = d3.select(svg.selectAll("svg")[0][0]).selectAll("g.rna-seq").size();

    function getSequenceLineSvg(d) {
        var lineIndex = Math.floor(d.startCharIndex / lineLength);
        return svg.selectAll("svg")[0][lineIndex];
    }

    function getStartCharIndex(d) {
        return d.startCharIndex % lineLength;
    }

    function getFrameX(d) {
        return titleIndent.x + getStartCharIndex(d) * letterRectWidth;
    }

    function getFrameY(d) {
        var sequenceLineSvg = getSequenceLineSvg(d);
        var sequenceLineSvgY = parseInt(sequenceLineSvg.getAttribute("y"));
        return sequenceLineSvgY + titleIndent.y;
    }

    svg.selectAll("rect.annotation-rect")
        .data(globalData.annotations)
        .enter()
        .append("rect")
        .attr("class", "annotation-rect")
        .attr("x", function (d) {
            return getFrameX(d);
        })
        .attr("width", function (d) {
            return letterRectWidth * d.length;
        })
        .attr("y", function (d) {
            return getFrameY(d) - annotationVMargin;
        })
        .attr("height", sequenceNum * fontSize + 2 * annotationVMargin)
        .attr("fill-opacity", "0.0")
        .attr("stroke-width", "3")
        .attr("stroke", "#000");

    var labelVOffset = 8;

    svg.selectAll("g.annotation-label")
        .data(globalData.annotations)
        .enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + getFrameX(d) + "," + (getFrameY(d) - labelVOffset) + ")";
        })
        .append("text")
        .attr("class", "annotation-label")
        .text(function (d) {
            return d.label;
        })
        .call(makeEditable, "label");

    saveContentToStorage(JSON.stringify(globalData));
}

function drawAnnotation(absoluteStartCharIndex, length, label) {
    var lineIndex = Math.floor(absoluteStartCharIndex / lineLength);
    var sequenceLineSVG = svg.selectAll("svg")[0][lineIndex];
    var newAnnotation = {label: "" + label, "startCharIndex": absoluteStartCharIndex, "length": length};
    globalData.annotations.push(newAnnotation);
    updateAnnotations();
}

function drawLine(data, lineIndex, lineLength, numberOfLines) {
    "use strict";
    var from = lineIndex * lineLength;
    var to = lineIndex * lineLength + lineLength;
    var rootGroup = svg.append("svg");


    rootGroup.selectAll("g.title")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "title")
        .attr("text-anchor", "end")
        .attr("transform", function (d, i) {
            return "translate(" + 0 + "," + (titleIndent.y + i * fontSize ) + ")";
        })
        .each(function (seq) {

            d3.select(this).append("text")
                .attr("class", "title")
                .text(seq.title)
                .attr("x", titleIndent.x - 4)
                .attr("y", 17)
                .attr("font-size", "" + titleFontSize)
                .call(makeEditable, "title");

        });
    ;

    var lineGroup = rootGroup;

    lineGroup.selectAll("g.rna-seq")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "rna-seq")
        .attr("transform", function (d, i) {
            return "translate(" + titleIndent.x + "," + (titleIndent.y + i * fontSize ) + ")";
        });

    lineGroup.selectAll("g.rna-seq").each(function (sequenceString) {
        d3.select(this).selectAll("text.rna-seq")
            .data([sequenceString])
            .enter().append("text")
            .text(function (sequenceString) {
                return sequenceString.sequence.slice(from, to);
            })
            .attr("class", "rna-seq")
            .attr("x", 0)
            .attr("y", fontSize)
            .attr("font-family", "monospace")
            .attr("font-size", "" + fontSize);

    });

    function drawLetterBoxes(currGroup, sequenceString, textBox, i) {
        d3.select(currGroup).selectAll("rect")
            .data(sequenceString)
            .enter().insert("rect", "text") // add the new Rectangles before text element
            .attr('fill', function (ch) {
                var color = peptideAndNucleotideColors[ch];
                if (!color) {
                    color = peptideAndNucleotideColors.default;
                }
                return color;
            })
            .attr("x", function (d2, i2) {
                return textBox.x + i2 * textBox.width / sequenceString.length;
            })
            .attr("width", textBox.width / sequenceString.length)
            .attr("y", textBox.y)
            .attr("height", textBox.height);
    };

    lineGroup.selectAll("g.rna-seq").each(function (sequenceString, i) {
        var currGroup = this;
        d3.select(this).select("text").each(function () {
            var textBox = this.getBBox();
            drawLetterBoxes(currGroup, sequenceString.sequence.slice(from, to), textBox, i);
        });
    });
    d3.selectAll("body")
        .on("keydown", function (d) {
            if (event.keyCode == 13 &&
                (d3.selectAll("text.rna-seq")[0].includes(window.getSelection().anchorNode.parentElement))) {
                createAnnotationForSelection();
            }
        });
    return rootGroup;

};

function createAnnotationForSelection() {
    var anchorOffset = window.getSelection().anchorOffset;
    var focusOffset = window.getSelection().focusOffset;
    var startCharIndex = Math.min(focusOffset, anchorOffset);
    var length = Math.abs(focusOffset - anchorOffset);
    var sequenceLineSVG = window.getSelection().anchorNode.parentElement.parentElement.parentElement;
    var lineIndex = d3.select("svg").selectAll("svg")[0].indexOf(sequenceLineSVG);
    drawAnnotation(lineIndex * lineLength + startCharIndex, length, "Group" + labelCounter);
    labelCounter++;
};

function makeEditable(d, field) {
    this
        .on("mouseover", function () {
            d3.select(this).style("fill", "#144023");
        })
        .on("mouseout", function () {
            d3.select(this).style("fill", null);
        })
        .on("click", function (d) {
            var labelGroup = this.parentNode;
            var bbox = this.getBBox();
            var parentBBox = labelGroup.getBBox();

            bbox.x -= parentBBox.x;
            bbox.y -= parentBBox.y;

            var textElement = d3.select(this);
            var parentElement = d3.select(labelGroup);

            var foreignObject = parentElement.append("foreignObject");

            var onFocusLost = function() {
                d[field] = input.text();
                textElement.text(input.text());
                if (field == "title") {
                  // Update all Title labels because the same label can be used in several rows
                  d3.selectAll("text.title").text(function (d) {
                      return d["title"];
                  });
                }
                saveContentToStorage(JSON.stringify(globalData));

                foreignObject.selectAll("*").remove();
                foreignObject.remove();
            };

            var input = foreignObject
                .attr("x", 0) // bbox.x
                .attr("y", 0) //  bbox.y - 15
                .attr("width", bbox.width)
                .append("xhtml")
                .attr("width", "auto")
                .attr("style", "display: inline-block")
                .append("div")
                .text(d[field])
                .attr("contentEditable", true)
                .attr("style", "white-space: nowrap; background-color: #DCDCDC; font-size: " + titleFontSize + "pt;")
                .on("mouseout", function () {
                    onFocusLost();
                })
                .on("keypress", function () {
                    // IE fix
                    if (!d3.event)
                        d3.event = window.event;

                    var e = d3.event;
                    if (e.keyCode == 13) {
                        if (typeof(e.cancelBubble) !== 'undefined') // IE
                            e.cancelBubble = true;
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        onFocusLost();
                    }
                });
                //input[0][0] is DOM element for d3.js input element
                input[0][0].focus();
        });
};
