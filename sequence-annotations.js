var lineLength = 50;
var titleIndent = {x:120, y:20};
var fontSize = 16;
var titleFontSize = 12;

function draw(data) {
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
};

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
            return "translate(" + 0 + "," + (titleIndent.y + i * fontSize )+ ")";
        })
        .each(function (seq) {

            d3.select(this).append("text")
                .attr("class", "title")
                .text(seq.title)
                .attr("x", titleIndent.x - 4)
                .attr("y", 17)
                .attr("font-size", "" + titleFontSize)
                .call(make_editable, "title");

            // d3.select(this).append("text")
            //     .attr("class", "subtitle")
            //     .text("Line " + (lineIndex+1))
            //     .attr("x", titleIndent.x)
            //     .attr("y", fontSize+2)
            //     .style("fill", "#999");
        });
    ;

    var lineGroup = rootGroup;

    lineGroup.selectAll("g.rna-seq")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "rna-seq")
        .attr("transform", function (d, i) {
            return "translate(" + titleIndent.x + "," + (titleIndent.y + i * fontSize )+ ")";
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
                switch (ch) {
                    case 'G':
                        return '#DDE2DE';
                    case 'U', 'T':
                        return '#F0C7D7';
                    case 'A':
                        return '#B7EAED';
                    case 'C':
                        return '#84BBBE';
                    default:
                        return 'white';
                }
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

    // From http://bl.ocks.org/GerHobbelt/2653660
    function make_editable(d, field)
    {
       // console.log("make_editable", arguments);

        this
            .on("mouseover", function() {
                d3.select(this).style("fill", "red");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", null);
            })
            .on("click", function(d) {
                var p = this.parentNode;

                // inject a HTML form to edit the content here...

                // bug in the getBBox logic here, but don't know what I've done wrong here;
                // anyhow, the coordinates are completely off & wrong. :-((
                var xy = this.getBBox();
                var p_xy = p.getBBox();

                xy.x -= p_xy.x;
                xy.y -= p_xy.y;

                var el = d3.select(this);
                var p_el = d3.select(p);

                var frm = p_el.append("foreignObject");

                var inp = frm
                    .attr("x", xy.x)
                    .attr("y", xy.y)
                    .attr("width", 300)
                    .attr("height", 25)
                    .append("xhtml:form")
                    .append("input")
                    .attr("value", function() {
                        // nasty spot to place this call, but here we are sure that the <input> tag is available
                        // and is handily pointed at by 'this':
                        this.focus();

                        return d[field];
                    })
                    .attr("style", "width: 294px;")
                    // make the form go away when you jump out (form looses focus) or hit ENTER:
                    .on("blur", function() {
                        // console.log("blur", this, arguments);

                        var txt = inp.node().value;

                        d[field] = txt;
                        el
                            .text(function(d) { return d[field]; });

                        // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                        p_el.select("foreignObject").remove();
                    })
                    .on("keypress", function() {
                        // console.log("keypress", this, arguments);

                        // IE fix
                        if (!d3.event)
                            d3.event = window.event;

                        var e = d3.event;
                        if (e.keyCode == 13)
                        {
                            if (typeof(e.cancelBubble) !== 'undefined') // IE
                                e.cancelBubble = true;
                            if (e.stopPropagation)
                                e.stopPropagation();
                            e.preventDefault();

                            var txt = inp.node().value;

                            d[field] = txt;
                            el
                                .text(function(d) { return d[field]; });

                            // Update all Title labels
                            d3.selectAll("text.title").text(function(d) { return d[field]; });
                            // odd. Should work in Safari, but the debugger crashes on this instead.
                            // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                            p_el.select("foreignObject").remove();
                        }
                    });
            });
    };

    var labelCounter = 1;
    d3.selectAll("body")
        .on("keydown", function (d) {
            if (event.keyCode == 13 &&
                (d3.selectAll("text.rna-seq")[0].includes(window.getSelection().anchorNode.parentElement))) {
                var anchorOffset = window.getSelection().anchorOffset;
                var focusOffset = window.getSelection().focusOffset;
                var startCharIndex = Math.min(focusOffset, anchorOffset);
                var length = Math.abs(focusOffset - anchorOffset);
                var sequenceLineSVG = window.getSelection().anchorNode.parentElement.parentElement.parentElement;
              //  var i = d3.select("svg").selectAll("svg")[0].indexOf(sequenceLineSVG);
                drawAnnotationInSVG(d3.select(sequenceLineSVG), startCharIndex, length, "" + labelCounter);
                labelCounter++;
            }
        });
    return rootGroup;

};

function drawAnnotation(startCharIndex, length, label) {

}

function drawAnnotationInSVG(sequenceLineSVG, startCharIndex, length, label) {
    var firstSequence = sequenceLineSVG.selectAll("g.rna-seq").node();
    var firstSequenceFrame = firstSequence.getBBox();
    var lastSequenceFrame = sequenceLineSVG.selectAll("g.rna-seq")[0].pop().getBBox();
    var letterRectWidth = firstSequenceFrame.width / firstSequence.textContent.length;
    var sequenceNum = sequenceLineSVG.selectAll("g.rna-seq").size();
    var sequenceLineSvgY = parseInt(sequenceLineSVG.node().getAttribute("y"));
    var frameX = titleIndent.x + startCharIndex * letterRectWidth;
    var frameY = sequenceLineSvgY + titleIndent.y;

    function drawSurroundingFrame() {
        var annotationVMargin = 4;

        svg.append('rect')
            .attr("class", "annotation-rect")
            .attr("x", frameX)
            .attr("width", letterRectWidth * length)
            .attr("y", frameY - annotationVMargin)
            .attr("height", sequenceNum * fontSize + 2 * annotationVMargin)
            .attr("fill-opacity", "0.0")
            .attr("stroke-width", "3")
            .attr("stroke", "#000");
    };

    function drawLabel() {
        var labelVOffset = 8;
        svg.append("g")
            .attr("transform", "translate(" + frameX + "," + (frameY - labelVOffset) + ")")
            .append("text")
            .attr("class", "annotation-label")
            .text(label);
    };
    drawSurroundingFrame();
    drawLabel();

};