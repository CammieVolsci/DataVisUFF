'use strict';

var lineChart = {};

//dimensões do gráfico
lineChart.h = 255;   //altura
lineChart.w = 950;   //largura
lineChart.margins = {top: 20, bottom: 50, left: 50, right: 15}; //dimensões da margem

//opções de exibir eixo, legenda, brush e zoom
lineChart.showAxis = true;
lineChart.showLabel = true;
lineChart.showBrush = true;
lineChart.showZoom = true;

//ticks
lineChart.xTick = 0;
lineChart.yTick = 4;

//escala, eixos e zoom
lineChart.xScale = undefined;  
lineChart.yScale = undefined;
lineChart.xAxis  = undefined;
lineChart.yAxis  = undefined;
lineChart.zoom   = undefined;

//largura e altura das barrinhas do gráfico
lineChart.barWidth = 1;		
lineChart.barHeight = 1;

//localização da legenda, o quanto vou transladar
lineChart.legendTranslateX = 770; //em x
lineChart.legendTranslateY = -20; //em y

//label do x e y
lineChart.labelXaxis = ['Eixo X'];
lineChart.labelYaxis = ['Eixo Y'];

lineChart.colors = ['steelblue'];

//legenda
lineChart.keys = ['Vet1', 'Vet2'];                       //nome das legendas
lineChart.cl = d3.scaleOrdinal().domain(lineChart.keys).range(lineChart.colors);                   //para pegar cor das legendas
lineChart.z = d3.scaleOrdinal().range(lineChart.colors);

//vetores para testar
lineChart.vet = [[2,4], [3,9], [4,16], [5,25], [6,36], [7,49], [8,120], [9,81], [10,100]];
lineChart.vet2 = [[2,40], [3,90], [4,1], [5,5], [6,30], [7,19], [8,105], [9,99], [10,120]];

lineChart.appendSvg = function(div) //criando svg
{
	var node = d3.select(div).append('svg')
		.attr('width', lineChart.w + lineChart.margins.left + lineChart.margins.right)
		.attr('height', lineChart.h + lineChart.margins.top + lineChart.margins.bottom)
		.append("g");

	return node;
}

lineChart.appendLines = function(svg, data, data2)
{
    var xScale = d3.scaleLinear().domain(d3.extent(data, function(d) { return d.x; })).range([0, lineChart.w]);
    var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return +d.y; })]).range([ lineChart.h, 0 ]);

    var tran = d3.transition()
        .duration(750);

    svg.append("path")
      .datum(data)
      .transition(tran)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
      .x(function(d) { return xScale(d.x);  })
      .y(function(d) { return yScale(d.y); }));
      

      svg.append("path")
      .datum(data2)
      .transition(tran)
      .attr("fill", "none")
      .attr("stroke", "pink")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
      .x(function(d) { return xScale(d.x);  })
      .y(function(d) { return yScale(d.y); }));
      

      line.exit()
      .transition(tran)
      .style("fill-opacity", 1e-6)
      .remove();
}

lineChart.appendChartGroup = function(svg)
{
    var chart = svg.append('g')
        .attr('class','chart-area')
        .attr('width', lineChart.w)
        .attr('height', lineChart.h)
        .attr('transform', 'translate('+ lineChart.margins.left +','+ lineChart.margins.top +')' );
    
    return chart;
}

lineChart.createAxis = function(svg, data)
{
    if(lineChart.showAxis)
    {
        lineChart.xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.x; })]).range([0,lineChart.w]);
        lineChart.yScale = d3.scaleLinear().domain([d3.max(data, function(d) { return d.y; }), 0]).range([0,lineChart.h]);
        
        var xAxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ lineChart.margins.left +','+ (lineChart.h+lineChart.margins.top) +')');

        var yAxisGroup = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ lineChart.margins.left +','+ lineChart.margins.top +')');
        
        lineChart.xAxis = d3.axisBottom(lineChart.xScale);
        lineChart.yAxis = d3.axisLeft(lineChart.yScale);
        
        xAxisGroup.call(lineChart.xAxis);
        yAxisGroup.call(lineChart.yAxis);
    }
}	

lineChart.addZoom = function(svg)
{
    if(lineChart.showZoom)
    {
        function zoomed()
        {
            var t = d3.event.transform;
            
            var nScaleX = t.rescaleX(lineChart.xScale);
            lineChart.xAxis.scale(nScaleX);
                    
            var xAxisGroup = svg.select('.xAxis');
            xAxisGroup.call(lineChart.xAxis);

            svg.select('.chart-area')
                .selectAll('line')
                .attr("cx", function(d) { return nScaleX(d.cx); });
        }
        
        lineChart.zoom = d3.zoom()
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", lineChart.w)
            .attr("height", lineChart.margins.bottom)
            .attr('transform', 'translate('+ lineChart.margins.left +','+ (lineChart.h+lineChart.margins.top) +')')
            .call(lineChart.zoom); 
    }
      
}

lineChart.addBrush = function(svg)
{
    if(lineChart.showBrush)
    {
        function brushed()
        {        
            var s = d3.event.selection,
               x0 = s[0][0],
               y0 = s[0][1],
               x1 = s[1][0],
               y1 = s[1][1];
            
            svg.selectAll('crect')
                .style("fill", function (d) 
                {
                    if (lineChart.xScale(d.cx) >= x0 && lineChart.xScale(d.cx) <= x1 && 
                        lineChart.yScale(d.cy) >= y0 && lineChart.yScale(d.cy) <= y1)
                    { return "#ec7014"; }
                    else 
                    { return "rgb(150,150,190)"; }
                });        
        };
    
        lineChart.brush = d3.brush()
            .on("start brush", brushed);
    
        svg.append("g")
            .attr("class", "brush")
            .call(lineChart.brush);
    }
       
}

lineChart.addLegend = function(svg)
{
    if(lineChart.showLabel)
    {
        svg.selectAll("mydots")
            .data(lineChart.keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .attr('transform', 'translate('+ lineChart.legendTranslateX +','+ lineChart.legendTranslateY +')')
            .style("fill", function(d){ return lineChart.cl(d);});

        svg.selectAll("mylabels")
            .data(lineChart.keys)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr('transform', 'translate('+ lineChart.legendTranslateX +','+ lineChart.legendTranslateY +')')
            .style("fill", function(d){ return lineChart.cl(d);})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    }
    
}

lineChart.addAxisLabel = function(svg)
{
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", lineChart.w - 800)
    .attr("y", lineChart.h + lineChart.margins.bottom)
    .text(lineChart.labelXaxis);

    var texto = svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 10)
    .attr("x", -50 )
    .text(lineChart.labelYaxis);

    return texto;
} 

lineChart.tickFormat = function(svg,data)
{
    if(lineChart.showAxis)
    {
        lineChart.xScale = d3.scaleLinear().domain([0,100]).range([0,lineChart.w]);
        lineChart.yScale = d3.scaleLinear().domain([100,0]).range([0,lineChart.h]);
        
        var xAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ lineChart.margins.left +','+ (lineChart.h+lineChart.margins.top) +')');
        
        xAxisGroup.append("g")
            .attr('class', 'xAxis')
            .call(d3.axisLeft(lineChart.xScale)
            .ticks(lineChart.xTick));

        var yAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ lineChart.margins.left +','+ lineChart.margins.top +')');

        yAxisGroup.append("g")
            .attr('class', 'yAxis')
            .call(d3.axisLeft(lineChart.yScale)
            .ticks(lineChart.yTick));
        
        lineChart.xAxis = d3.axisBottom(lineChart.xScale);
        lineChart.yAxis = d3.axisLeft(lineChart.yScale);
        
        xAxisGroup.call(lineChart.xAxis);
        yAxisGroup.call(lineChart.yAxis);
    }
}

lineChart.run = function()
{
    var data = lineChart.vet.map(function(d) {return {x: d[0],y: d[1]};});
    var data2 = lineChart.vet2.map(function(d) {return {x: d[0],y: d[1]};});

	var svg = lineChart.appendSvg("#mainDiv");
    var cht = lineChart.appendChartGroup(svg);
    
    lineChart.createAxis(svg,data);
    
    d3.interval(function() {lineChart.appendLines(cht,data,data2);}, 1500); 
    
    lineChart.addBrush(svg);
    //lineChart.addZoom(svg);
    lineChart.addLegend(svg);
    lineChart.addAxisLabel(svg);
}

window.onload = lineChart.run;