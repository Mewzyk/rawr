/*
SVG/Group/Margin Declarations
*/
var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*
@parseTime: d3 object for parsing time
Our time format is very simple.
*/
var parseTime = d3.timeParse("%Y");
/*
@xScale, yScale, rgbScale: scales for the xAxis, yAxis, and colors respectively.
xScale is a time scale
yScale is a linear scale
rgbScale is an ordinal scale with cardinal values of different colors
*/
var xScale = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]),
    rgbScale = d3.scaleOrdinal(d3.schemeCategory10);

/*
@line: establishes the basic rules for the creation of our line. 
finds the x coordinate from the scale and the y coordinate from the y function.
interpolated by a curve.
*/
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(d.Year); })
    .y(function(d) { return yScale(d.energy); });

/*
Creates global variable placeholders.
citiesMaster ideally should be an immutable version of cities.
yMin/yMax are used to compute the changing yDomain.
*/
var cities,
	citiesMaster,
	yMin,
	yMax,
	exCities;
/*
CSV file begins to be parsed.
Uses the accessor function type to help distribute data.
Type is below this d3.csv block.
*/
d3.csv("Average.csv", type, function(error, data){
	exCities = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {return {Year: d.Year, energy: d[id]};
                })
        };
    });
	
})

d3.csv("EPC_2000_2010_new.csv", type, function(error, data) {
    if (error) throw error;
    /*
    Essentially uses javascripts Map function over and over again to create a finished
    */
    cities = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {return {Year: d.Year, energy: d[id]};
                })
        };
    });
	
	/*
	These four calls create the first graph.
	*/
    citiesMaster = cities;
	initScales(data);
	initAxis();
	updateGraph();
});


/*
Accessor function
IN: Object D with all attributes as strings
OUT: Object D with all attribues as their proper datatypes.
*/
function type(d, _, columns) {
  d.Year = parseTime(d.Year);
  for (var i = 1, n = columns.length, c; i < n; ++i){
      d[c = columns[i]] = +d[c];
  }
  return d;
}

/*
Draws a graph from the data cities
Capable of drawing any graph from teh data in cities.
*/
function updateGraph(){
	/*
	Check for updates in Y domain
	If there are no updates, these two chunks of code will not have any visual effect.
	*/
	updateYScale();
	g.select(".axis--y")
    	.transition()
        .duration(1000)
        .call(d3.axisLeft(yScale));
 
	g.select(".grid-y")
		.transition()
		.duration(1000)
		.call(d3.axisLeft(yScale).ticks(6)
            .tickSize(-width, 0, 0)
            .tickFormat(""));
	
	/*
	Creates a group for each city that will contain the path and text of each city.
	This code is particularly weird, but it is a simple solution to reset the board everytime we draw to the canvas
	*/
	
	var exCity = g.selectAll(".exCity")
		.data([])
		.exit().remove();
	
	exCity = g.selectAll(".exCity")
    	.data(exCities)
    	.enter().append("g")
      	.attr("class", "exCity");
	
	var city = g.selectAll(".city")
		.data([])
		.exit().remove();
	
	city = g.selectAll(".city")
    	.data(cities)
    	.enter().append("g")
      	.attr("class", "city");

	/*
	Creates an svg path for each city.
	Each path's list of movements is defined by line(d.values)
	This block only sets the basic characteristics of each path (color, values)
	*/
	city.append("path")
    	.attr("class", function(d){ return "line " + d.id + "";})
    	.attr("d", function(d) { return line(d.values); })
    	.style("stroke", function(d) { return rgbScale(d.id); });
	
	exCity.append("path")
    	.attr("class", function(d){ return "line " + d.id + "";})
    	.attr("d", function(d) { return line(d.values); })
    	.style("stroke", function(d) { return rgbScale(d.id); });
	
	/*
	Appends text to to the end of each group.
	Initially the opacity is set to 0.
	It fades in over two seconds
	*/
	city.append("text")
    	.attr("class", "barTitleText")
      	.datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      	.attr("transform", function(d) { return "translate(" + xScale(d.value.Year) + "," + yScale(d.value.energy) + ")"; })
      	.attr("x", 3)
      	.attr("dy", "0.35em")
		.style("font", "10px sans-serif")
      	.style("opacity", "0")
      	.text(function(d) { return d.id; });
	
	exCity.append("text")
    	.attr("class", "exText")
      	.datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      	.attr("transform", function(d) { return "translate(" + xScale(d.value.Year) + "," + yScale(d.value.energy) + ")"; })
      	.attr("x", 3)
      	.attr("dy", "0.35em")
		.style("font", "10px sans-serif")
      	.style("opacity", "0")
      	.text(function(d) { return "E [" + d.id + "]"; });
	
	/*
	These two blocks of code draw the path to the screen.
	Stroke-dasharray speccifies the length of dashes
	Stroke-dashoffset specifies the dash distance
	^ Both of these are configured for no dashes.
	*/
	path = city.select("path");
	var totalLength = path.node().getTotalLength();
	totalLength *= 1.01;
	
	exPath = exCity.select("path");
	var exLength = path.node().getTotalLength();
	exLength *= 1.01;
	
	/*
	Draws the line to the screen
	At the end of the transition the barTitleText is given opacity 1
	At the end of the transition each line is given additional mousover, mousout, and click properties
	*/
	exPath.attr("stroke-dasharray", width / 50 + " " + width / 50)
    	.attr("stroke-dashoffset", 5)
		.attr("opacity", 0);
	
  	path.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
      	.transition()
		.ease(d3.easeLinear)
        .duration(2000)
        .attr("stroke-dashoffset", 0)
        .on("end", function(){
            city.selectAll("text.barTitleText").transition().style("opacity", "1")
			
			/*
			Adds a mouseover function to each path
			on mouseover:
				enlarge text
				display E[X]
			*/
			path.on("mouseover", function(){ 
				d3.select(this).style("stroke-width", "4.5px");
				tarId = d3.select(this).datum().id;
				
				d3.selectAll(".exCity").select("text")
					.style("opacity", function(d){
					if(d.id === tarId){
						return 1;
					}
					else{
						return 0;
					}
				
				})	
				
				d3.selectAll(".exCity").select("path")
					.attr("opacity", function(d){
					if(d.id === tarId){
						return 0.6;
					}
					else{
						return 0;
					}
					});
				});
			
			path.on("mouseout", function(){ 
				d3.select(this).transition().style("stroke-width", "2.7px");
				d3.selectAll(".exCity").select("path").transition().attr("opacity", 0);
				d3.selectAll(".exCity").select("text").transition().style("opacity", 0);
				});
				
			path.on("click", isolate);});
}

/*
Toggle Function:
On alternating clicks will either set the dataset to-
1). A dataset containing all the data
2). A dataset containing only the data of the element clicked on.
*/
function isolate(){
	if (cities.length != 1){
		cities = [];		
		cities.push(d3.select(this).datum());
		updateGraph(cities);
	}
	else {
		cities = citiesMaster;
		updateGraph(cities);
	}
}

/*
Finds the current Y domain from the dataset cities
*/
function updateYScale(){
	yMin = d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.energy; }); });
	yMax = d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.energy; }); });
	yScale.domain([yMin,yMax]);
}

/*
Initilizes all three scales with the full data from cities.
*/
function initScales(data){
	updateYScale();
	rgbScale.domain(cities.map(function(c) { return c.id; }));
    xScale.domain(d3.extent(data, function(d) { return d.Year; }));
}

/*
Initilizes the X/Y axis and gridlines. 
*/
function initAxis() {
	g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));
	
	
	g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale))
      .append("text")
	  .text("Millon BTUs Per Person")
      .attr("transform", "translate("+ (-50) +","+(height/2 - 60)+")rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000");
	
	
	g.append("g")         
        .attr("class", "grid grid-x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(10)
            .tickSize(-width, 0, 0)
            .tickFormat(""));

    g.append("g")         
        .attr("class", "grid grid-y")
		.transition()
        .call(d3.axisLeft(yScale).ticks(6)
            .tickSize(-width, 0, 0)
            .tickFormat(""));
}