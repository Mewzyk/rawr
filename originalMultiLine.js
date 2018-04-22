/*
SVG/Group/Margin Declarations
Creates a group which is moved even further down and right
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
returns an x or y axis respectively.
Used for creating grid lines
*/
function make_x_axis() {		
    return d3.axisBottom(xScale)
        .ticks(4);
}
function make_y_axis() {
    return d3.axisLeft(yScale)
        .ticks(3);
}
var cities;
var dataCities;
/*
CSV file begins to be parsed.
Uses the accessor function type to help distribute data.
*/
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
	
	dataCities = cities;
    
    var yMin = d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.energy; }); });
    var yMax = d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.energy; }); });
    
  xScale.domain(d3.extent(data, function(d) { return d.Year; }));
  yScale.domain([
    yMin,
    yMax
  ]);

  rgbScale.domain(cities.map(function(c) { return c.id; }));
  
    g.append("g")         
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
        );

    g.append("g")         
        .attr("class", "grid")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
        );
    
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));
    
  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000");

  var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", function(d){
      return "line " + d.id + " colorPath";
  })
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return rgbScale(d.id); });
  
  path = city.select("path")
  var totalLength = path.node().getTotalLength()
  totalLength *= 1.01;  
    
  city.append("text")
      .attr("class", "barTitleText")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + xScale(d.value.Year) + "," + yScale(d.value.energy) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .style("opacity", "0")
      .text(function(d) { return d.id; });
    
	

	
  path = city.select("path");
  path.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0)
        .on("end", function(){
            city.selectAll("text.barTitleText").transition().style("opacity", "1")
      .on("end", highlight);
  });
});

function highlight(){
    path.on("mouseover", function(){
        d3.select(this).style("stroke-width", "3.5px");
            })
    .on("mouseout", function(){
        d3.select(this).transition().style("stroke-width", "1.5px");
        })
    .on("click", isolate);
}

function isolate(){
	
}

function type(d, _, columns) {
  d.Year = parseTime(d.Year);
  for (var i = 1, n = columns.length, c; i < n; ++i){
      d[c = columns[i]] = +d[c];
  }
  return d;
}
