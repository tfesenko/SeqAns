function draw(data) {
    var lineLength = 50;
    var numberOfLines = Math.max.apply(null, data.map(function (seq) {
            return seq.sequence.length;
        })) / lineLength;
    for (var i = 0; i < numberOfLines; i++) {
        var dataForLine = data.map(function (seq) {
            return {title: seq.title, sequence: seq.sequence.slice(i * lineLength, i * lineLength + lineLength)};
        });
        drawLine(dataForLine);
    }
};
function drawLine(data) {
    "use strict";
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
        });

    rootGroup.selectAll("g.title").each(function (seq) {
        d3.select(this).selectAll("text.title")
            .data([seq])
            .enter().append("text")
            .text(function (seq) {
                return seq.title;
            })
            .attr("class", "title")
            .attr("x", titleIndent.x)
            .attr("y", 15);
     });

    rootGroup.selectAll("g.title").each(function (seq, i) {
        d3.select(this).selectAll("text.subtitle")
            .data([i])
            .enter().append("text")
            .text(function (i) {
                return "Line " + (i+1);
            })
            .attr("class", "subtitle")
            .attr("x", titleIndent.x)
            .attr("y", 30);
        //.call(make_editable, "subtitle");
    });

    // title.append("text")
    //     .attr("class", "subtitle")
    //     .attr("x", ''+titleIndent.x)
    //     .attr("y", "20")
    //     .attr("dy", "1em")
    //     .text(function(d) { return "Guilhem d.subtitle"; });

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
                return sequenceString.sequence;
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
            drawLetterBoxes(currGroup, sequenceString.sequence, textBox, i);
        });
    });


    var labelCounter = 1;

    function drawAnnotation(containingSequenceGroup, startCharIndex, endCharIndex) {
        var firstSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq").node().getBBox();
        var lastSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq")[0].pop().getBBox();
        var letterRectWidth = firstSequenceFrame.width / containingSequenceGroup.select("text.rna-seq").data()[0].sequence.length;

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