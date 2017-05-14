function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

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
