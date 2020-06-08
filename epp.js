/*code sources: 1. https://bl.ocks.org/mbostock/5562380 for color mapping
                2. https://stackoverflow.com/questions/54947126/geojson-map-with-d3-only-rendering-a-single-path-in-a-feature-collection


/*jslint browser: true*/
/*global d3*/



//Define the width and height variables
var w = 1500;
var h = 600;



//These lines define the buttons
//referred to https://sureshlodha.github.io/CMPS165_Winter15_FinalProjects/SFvsLA/ for the initlaization of buttons and calling of functions for legends and color mapping


//This is the unemployment button, on click it calls the UR() funtion
document.write('<button id="Unemployment" class="UnemploymentButton" onclick="UR();">Unemployment Rate</button>');

//This is the Poverty Rate button, on click it calls the Poverty() funtion
document.write('<button id="Poverty Rate" class="PovertyButton" onclick="Poverty();">Poverty Rate</button>');

//This is the Population button, on click it calls the Population() funtion
document.write('<button id="Population" class="PopButton" onclick="Population();">Population</button>');

//This is the Income Button, on click it calls the AvgIncome() funtion
document.write('<button id="Income" class="IncomeButton" onclick="AvgIncome();">Income</button>');


//Appends the svg element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h); 


//This intializes the tooltip that we will be using later in the code
var div = d3.select("body")
 .append("div")	
 .attr("class", "tooltip")				
 .style("opacity", 0);



// referred to https://bl.ocks.org/mbostock/5562380 for color mapping


//Defines the Poverty rate color scheme
var PovertyColor = d3.scaleThreshold()
    .domain([1, 2, 3, 5, 10, 15, 21, 34, 37]) 
    .range(d3.schemeGnBu[9]); 

//Defines the Unemployment rate color scheme
var URcolor = d3.scaleThreshold()
    .domain([1, 2, 3, 4, 5, 7, 9])
    .range(d3.schemeOrRd[8]);

//Desfines the Population rate color scheme
var POPcolor = d3.scaleThreshold()
    .domain([10, 30, 40, 65, 80, 95, 100]) 
    .range(d3.schemeGreens[8]); 



//Defines the Medium Household Income color scheme
var incomeColors = d3.scaleThreshold()
    .domain([10000, 30000, 50000, 75000, 100000, 120000, 160000]) 
    .range(d3.schemePurples[8]); 



//default color scheme - population
var color = d3.scaleThreshold()
    .domain([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]) 
    .range(d3.schemeGreens[8]); 


//this is the default map legend for population
//create the domain and range values for the legend
var x = d3.scaleSqrt()
    .domain([1000, 8000]) 
    .rangeRound([440, 950]);


//append the legend for the map to the svg element
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-400,80)"); 

//Calculates the domain and range that we will use for legend/map
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

//Appends the text for the population legend
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
    .tickSize(9) //assign tickSize to 13
    .tickValues(color.domain())) 
  .select(".domain")
    .remove();



 
//Read in the csv file that contains data for seattle
d3.csv("seattle.csv").then(function(data){


    //Load in GeoJSON data - seattle.json
    d3.json("seattle.json").then(function(json) {


        //assign variable features to the json.features that contains all the information about the regions
        var features = json.features;


        // Create a new projection function by using geoAlbers
        const projection = d3.geoAlbers()


        //referred to https://www.sohamkamani.com/blog/javascript/2019-02-18-d3-geo-projections-explained/ for projections
        // Adjust the projection to fit the width and height of the SVG element
        projection.fitExtent([ [ 0, 0 ], [ w, h ] ], json)

        // Create a GeoPath function from the projection
        const path = d3.geoPath().projection(projection)



        //loop through the csv data
        for (var i = 0; i < data.length; i++) {


            //create and assign variables to each data field in the csv file
            var dataTract = data[i].Name;
            var dataPopulation = parseFloat(data[i].Population); //population
            var dataUR = parseFloat(data[i].Unemployment_rate); //Unemployment rate
            var dataMHI = parseFloat(data[i].Medium_Household_Income); //Medium household income
            var dataPL = parseFloat(data[i].Poverty_level); //Poverty Rate 

            console.log(data[i].Name);


            //Find the population density for each region by dividing population by area
            //var dataValue = parseFloat(data[i].Poverty_level);


            //Find the matching GeoJson value in seattle,json file
            for (var j = 0; j < json.features.length; j++) {

                //Look for the region name that is under properties.name in the json file
                var jsonState = json.features[j].properties.name;

                //Compare regions to find a match
                if (dataTract == jsonState) {

                    //Copy the data value into the JSON
                    //json.features[j].properties.value = dataValue;
                    //find corresponding csv values to the json file
                    json.features[j].properties.pop = dataPopulation;
                    json.features[j].properties.UR = dataUR;
                    json.features[j].properties.MHI = dataMHI;
                    json.features[j].properties.PL = dataPL;

                    break;

                }
            }		
        }




            //create the path for appending the map 
            svg.selectAll("path")
               .data(features) 
               .enter()
               .append("path")
               .attr("d", path)
                .attr("stroke", "black")  
                .attr("stroke-width", 0.5)
                .style("fill", function(d) {
                    var value = d.properties.pop; 
                    if (value) {
                    return color(value); //maps color scheme based on the population color (default)
                } else {
                    return "#ccc";
                }
             })

           

            
            //if user hovers over map, tooltip for each census tract shows up
            .on("mouseover", function(d) { 
            div.transition()		
                .duration(200)		
                .style("opacity", .9);	
            
      

            //This chunk of the code creates a table for tooltip - took from my scatterplot assignment
            div.html( 
                
                //Create a table
                "<table>" 
                
                //This row is for the census tract
                
                + "<tr>" + "<td colspan = 3 style = 'text-align:center'>" + d.properties.name + "</td>" + " </tr>" 
                
                
                //This row is to display the population of the census tract
                 
                + "<tr>" + "<td style = 'text-align:left'>" + 'Population' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.pop + "</td>"
                
                
                + "</tr>" 
                
                //This row helps display the Unemployment rate 
                
                 + "<tr>" + "<td style = 'text-align:left'>" + 'Unemployment rate' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.UR + "%" + "</td>"
                
                
                + "</tr>" 
                
                
                //This row helps display the medium Household income
                + "<tr>" + "<td style = 'text-align:left'>" + 'Medium Household Income' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + "$"+  d.properties.MHI  + "</td>"
                
                
                + "</tr>" 
                
                
                
                //This row helps display the Poverty rate
                 + "<tr>" + "<td style = 'text-align:left'>" + 'Poverty' + "</td>" +
                
                "<td style = 'text-align:center'>" + ':' + "</td>" + 
                
                 "<td style = 'text-align:right'>" + d.properties.PL + "%" + "</td>"
                
                
                + "</tr>" 
                
                
        
            )
                 
                 
            //reffered to https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f/e59ab9526e02ec7827aa7420b0f02f9bcf960c7d
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })	

            
             //tooltip disappears when cursor moves away from map
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
        
        
        
            //https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f/e59ab9526e02ec7827aa7420b0f02f9bcf960c7d
            //zoom function allows for the user to zoom in on map
            var zoom = d3.zoom()
                  .scaleExtent([0.5, 10])
                  .on('zoom', function() {
                      svg.selectAll('path')
                       .attr('transform', d3.event.transform);
            });

                //calls reset button to change back to original form
               d3.select("button")
                .on("click", resetted);

            //call zoom function
            svg.call(zoom);

            //Changes map tp original position pre-zoom
            function resetted() {
               console.log("hello")
               svg.transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity);
        }


            


        });

    });



//referred to https://sureshlodha.github.io/CMPS165_Winter15_FinalProjects/SFvsLA/ on how to set up these function upon call from button

//This function creates the legend for the household income data
function AvgIncome() {
	
    
    //create the domain and range values for the legend
    var x = d3.scaleSqrt()
        .domain([10000, 160000]) 
        .rangeRound([440, 950]);


    //append the legend for the map to the svg element
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-400,260)"); 


    g.selectAll("rect")
      .data(incomeColors.range().map(function(d) {
          d = incomeColors.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return incomeColors(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Medium Household Income");

    //we create the axis for the legend 
    g.call(d3.axisBottom(x)
        .tickSize(9) 
        .tickValues(incomeColors.domain()))
      .select(".domain")
        .remove();
    
    
    
    
    //Defines path for map color scheme for medium household income
    d3.selectAll("path")
        .style("stroke", "black")
        .transition().duration(1000)
        .style("fill", function(d) {
            if(d.properties.MHI == 0){
                value = 0;
            }else{
            var value = d.properties.MHI;
            }
            if (value) {
                return incomeColors(value);
            } else {
                return "#ccc";
            }
         });


}



//This function creates color map scheme for population 
function Population() {
	

     d3.selectAll("path")
        .style("stroke", "black")
        .transition().duration(1000)
        .style("fill", function(d) {
            if(d.properties.pop == 0){
                value = 0;
            }else{
            var value = d.properties.pop;
            }
            if (value) {
                return color(value);
            } else {
                return "#ccc";
            }
         });


}


//This function creates the legend for the poverty rate
function Poverty() {
    

    //create the domain and range values for the legend
    var x = d3.scaleSqrt()
        .domain([1, 37]) 
        .rangeRound([440, 950]);


    //append the legend for the map to the svg element
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-400,200)"); 


    g.selectAll("rect")
      .data(PovertyColor.range().map(function(d) {
          d = PovertyColor.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return PovertyColor(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Poverty Rate (percentages)");

    //we create the axis for the legend 
    g.call(d3.axisBottom(x)
        .tickSize(9) 
        .tickValues(PovertyColor.domain())) 
      .select(".domain")
        .remove();

	
    //color map scheme for poverty rate
    d3.selectAll("path")
        .style("stroke", "black")
        .transition().duration(1000)
        .style("fill", function(d) {
            if(d.properties.PL == 0){
                value = 0;
            }else{
            var value = d.properties.PL;
            }
            if (value) {
                return PovertyColor(value);
            } else {
                return "#ccc";
            }
         });

}

//this function creates the legend for the unemployment rate
function UR() {


    //create the domain and range values for the legend
    var x = d3.scaleSqrt()
        .domain([1, 9]) 
        .rangeRound([440, 950]);


    //append the legend for the map to the svg element
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-400,140)"); 


    g.selectAll("rect")
      .data(URcolor.range().map(function(d) {
          d = URcolor.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return URcolor(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Unemployment Rate (percentages)");

    //we create the axis for the legend 
    g.call(d3.axisBottom(x)
        .tickSize(9) 
        .tickValues(URcolor.domain())) 
      .select(".domain")
        .remove();




    
    //creates the color mapping scheme for the unemploymet rate data
	d3.selectAll("path")
            .style("stroke", "black")
            .transition().duration(1000)
            .style("fill", function(d) {
                if(d.properties.UR == 0){
                    value = 0;
                }else{
		        var value = d.properties.UR;
                }
		        if (value) {
		            return URcolor(value);
		        } else {
		            return "#ccc";
		        }
             });

}
