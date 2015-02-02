var OnebipCharts = {};

OnebipCharts.barChart = function(options, values){
    c3.generate({
        bindto: options.div,
        data: {
            columns:[values],
            type: 'bar',
            colors: {
                weight: "#6ab153"
            },
            types: {
                weight: "area"
            }
       }
   });
}
OnebipCharts.lineChart = function(options, values){
    c3.generate({
        size: {
            height: 700,
            width: 1500
        },
        bindto: options.div,
        data: {
            columns:values,
            labels: true,
        },
        axis: {
            x: {
                label: {
                    text: options.x.label,
                    position: 'outer-center'
                }
            },
            y: {
                label: {
                    text: options.y.label,
                    position: 'outer-middle'
                },
                max: options.y.max,
                min: options.y.min,
                padding: {top: 0, bottom: 0}
            }
        }
    });
}

OnebipCharts.TimeseriesChart = function(options, values){
  var chart = c3.generate({
      size: {
          height: 700,
          width: 1500
      },
      bindto: options.div,
      data: {
          x: 'x',
          columns:values,
          labels: true,
          xFormat: options.xFormat
      },
      color: {
        pattern: ['blue','red','green','yellow','black']
      },
      axis: {
          x: {
              label: {
                  text: options.x.label,
                  position: 'outer-center'
              },
              type: 'timeseries',
              tick: {
                  format: options.x.tick.format
              }
          },
          y: {
              label: {
                  text: options.y.label,
                  position: 'outer-middle'
              },
              max: options.y.max,
              min: options.y.min,
              padding: {top: 0, bottom: 0}
          }
      }
  });

  setTimeout(function(){
    debugger;

    // container of the various lines
    var chartLines = d3.select('.c3-chart-lines');
    
    var abscissaName = values[0][0];
    var abscissaLabels = values[0].slice(1);
    var abscissaPositions = abscissaLabels.map(function(x,index){return index+1;});

    for (var i = 1; i < values.length; i++) {
     
      var datasetName = values[i][0]; // 'data1'
      var dataset = values[i].slice(1); // y-values
      
      var dataLine = d3.select('.c3-line-' + datasetName);
      var lineColor = dataLine.style('stroke');
      
      var pointsgroup = d3.select('.c3-circles-' + datasetName);
      var circlesData = pointsgroup.selectAll('g circle').data();
      var firstPointData = circlesData[0]
      var lastPointData = circlesData[circlesData.length-1]

      /************** DOMAIN ********************/
      var firstDomainX = 0;
      var lastDomainX = 1000;
      var firstDomainY = firstPointData.value // first domainY <-- number!!
      var lastDomainY = lastPointData.value // last domainY <-- number!!

      /************** RANGE ********************/
      var firstRangeX = parseFloat(pointsgroup.select('g circle').attr('cx')); // first point rangeX
      var firstRangeY = parseFloat(pointsgroup.select('g circle').attr('cy')); // first point rangeY
      var lastRangeX = parseFloat(d3.select(pointsgroup.selectAll('g circle')[0].pop()).attr('cx')); // last point rangeX
      var lastRangeY = parseFloat(d3.select(pointsgroup.selectAll('g circle')[0].pop()).attr('cy')); // last point rangeY

      var scaleX = d3.scale.linear().domain([firstDomainX, lastDomainX]).range([firstRangeX, lastRangeX])        
      var scaleY = d3.scale.linear().domain([firstDomainY, lastDomainY]).range([firstRangeY, lastRangeY])        
      // GO ON WITH THE TRENDLINE
      var leastSquaresCoeff = leastSquares(abscissaPositions, dataset);
      
      // apply the results of the least squares regression
      var x1 = firstDomainX;
      var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
      var x2 = lastDomainX;
      var y2 = leastSquaresCoeff[0] * abscissaPositions.length + leastSquaresCoeff[1];
      var trendData = [x1,y1,x2,y2];//[[x1,y1,x2,y2]];
      
      var trendline = chartLines.selectAll(".trendline-"+datasetName)
      //var trendline = d3.select('svg').selectAll(".trendline-"+datasetName)
        .data([{}]);
//        .data(trendData);
        
      trendline.enter()
        .append("line")
        .attr("class", "trendline-"+datasetName)
        .attr("x1", scaleX(trendData[0]))//function(d) { 
        //  scaleX(d[0]); 
        //})
        .attr("y1", scaleY(trendData[1]))// function(d) { 
        //  scaleY(d[1]);
        //})
        .attr("x2", scaleX(trendData[2]))// function(d) { 
        //  scaleX(d[2]);
        //})
        .attr("y2", scaleY(trendData[3]))// function(d) { 
        //  scaleY(d[3]);
        //})
        .attr("stroke", lineColor)
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("5, 5"));

    }

    // returns slope, intercept and r-square of the line
    function leastSquares(xSeries, ySeries) {
      var reduceSumFunc = function(prev, cur) { return prev + cur; };
      
      var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
      var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

      var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);
      
      var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);
        
      var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);
        
      var slope = ssXY / ssXX;
      var intercept = yBar - (xBar * slope);
      var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
      
      return [slope, intercept, rSquare];
    }
  },500);
}
