var OnebipCharts = function() {

  var barChart = function(options, values){
      var chart = c3.generate({
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
     return chart;
  }

  var lineChart = function(options, values){
    var chart = c3.generate({
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

    if (options.trendline) {
      setTimeout(function(){ 
        paintTrendline(values);
      },500);
    }
    return chart;
  }

  var timeseriesChart = function(options, values){
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

    if (options.trendline) {
      setTimeout(function(){ 
        paintTrendline(values);
      },500);
    }
    return chart;
  }
  
  function paintTrendline(values) {
    // container of the various lines
    var chartLines = d3.select('.c3-chart-lines');
    
    var abscissaName = values[0][0];
    var abscissaLabels = values[0].slice(1);
    var abscissaPositions = abscissaLabels.map(function(x,index){return index+1;});

    for (var i = 1; i < values.length; i++) {
     
      var datasetName = values[i][0]
                          .replace(/\//g,'-') // slash
                          .replace(/\\/g,'-') // backslash
                          .replace(/\s/g,'-') // whitespace
                          .replace(/\|/g,'-') // bar
                          .replace(/\?/g,'-') // question mark
                          .replace(/\^/g,'-') // tilde
                          .replace(/\*/g,'-') // star
                          .replace(/%/g,'-')  // percent
                          .replace(/&/g,'-')  // ampersand
                          .replace(/#/g,'-')  // hash
                          .replace(/@/g,'-')  // at
      ; // 'data1------ciccio'
      var dataset = values[i].slice(1); // y-values
      
      var dataLine = d3.select('.c3-line-' + datasetName);
      var lineColor = dataLine.style('stroke');
      
      var pointsgroup = d3.select('.c3-circles-' + datasetName);
      var circlesData = pointsgroup.selectAll('g circle').data();

      var minValuePointData = minValuePointIn(circlesData);
      var maxValuePointData = maxValuePointIn(circlesData);

      // search max/min value - data = [{id,index,value,x},{id,index,value,x}]
      function maxValuePointIn(data) { return data.reduce(function(acc,curr){ if (curr.value > acc.value) {return curr;} else {return acc;} },{value:Number.MIN_VALUE});}
      function minValuePointIn(data) { return data.reduce(function(acc,curr){ if (curr.value < acc.value) {return curr;} else {return acc;} },{value:Number.MAX_VALUE});}
      
      /************** DOMAIN ********************/
      var firstDomainX = 0;
      var lastDomainX = 1000;
      var minDomainY = minValuePointData.value;
      var maxDomainY = maxValuePointData.value;

      /************** RANGE ********************/
      var firstRangeX = parseFloat(pointsgroup.select('g circle').attr('cx'));
      var lastRangeX = parseFloat(d3.select(pointsgroup.selectAll('g circle')[0].pop()).attr('cx'));
      var minRangeY = parseFloat(pointsgroup.selectAll('g circle:nth-child('+(minValuePointData.index+1)+')').attr('cy'));
      var maxRangeY = parseFloat(pointsgroup.selectAll('g circle:nth-child('+(maxValuePointData.index+1)+')').attr('cy'));
      
      var scaleX = d3.scale.linear().domain([firstDomainX, lastDomainX]).range([firstRangeX, lastRangeX]);        
      var scaleY = d3.scale.linear().domain([minDomainY, maxDomainY]).range([minRangeY, maxRangeY]); 
      // GO ON WITH THE TRENDLINE
      var leastSquaresCoeff = leastSquares(abscissaPositions, dataset);
      
      // apply the results of the least squares regression
      var x1 = firstDomainX;
      var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
      var x2 = lastDomainX;
      var y2 = leastSquaresCoeff[0] * abscissaPositions.length + leastSquaresCoeff[1];
      var trendData = [x1,y1,x2,y2];
      
      var trendline = chartLines.selectAll(".trendline-"+datasetName)
        .data([{}]);
        
      trendline.enter()
        .append("line")
        .attr("class", "trendline-"+datasetName)
        .attr("x1", scaleX(trendData[0]))
        .attr("y1", scaleY(trendData[1])) 
        .attr("x2", scaleX(trendData[2])) 
        .attr("y2", scaleY(trendData[3])) 
        .style("stroke", lineColor)
        .style("stroke-width", 3)
        .style("stroke-dasharray", ("10, 10"));
    }
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
  
  return {
    barChart: barChart,
    lineChart: lineChart,
    timeseriesChart: timeseriesChart 
  }
}();