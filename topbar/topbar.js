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
                var asJson = [];
                var re = /^>([^|]+)\|.*\n([^>]+)$/gm;
                var match, i = 0;
                while (match = re.exec(fileContents)) {
                    asJson[i] = {"sequence": match[2], "title": match[1]};
                    i++;
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
