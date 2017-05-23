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
                    // TODO parse sequence labels
                    asJson[i] = {"sequence": seq, "title": "Sequence " + i + " of " + fastaSegments.length};
                    //    debugger;
                }
                draw(asJson);
            };
        })(f);

        reader.readAsText(f);
    }
}
