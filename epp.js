/*code sources: 1. https://bl.ocks.org/mbostock/5562380 for color mapping
                2. https://stackoverflow.com/questions/54947126/geojson-map-with-d3-only-rendering-a-single-path-in-a-feature-collection


/*jslint browser: true*/
/*global d3*/



//Define the width and height variables


var w = 600;
var h = 600;


 /*var projection = d3.geoMercator()
        .scale(10000)
        .translate([w / 2 + 20700 , h/2 + 9400])
 
 

var path = d3.geoPath()
  .projection(projection); */



var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h); 



  var div = d3.select("body")
     .append("div")	
     .attr("class", "tooltip")				
     .style("opacity", 0);



var color = d3.scaleThreshold()
    .domain([1, 2, 3, 4, 10, 20, 30]) //I used values for the domain based on the population density values of all the regions
    .range(d3.schemeGreens[8]); //Used a greenscale for my visualization as the range

//create the domain and range values for the legend
var x = d3.scaleSqrt()
    .domain([1, 40]) //legend goes from values 1600 to 21000
    .rangeRound([440, 950]);


//append the legend for the map to the svg element
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-435,40)");


//We create a a color scheme for the legend which will correspond to the map's color scheme
g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

//This appends the text related to the label - Population per square kilometer
g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square kilometer");

//we create the axis for the legend 
g.call(d3.axisBottom(x)
    .tickSize(13) //assign tickSize to 13
    .tickValues(color.domain())) //apply the colors to the legend using color.domain()
  .select(".domain")
    .remove();


 

    d3.csv("seattle.csv").then(function(data){
        
        
       
        

        //Load in GeoJSON data - Bangladesh.json
        d3.json("seattle.json").then(function(json) {

       
           
              //assign variable features to the json.features that contains all the information about the regions
            var features = json.features;
            
            
            // Create a new projection function
            const projection = d3.geoAlbers()


            // Adjust the projection to fit the width and height of the SVG element
            projection.fitExtent([ [ 0, 0 ], [ w, h ] ], json)

            // Create a GeoPath function from the projection
            const path = d3.geoPath().projection(projection)
            
            
            
             //loop through 
             for (var i = 0; i < data.length; i++) {

               
                 
                 //newcode
                  var dataTract = data[i].Name;
                  var dataPopulation = parseFloat(data[i].Population);
                  var dataUR = parseFloat(data[i].Unemployment_rate);
                  var dataMHI = parseFloat(data[i].Medium_Household_Income);
                  var dataPL = parseFloat(data[i].Poverty_level);
                 //newcode
                 
                 console.log(data[i].Name);
                 

               

                //Find the population density for each region by dividing population by area
                var dataValue = parseFloat(data[i].Poverty_level);
                 
                 
                //Find the matching GeoJson value in Bangladesh,json file
                for (var j = 0; j < json.features.length; j++) {

                    //Look for the region name that is under properties.NAME_1 in the json file
                    var jsonState = json.features[j].properties.name;

                    //Compare regions to find a match
                    if (dataTract == jsonState) {

                        //Copy the data value into the JSON
                        json.features[j].properties.value = dataValue;
                        json.features[j].properties.pop = dataPopulation;
                        json.features[j].properties.UR = dataUR;
                        json.features[j].properties.MHI = dataMHI;
                        json.features[j].properties.PL = dataPL;
                        
                        //Stop looking through the JSON
                        break;

                    }
                }		
            }
            
            
            
            

            //for each feature, we filter for geometry type of MultiPolygon and map it
            
            
        svg.selectAll("path")
               .data(features) //data takes in features
               .enter()
               .append("path")
               .attr("d", path)
                .attr("stroke", "black")  //creates black outline for all the regions on the map
                .attr("stroke-width", 0.5)
                .style("fill", function(d) {
                    var value = d.properties.value; //assign var value to d.properties.value
                    if (value) {
                        return color(value);    //assign color to the region
                    } 
               })
            
            
            
            .on("mouseover", function(d) { 
            div.transition()		
                .duration(200)		
                .style("opacity", .9);	
            
      
            
            //This chunk of the code creates a table for tooltip
            //I used test-align to align the different fields to either be aligned to left, right or center 
            div.html( 
                
                //Create a table
                "<table>" 
                
                //This row is for the country name
                
                + "<tr>" + "<td colspan = 3 style = 'text-align:center'>" + d.properties.name + "</td>" + " </tr>" 
                
                
                //This row is to display the population of the country
                 
                + "<tr>" + "<td style = 'text-align:left'>" + 'Population' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.pop + "</td>"
                
                
                + "</tr>" 
                
                //This row helps display the GDP
                
                 + "<tr>" + "<td style = 'text-align:left'>" + 'Unemployment rate' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.UR + "%" + "</td>"
                
                
                + "</tr>" 
                
                
                //This row helps display the EPC
                + "<tr>" + "<td style = 'text-align:left'>" + 'Medium_Household_Income' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" +  d.properties.MHI + " dollars " + "</td>"
                
                
                + "</tr>" 
                
                
                
                //This row helps display the total
                 + "<tr>" + "<td style = 'text-align:left'>" + 'Poverty' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.PL + "%" + "</td>"
                
                
                + "</tr>" 
                
                
        
            )
                 
                 
            //reffered to https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f/e59ab9526e02ec7827aa7420b0f02f9bcf960c7d
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })	

            

            var zoom = d3.zoom()
                  .scaleExtent([0.5, 8])
                  .on('zoom', function() {
                      svg.selectAll('path')
                       .attr('transform', d3.event.transform);
            });

            svg.call(zoom);



            
            


        });

    });









