# SeqAns = Sequence Annotations: annotation your DNA, RNA, or Protein Sequences online
Annotate your sequences in five easy steps
1. Open ahttps://tfesenko.github.io/SeqAns/ 
2. Load a FASTA file
Click on File > Import FASTA file:
<a href="http://imgur.com/UBoIQ6H"><img src="http://i.imgur.com/UBoIQ6H.png" title="file import FASTA" /></a>
The FASTA file should contain all your sequences, an example of such file is [here]()
3. (Optional) Change the name of sequences
SeqAns uses the string betweeen ">" and "|" as from NAFTA file sequence name, by you can change it by clicking on the sequence title and editing it.
4. Annotate the sequences
Select letters that you want to annotate in a sequence and press "Enter". (You can also use the Edit>Annotation action in the navbar). All other sequences will be selected.
5. Save it as an SVG file
Save as SVG file by clicking on File>Save as SVG. The file will be saved in the browser's donwload folder as "sequence.svg"
(Save as PNG is on the way)

## SeqAns runs in your browser, no calls to the server
Sequences are rendered in the browser using a JavaScript library called [d3.js (v3)](https://github.com/d3/d3/releases/v3.0.0).
SeqAns uses [FileSaver.js](https://github.com/eligrey/FileSaver.js/) to save to file and [NtSeq.js](https://github.com/keithwhor/NtSeq) to parse FASTA files.
SeqAns also uses local storage to preserve editings.

## Running from sources
You can also run SeqAns directly from sources, just open the root index.html file in the browser of your choice, no server needed.

# License
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
