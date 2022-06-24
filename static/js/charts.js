function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("static/data/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("http://localhost:8000/static/data/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Returns the first 10 elements of an array, mapped with a given function, in reverse order.
function topTenReversed(arr, mapFunction) {
  return(arr.slice(0,10).map(mapFunction).reverse());
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("static/data/samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    let sampleArray = data.samples;
    let metadataArray = data.metadata;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    let sampleFilter = sampleArray.filter(entry => entry.id === sample);
    let metadataSampleFilter = metadataArray.filter(entry => entry.id.toString() === sample);
    //  5. Create a variable that holds the first sample in the array.
    let firstSample = sampleFilter[0];
    let firstMetaSample = metadataSampleFilter[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    let otuIds = firstSample.otu_ids;
    let otuLabels = firstSample.otu_labels;
    let sampleValues = firstSample.sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    
    var yticks = topTenReversed(otuIds, x => "OTU " + x.toString());
    var xvals = topTenReversed(sampleValues, x => x);
    var hovers = topTenReversed(otuLabels, x => x);
    var hoversSplit = hovers.map(function(x){
      let arr = x.split(`;`)
      return (arr[arr.length - 1]);
    });

    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xvals,
      y: yticks,
      hovertemplate: `<b>Sample Value</b>: %{x}` +
                     `<br><b>Most Specific Identifier</b>: %{text}` +
                     `<br><b>Wikipedia Link</b>: https://en.wikipedia.org/wiki/%{text}`,
      text: hoversSplit,
      type: "bar",
      orientation: 'h'
    }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "<b>Top 10 Bacterial Cultures</b>" +
              "<br>Click on a Bar to Open<br>Wikipedia for that Bacteria",
      hovermode: "closest"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
    
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: "markers",
      marker: {
        size: sampleValues,
        color: otuIds,
        colorscale: "Earth"
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures per Sample",
      xaxis: {
        title: "OTU ID"
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // 3. Create a variable that holds the washing frequency.
    let metaWfreqs = metadataArray.map(x => x.wfreq);
    let maxWfreq = Math.max(...metaWfreqs) + 1.0;
    let dTicks = maxWfreq / 5;
    let avgWfreq = metaWfreqs.reduce((a,b) => a + b, 0) / metaWfreqs.length;
    avgWfreq = Math.round( avgWfreq * 100 + Number.EPSILON ) / 100;

    let washingFrequency = parseFloat(firstMetaSample.wfreq);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: { x: [0, 1], y: [0, 1] },
      value: washingFrequency,
      title: {  text: `<b>Belly Button Washing Frequency</b><br>Scrubs per Week` },
      type: "indicator",
      mode: "gauge+number+delta",
      delta: { reference: avgWfreq,
               decreasing: { color: "red" },
               increasing: { color: "green" } },
      gauge: {
        axis: { range: [0.0, maxWfreq],
                dtick: dTicks,
                tickwidth: 1.5,
                tickcolor: "black" },
        bar: { color: "black" },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "black",
        steps: [
          { range: [0, dTicks * 1], color: "red" },
          { range: [dTicks * 1, dTicks * 2], color: "orange"},
          { range: [dTicks * 2, dTicks * 3], color: "yellow"},
          { range: [dTicks * 3, dTicks * 4], color: "lightgreen"},
          { range: [dTicks * 4, maxWfreq], color: "darkgreen" }
        ],
        threshold: {
          line: { color: "darkblue", width: 4 },
          thickness: 0.75,
          value: avgWfreq
        }
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      autosize: true,
      margin: { t: 0, b: 0 }
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

    // Use *.on to attach a click-event to the Bar Chart,
    // opening the corresponding Wikipedia link in a new tab on click.
    var barPlot = document.getElementById('bar');
    barPlot.on('plotly_click', function(data){
      barText = data.points[0].text;
      URL = `https://en.wikipedia.org/wiki/${barText}`;
      window.open(URL, "_blank");
    });

  });
}