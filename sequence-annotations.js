function draw(data) {
    var lineLength = 50;
    var numberOfLines = Math.max.apply(null, data.map(function (seq) {
            return seq.sequence.length;
        })) / lineLength;
    for (var i = 0; i < numberOfLines; i++) {
        drawLine(data, i, lineLength);
    }
};
function drawLine(data, lineIndex, lineLength) {
    "use strict";
    var from = lineIndex * lineLength;
    var to = lineIndex * lineLength + lineLength;
    var rootGroup = svg.append("svg").attr("width", "960").attr("height", "200");
    var titleIndent = {x:120, y:20};

    rootGroup.selectAll("g.title")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "title")
        .attr("text-anchor", "end")
        .attr("transform", function (d, i) {
            return "translate(" + 0 + "," + (titleIndent.y + i * 50 )+ ")";
        })
        .each(function (seq) {

            d3.select(this).append("text")
                .attr("class", "title")
                .text(seq.title)
                .attr("x", titleIndent.x)
                .attr("y", 15)
                .call(make_editable, "title");

            d3.select(this).append("text")
                .attr("class", "subtitle")
                .text("Line " + (lineIndex+1))
                .attr("x", titleIndent.x)
                .attr("y", 30)
                .style("fill", "#999");
        });
    ;

    // rootGroup.selectAll("g.title").each(function (seq, i) {
    //     d3.select(this).selectAll("text.subtitle")
    //         .data([i])
    //         .enter().append("text")
    //         .text(function (i) {
    //             return "Line " + (i+1);
    //         })
    //         .attr("class", "subtitle")
    //         .attr("x", titleIndent.x)
    //         .attr("y", 30);
    // });

    var lineGroup = rootGroup;

    lineGroup.selectAll("g.rna-seq")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "rna-seq")
        .attr("transform", function (d, i) {
            return "translate(" + titleIndent.x + "," + (titleIndent.y + i * 50 )+ ")";
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
            .attr("y", 30)
            .attr("font-family", "monospace")
            .attr("font-size", "30");

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
        console.log("make_editable", arguments);

        this
            .on("mouseover", function() {
                d3.select(this).style("fill", "red");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", null);
            })
            .on("click", function(d) {
                var p = this.parentNode;
                console.log(this, arguments);

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
                        console.log("blur", this, arguments);

                        var txt = inp.node().value;

                        d[field] = txt;
                        el
                            .text(function(d) { return d[field]; });

                        // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                        p_el.select("foreignObject").remove();
                    })
                    .on("keypress", function() {
                        console.log("keypress", this, arguments);

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
    function drawAnnotation(containingSequenceGroup, startCharIndex, endCharIndex) {
        var firstSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq").node().getBBox();
        var lastSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq")[0].pop().getBBox();
        var letterRectWidth = firstSequenceFrame.width / (to-from);

        function drawSurroundingFrame() {
            var annotationVMargin = 4;

            var sequenceNum = data.length - 1;

            containingSequenceGroup.append('rect')
                .attr("class", "annotation-rect")
                .attr("x", titleIndent.x + firstSequenceFrame.x + startCharIndex * letterRectWidth)
                .attr("width", letterRectWidth * (endCharIndex - startCharIndex))
                .attr("y", titleIndent.y + firstSequenceFrame.y - annotationVMargin)
                .attr("height", lastSequenceFrame.y + lastSequenceFrame.height - firstSequenceFrame.y + 50 * sequenceNum + 2 * annotationVMargin)
                .attr("fill-opacity", "0.0")
                .attr("stroke-width", "3")
                .attr("stroke", "#000");
        };

        function drawLabel() {
            var labelVOffset = 10;
            var frameX = firstSequenceFrame.x + startCharIndex * letterRectWidth;
            var frameY = firstSequenceFrame.y - labelVOffset;
            containingSequenceGroup.append("g")
                .attr("transform", "translate(" + (titleIndent.x + frameX) + "," + (titleIndent.y + frameY) + ")")
                .append("text")
                .attr("class", "annotation-label")
                .text(labelCounter);
            labelCounter++;
        };
        drawSurroundingFrame();
        drawLabel();

    };

    d3.selectAll("body")
        .on("keydown", function (d) {
            if (event.keyCode == 13 &&
                (d3.selectAll("text.rna-seq")[0].includes(window.getSelection().anchorNode.parentElement))) {
                var anchorOffset = window.getSelection().anchorOffset;
                var focusOffset = window.getSelection().focusOffset;
                var startCharIndex = Math.min(focusOffset, anchorOffset);
                var endCharIndex = Math.max(focusOffset, anchorOffset);
                var containingSequenceGroup = window.getSelection().anchorNode.parentElement.parentElement.parentElement;
                drawAnnotation(d3.select(containingSequenceGroup), startCharIndex, endCharIndex);
            }
        });
    return rootGroup;

};