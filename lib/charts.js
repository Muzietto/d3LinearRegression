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
    var timeSeries = c3.generate({
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

    // container of the various lines
    var chartLines = d3.select('.c3-chart-lines');
    
    var abscissaName = values[0][0];
    var abscissaLabels = values[0].slice(1);
    var abscissaPositions = abscissaLabels.map(function(x,index){return index+1;});

    for (var i = 1; i < values.length; i++) {
     
      var datasetName = values[i][0]; // 'data1'
      var dataset = values[i].slice(1); // y-values
      
      // data for linear regression - NO!!!!
/*      var lrData = abscissas.map(function(currX,index){
        var result = {};
        result[abscissaName] = currX;
        result[datasetName] = dataset[index];

        return result;        
      });*/
      
      debugger;
      var dataLine = d3.select('.c3-line-' + datasetName);
//      var lineColor = dataLine.style('stroke','blue');
      
		var leastSquaresCoeff = leastSquares(abscissaPositions, dataset);
		
		// apply the results of the least squares regression
		var x1 = abscissaLabels[0];
		var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
		var x2 = abscissaLabels[abscissaLabels.length - 1];
		var y2 = leastSquaresCoeff[0] * abscissaPositions.length + leastSquaresCoeff[1];
		var trendData = [[x1,y1,x2,y2]];
		
		var trendline = chartLines.selectAll(".trendline")
			.data(trendData);
			
		trendline.enter()
			.append("line")
			.attr("class", "trendline")
			.attr("x1", function(d) { 
        return d[0]//xScale(d[0]); 
      })
			.attr("y1", function(d) { 
        return d[1]//yScale(d[1]);
      })
			.attr("x2", function(d) { 
        return d[2]//xScale(d[2]);
      })
			.attr("y2", function(d) { 
        return d[3]//yScale(d[3]);
      })
			.attr("stroke", "black")
			.attr("stroke-width", 1);
      

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

    function drawTrendline(xLabels,yColumnName,lineColor,lineWidth) {
      
      // get the x and y values for least squares
      var xSeries = d3.range(1, xLabels.length + 1);
      var ySeries = data.map(function(d) { return parseFloat(d[yColumnName]); });
      
      var leastSquaresCoeff = leastSquares(xSeries, ySeries);
      
      // apply the results of the least squares regression
      var x1 = xLabels[0];
      var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
      var x2 = xLabels[xLabels.length - 1];
      var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
      var trendData = [[x1,y1,x2,y2]];
      
      var trendline = svg.selectAll(".trendline")
        .data(trendData);
        
      trendline.enter()
        .append("line")
        .attr("class", "trendline")
        .attr("x1", function(d) { return xScale(d[0]); })
        .attr("y1", function(d) { return yScale(d[1]); })
        .attr("x2", function(d) { return xScale(d[2]); })
        .attr("y2", function(d) { return yScale(d[3]); })
        .attr("stroke", lineColor)
        .attr("stroke-width", lineWidth);
      
    }







    //debugger;
    return timeSeries;
}
