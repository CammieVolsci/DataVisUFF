'use strict';

var scttPlot = {};

//dimensões do gráfico
scttPlot.h = 255;   //altura
scttPlot.w = 950;   //largura
scttPlot.margins = {top: 20, bottom: 50, left: 50, right: 15}; //dimensões da margem

//opções de exibir eixo, legenda, brush e zoom
scttPlot.showAxis = true;
scttPlot.showLabel = true;
scttPlot.showBrush = true;
scttPlot.showZoom = true;

//ticks
scttPlot.xTick = 0;
scttPlot.yTick = 4;

//escala, eixos e zoom
scttPlot.xScale = undefined;  
scttPlot.yScale = undefined;
scttPlot.xAxis  = undefined;
scttPlot.yAxis  = undefined;
scttPlot.zoom   = undefined;

//largura e altura das barrinhas do gráfico
scttPlot.barWidth = 1;		
scttPlot.barHeight = 1;

//localização da legenda, o quanto vou transladar
scttPlot.legendTranslateX = 770; //em x
scttPlot.legendTranslateY = -20; //em y

//label do x e y
scttPlot.labelXaxis = ['Eixo X'];
scttPlot.labelYaxis = ['Eixo Y'];

scttPlot.colors = ['pink', 'red'];

//legenda
scttPlot.keys = ['Vet1', 'Vet2'];                       //nome das legendas
scttPlot.cl = d3.scaleOrdinal().domain(scttPlot.keys).range(scttPlot.colors);                   //para pegar cor das legendas
scttPlot.z = d3.scaleOrdinal().range(scttPlot.colors);

//vetores para testar
scttPlot.vetX = ['4', '10', '12', '60', '5', '10', '30'];  
scttPlot.vetY = ['9', '11', '8', '50', '99', '1', '33'];
scttPlot.vetR = ['2', '1', '5', '10', '23', '3', '20'];

scttPlot.vetX2 = ['8', '20', '24', '30', '10', '35', '60'];
scttPlot.vetY2 = ['18', '22', '16', '100', '33', '2', '66'];
scttPlot.vetR2 = ['4', '2', '10', '20', '24', '25', '2'];

scttPlot.appendSvg = function(div) //criando svg
{
	var node = d3.select(div).append('svg')
		.attr('width', scttPlot.w + scttPlot.margins.left + scttPlot.margins.right)
		.attr('height', scttPlot.h + scttPlot.margins.top + scttPlot.margins.bottom)
		.append("g");

	return node;
}

scttPlot.createCirclesData = function(n, i)
{
    var circles = [];
    
    for(var id=0; id<n; id++)
    {
        if (i == 0)
        {
            var x = scttPlot.vetX[id];
            var y = scttPlot.vetY[id];
            var r = scttPlot.vetR[id];
        } 
        else 
        {
            var x = scttPlot.vetX2[id];
            var y = scttPlot.vetY2[id];
            var r = scttPlot.vetR2[id];
        }       
        var c = {'cx': x, 'cy': y, 'r': r};
        
        circles.push(c);
    }
    
    return circles;
}

scttPlot.appendCircles = function(svg) //criando as barrinhas do gráfico
{
    var vet = scttPlot.createCirclesData(7, 0);
    var vet2 = scttPlot.createCirclesData(7, 1);

	var xScale = d3.scaleLinear().domain([0,100]).range([0,scttPlot.w]);
    var yScale = d3.scaleLinear().domain([0,100]).range([0,scttPlot.h]);
    
    var tran = d3.transition()
        .duration(750);
    
    var circle = svg.selectAll('circle')
        .data(vet)
    
    var circles = svg.selectAll('circle')
        .data(vet2)

    circle
        .enter()
        .append('circle')
        .transition(tran)
        .attr('cx', function(d){ return xScale(d.cx); })
        .attr('cy', function(d){ return yScale(d.cy); })
        .attr('r' , function(d){ return d.r;  })
        .style('fill', 'pink');

    circle
        .transition(tran)
        .attr('cx', function(d){ return xScale(d.cx); })
        .attr('cy', function(d){ return yScale(d.cy); })
        .attr('r' , function(d){ return d.r;  })
        .style('fill', 'red');

    circle.exit()
        .transition(tran)
        .style("fill-opacity", 1e-6)
        .remove();

    return circle;
}

scttPlot.appendChartGroup = function(svg)
{
    var chart = svg.append('g')
        .attr('class','chart-area')
        .attr('width', scttPlot.w)
        .attr('height', scttPlot.h)
        .attr('transform', 'translate('+ scttPlot.margins.left +','+ scttPlot.margins.top +')' );
    
    return chart;
}

scttPlot.createAxis = function(svg)
{
    if(scttPlot.showAxis)
    {
        scttPlot.xScale = d3.scaleLinear().domain([0,100]).range([0,scttPlot.w]);
        scttPlot.yScale = d3.scaleLinear().domain([100,0]).range([0,scttPlot.h]);
        
        var xAxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ scttPlot.margins.left +','+ (scttPlot.h+scttPlot.margins.top) +')');

        var yAxisGroup = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ scttPlot.margins.left +','+ scttPlot.margins.top +')');
        
        scttPlot.xAxis = d3.axisBottom(scttPlot.xScale);
        scttPlot.yAxis = d3.axisLeft(scttPlot.yScale);
        
        xAxisGroup.call(scttPlot.xAxis);
        yAxisGroup.call(scttPlot.yAxis);
    }
	
}

scttPlot.addBrush = function(svg)
{
    if(scttPlot.showBrush)
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
                    if (scttPlot.xScale(d.cx) >= x0 && scttPlot.xScale(d.cx) <= x1 && 
                        scttPlot.yScale(d.cy) >= y0 && scttPlot.yScale(d.cy) <= y1)
                    { return "#ec7014"; }
                    else 
                    { return "rgb(150,150,190)"; }
                });        
        };
    
        scttPlot.brush = d3.brush()
            .on("start brush", brushed);
    
        svg.append("g")
            .attr("class", "brush")
            .call(scttPlot.brush);
    }
       
}

scttPlot.addZoom = function(svg)
{
    if(scttPlot.showZoom)
    {
        function zoomed()
        {
            var t = d3.event.transform;
            
            var nScaleX = t.rescaleX(scttPlot.xScale);
            scttPlot.xAxis.scale(nScaleX);
                    
            var xAxisGroup = svg.select('.xAxis');
            xAxisGroup.call(scttPlot.xAxis);

            svg.select('.chart-area')
                .selectAll('circle')
                .attr("cx", function(d) { return nScaleX(d.cx); });
        }
        
        scttPlot.zoom = d3.zoom()
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", scttPlot.w)
            .attr("height", scttPlot.margins.bottom)
            .attr('transform', 'translate('+ scttPlot.margins.left +','+ (scttPlot.h+scttPlot.margins.top) +')')
            .call(scttPlot.zoom); 
    }
      
}

scttPlot.addLegend = function(svg)
{
    if(scttPlot.showLabel)
    {
        svg.selectAll("mydots")
            .data(scttPlot.keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .attr('transform', 'translate('+ scttPlot.legendTranslateX +','+ scttPlot.legendTranslateY +')')
            .style("fill", function(d){ return scttPlot.cl(d);});

        svg.selectAll("mylabels")
            .data(scttPlot.keys)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr('transform', 'translate('+ scttPlot.legendTranslateX +','+ scttPlot.legendTranslateY +')')
            .style("fill", function(d){ return scttPlot.cl(d);})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    }
    
}

scttPlot.addAxisLabel = function(svg)
{
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", scttPlot.w - 800)
    .attr("y", scttPlot.h + scttPlot.margins.bottom)
    .text(scttPlot.labelXaxis);

    var texto = svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 10)
    .attr("x", -50 )
    .text(scttPlot.labelYaxis);

    return texto;
} 

scttPlot.tickFormat = function(svg,data)
{
    if(scttPlot.showAxis)
    {
        scttPlot.xScale = d3.scaleLinear().domain([0,100]).range([0,scttPlot.w]);
        scttPlot.yScale = d3.scaleLinear().domain([100,0]).range([0,scttPlot.h]);
        
        var xAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ scttPlot.margins.left +','+ (scttPlot.h+scttPlot.margins.top) +')');
        
        xAxisGroup.append("g")
            .attr('class', 'xAxis')
            .call(d3.axisLeft(scttPlot.xScale)
            .ticks(scttPlot.xTick));

        var yAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ scttPlot.margins.left +','+ scttPlot.margins.top +')');

        yAxisGroup.append("g")
            .attr('class', 'yAxis')
            .call(d3.axisLeft(scttPlot.yScale)
            .ticks(scttPlot.yTick));
        
        scttPlot.xAxis = d3.axisBottom(scttPlot.xScale);
        scttPlot.yAxis = d3.axisLeft(scttPlot.yScale);
        
        xAxisGroup.call(scttPlot.xAxis);
        yAxisGroup.call(scttPlot.yAxis);
    }
}

scttPlot.run = function()
{
	var svg = scttPlot.appendSvg("#mainDiv");
    var cht = scttPlot.appendChartGroup(svg);
    scttPlot.createAxis(svg);
    scttPlot.appendCircles(cht);

    d3.interval(function() {scttPlot.appendCircles(cht);}, 1500); 

    scttPlot.addBrush(svg);
    scttPlot.addLegend(svg);
    scttPlot.addAxisLabel(svg);
    scttPlot.addZoom(svg);
}

window.onload = scttPlot.run;