function draw(data) {
    var lineLength = 50;
    var numberOfLines = Math.max.apply(null, data.map(function (seq) {
            return seq.length;
        })) / lineLength;
    for (var i = 0; i < numberOfLines; i++) {
        var dataForLine = data.map(function (seq) {
            return seq.slice(i * lineLength, i * lineLength + lineLength);
        });
        drawLine(dataForLine).attr("transform", function () {
            return "translate(0," + i * 200 + ")";
        });
    }
};
function drawLine(data) {
    "use strict";
    var rootGroup = svg.append("g");

    rootGroup.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 50 + ")";
        });

    rootGroup.selectAll("g").each(function (sequenceString) {
        d3.select(this).selectAll("text")
            .data([sequenceString])
            .enter().append("text")
            .text(function (sequenceString) {
                return sequenceString;
            })
            .attr("class", "rna-seq")
            .attr("x", 30)
            .attr("y", 100)
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

    rootGroup.selectAll("g").each(function (sequenceString, i) {
        var currGroup = this;
        d3.select(this).select("text").each(function () {
            var textBox = this.getBBox();
            drawLetterBoxes(currGroup, sequenceString, textBox, i);
        });
    });


    var labelCounter = 1;

    function drawAnnotation(containingSequenceGroup, startCharIndex, endCharIndex) {
        var firstSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq").node().getBBox();
        var lastSequenceFrame = containingSequenceGroup.selectAll("text.rna-seq")[0].pop().getBBox();
        var letterRectWidth = firstSequenceFrame.width / containingSequenceGroup.select("text.rna-seq").data()[0].length;

        function drawSurroundingFrame() {
            var annotationVMargin = 4;

            var sequenceNum = data.length - 1;

            containingSequenceGroup.append('rect')
                .attr("class", "annotation-rect")
                .attr("x", firstSequenceFrame.x + startCharIndex * letterRectWidth)
                .attr("width", letterRectWidth * (endCharIndex - startCharIndex))
                .attr("y", firstSequenceFrame.y - annotationVMargin)
                .attr("height", lastSequenceFrame.y + lastSequenceFrame.height - firstSequenceFrame.y + 50 * sequenceNum + 2 * annotationVMargin)
                .attr("fill-opacity", "0.0")
                .attr("stroke-width", "3")
                .attr("stroke", "#000");
        };

        function drawLabel() {
            var labelVOffset = 20;
            var frameX = firstSequenceFrame.x + startCharIndex * letterRectWidth;
            var frameY = firstSequenceFrame.y - labelVOffset;
            containingSequenceGroup.append("g")
                .attr("transform", "translate(" + frameX + "," + frameY + ")")
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
                (d3.selectAll("text")[0].includes(window.getSelection().anchorNode.parentElement))) {
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