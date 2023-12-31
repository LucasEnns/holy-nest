# A GUI to nest panels imported from CSV to sheets to be cut by a CNC using the svelte framework

Version 1.0.2 - added automatically optimized nesting.

https://lucasenns.github.io/Nest/

The beta version 2 has been in use at our shop for 2+ years and never a miss-cut panel. This has allowed people with practically no CNC experience to successfully program a simple rectangular cut. It is not a replacement for more intensive cam software, however in my experience, the nesting is as good if not better than some and certainly quicker to generate a CNC file.

Takes a CSV file as input with panel information:`csv names, quantities, width, height`

The CSV can be edited in the app or even created manually by filling out the table under the settings pane. The edited csv can be downloaded to be worked on on a later date.

The output as visualized on the right pane of the app which shows the optimized nested panels on the sheets (size is standard 49 x 97 but can be modified in the settings). The output can be downloaded as an SVG or CNC g-code file and cut directly from this file. The cnc tool settings are all editable.

NOTE: the g-code has been written for a Castally CNC. It's possible that the code would work on another

### Other features:

- the panel names can be engraved optionally
- Settings are saved in local storage so persist (except CNC offset and cutting tools) between site visits
- hover over non-panel gives a report of the % of waste
- hover over panel highlights location in list and vise versa
- CSV fields are sortable descending
- CSV fields can be incremented or decremented by up and down arrows respectively
- errors point out when a panel is too large to fit on the sheet
- all cuts are in a single CNC file with pauses for sheet changes
- by default the nesting is optimized for the least waste however it can by played with manually in cases where the generated nest seems wrong
- the 0,0 location of the CNC can be changed in the CNC offset setting

## CSV example format

### 5 header rows before first panel row ( can also import with 1 or no header row)

#### Borders not yet functional, ??? = info about project from the settings panel

```csv
Project,???,Material,???,Project Info,???
Borders,Top,Right,Bottom,Left <-does nothing
0,0,0,0,0 <-does nothing
Metric?,false <-or true
Panel,Quantity,Width,Height
1,0,0,0
```

### Test files available in the testing folder

By importing the test files and downloading the CNC file one could test the output by uploading it at https://ncviewer.com/, a really impressive and useful website.

## This software is provided "as is" and without any express or implied warranties, including, without limitation, the implied warranties of merchantability and fitness for a particular purpose.

## License

As yet undecided. I doubt that i could ever make any money from this effort, It was mostly a learning project. I am leaning towards the "buy me a beer" license.

## TO DO (probably never, it works OK for what it does)

UI/UX improvements:

- help section?
- borders thickness removal calculation
- ARIA improvements for tabbing
- CSV sorting for ascending
