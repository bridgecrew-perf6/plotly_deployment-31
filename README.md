# Bacteria and Belly Buttons

A screenshot of the main section of the page (the bubble chart is a bit cut off) can be found in [this image file](BellyButtonPageScreenshot.png).

## Deliverable 1, 2, and 3
All deliverables were completed as stated.  Any alterations to chart or page functionality are discussed in depth in **Deliverable 4**.

## Deliverable 4
A number of changes to the deliverable functionality were made, as follows:

### Jumbotron
- The jumbotron was made to only take up 6 columns instead of twelve.  Two 3-width columns were created on each side to hold some GIF formatted images.
- Bootstrapping size was adjusted from col-md-* to col-xs-*, so that the mobile page doesnt have the images and jumbotron text stacking on top of each other.
- Two GIF images were inserted using CSS styling to make sure they stay within their containers.
```
style='height: 100%; width: 100%; object-fit: contain'
```

### Data "Mining"
A few pieces of data were extracted beyond simply drawing from [samples.json](samples.json):
- During Deliverable 1, rather than extract the top 10 reversed OTU IDs each time, I wrote a function, topTenReversed(...), to take an array and mapping function and return the desired results.  The map function was required, as the OTU IDs needed to be converted to strings for the ytick labels, while the other arrays did not.
- The OTU labels were split by ';' into an array of Bacterial nomenclature terms, from Kingdom towards Genus.  Not every one is the same, but the last cell of the array always contains the most specific nomenclature, and this is what was returned by the map function.  This was used for extra features in Deliverable 4.
- For the Washing Frequency values, both the maximum value (which turned out to be 9) and the average overall value were calculated for use in the Gauge Chart.

### Bar Chart
- A *hovertemplate:* was used in the trace to incorporate a better formatted hover box for the bar.  This also used only the most specific nomenclature term available, and also displayed a link to Wikipedia with that term in the page URL.
- At the end of the buildCharts(...) function, a Plotly click-event-listener was attached to the bar chart, opening the Wikipedia link for that bacteria in a new tab on a click on a particular bar.  Possible improvements here include:
- - Handling a page that doesn't exist (for example, Sample 940 and OTU 2264, with an identifier of "IncertaeSedisXI") - Wikipedia does handle that uncertainty already, so it may be less of an issue.
- - Trying to improve the quality of data collected - some pages simply link to the Wikipedia page for [Bacteria](https://en.wikipedia.org/wiki/Bacteria), as that is the most specific identifier in the samples data.

### Gauge Chart
- Rather than defaulting the maximum value to 10, the maximum value for the Gauge is set to maxWfreqs + 1 (which turns out to be 10 in this dataset's case).  Likewise, the tick values are calculated in increments of 1/5 the maximum value.  This allows the Gauge to theoretically adjust itself if more data, with Belly Button Washing Frequencies > 9, were to exist in a newer dataset.
- A threshold for the "average" hand-washing value (approx. 2.55) was added, so that you can see if a particular sample is above or below the mean value (this could easily be changed to median, if desired).
- A "delta:" was added for the same "average" value, showing how much more or less the sample's washing value is (with green and red coloring for above and below).
