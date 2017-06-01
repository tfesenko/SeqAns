var modal = document.getElementById('import-file-window');

document.getElementById("cancel-load-file").onclick = function() {
    closeImportFileWindow();
};

document.getElementById("load-fasta-file").onclick = function() {
    handleFileSelect();
    closeImportFileWindow();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeImportFileWindow();
    }
};

function openImportFileWindow() {
    modal.style.display = "block";
};

function closeImportFileWindow() {
    modal.style.display = "none";
}

function handleFileSelect() {
    var files = document.getElementById('files').files;

    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                var fileContents = e.target.result;
                var fastaSegments = fileContents.split("\n>");
                var asJson = [];
                for (var i = 0; i < fastaSegments.length; i++) {
                    var fastaSeq = fastaSegments[i];
                    // NtSeq does not support several sequences in the same file
                    var seq = new Nt.Seq().readFASTA(">" + fastaSeq).sequence();
                    // Example >pseuAeru_MTB_1|chr.trna <...>
                    function getLabel(seq) {
                        var segments = seq.split("|");
                        return segments.length > 0 ? segments[0].substr(1) : "Sequence " + i + " of " + fastaSegments.length;
                    };
                    asJson[i] = {"sequence": seq, "title": getLabel(fastaSeq)};
                }
                clearSequenceGroup();

                draw({"sequences": asJson, "annotations": []});
            };
        })(f);

        reader.readAsText(f);
    }
}

function clearSequenceGroup() {
    svg.selectAll("*").remove();
    saveContentToStorage(`{"sequences": [], "annotations": []}`);
}
