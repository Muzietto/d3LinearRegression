var linegroup = d3.select('.c3-target-data1')
var linevalues = linegroup.data()[0].values

linegroup.selectAll('.circle1').data([{}]).enter().append('circle').attr('cx',10).attr('cy',10).attr('r',3)

var pointsgroup = d3.select('.c3-circles-data1') 

var circlesData = pointsgroup.selectAll('g circle').data()

var firstPointData = circlesData[0]
var lastPointData = circlesData[circlesData.length-1]

/************** DOMAIN ********************/
firstPointData.value // first domainY <-- number!!
lastPointData.value // last domainY <-- number!!

/************** RANGE ********************/
// these return strings!!!
pointsgroup.select('g circle').attr('cx') // first point rangeX
pointsgroup.select('g circle').attr('cy') // first point rangeY

d3.select(pointsgroup.selectAll('g circle')[0].pop()).attr('cx') // last point rangeX
d3.select(pointsgroup.selectAll('g circle')[0].pop()).attr('cy') // last point rangeY



