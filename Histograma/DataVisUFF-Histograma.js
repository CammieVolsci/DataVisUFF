'use strict';

var barChart = {};

//dimensões do gráfico
barChart.h = 255;   //altura
barChart.w = 950;   //largura
barChart.margins = {top: 20, bottom: 50, left: 50, right: 15}; //dimensões da margem

//opções de exibir eixo, legenda, brush e zoom
barChart.showAxis = true;
barChart.showLabel = false;
barChart.showBrush = true;
barChart.showZoom = true;

//ticks
barChart.xTick = 0;
barChart.yTick = 2;

//escala, eixos e zoom
barChart.xScale = undefined;  
barChart.yScale = undefined;
barChart.xAxis  = undefined;
barChart.yAxis  = undefined;
barChart.zoom   = undefined;

//largura e altura das barrinhas do gráfico
barChart.barWidth = 1;		
barChart.barHeight = 1;

//localização da legenda, o quanto vou transladar
barChart.legendTranslateX = 770; //em x
barChart.legendTranslateY = -20; //em y

//label do x e y
barChart.labelXaxis = ['Generation'];
barChart.labelYaxis = ['Attack'];

//barrinhas
barChart.colors = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']; //cor das barrinhas do gráfico
barChart.z = d3.scaleOrdinal().range(barChart.colors);                                          //função para pegar cor das barrinhas

//legenda
barChart.keys = ['Gen1', 'Gen2', 'Gen3', 'Gen4', 'Gen5', 'Gen6', 'Gen7'];                       //nome das legendas
barChart.cl = d3.scaleOrdinal().domain(barChart.keys).range(barChart.colors);                   //para pegar cor das legendas


barChart.appendSvg = function(div) //criando svg
{
	var node = d3.select(div).append('svg')
		.attr('width', barChart.w + barChart.margins.left + barChart.margins.right)
		.attr('height', barChart.h + barChart.margins.top + barChart.margins.bottom)
        .append("g");
        

	return node;
}

barChart.appendRect = function(svg,dados,i) //criando as barrinhas do gráfico
{

    var tran = d3.transition()
        .duration(750);

    var rect = svg.selectAll("rect")
        .data(dados)  
    
    rect
        .enter()
        .append("rect")
        .transition(tran)
        .attr("x", function() {i++;return i;})
        .attr("y", function(d) {return barChart.h - d.hp;})
        .attr("width", barChart.barWidth)
        .attr("height", function(d) {return d.hp;})
        .attr("fill", function(d){return barChart.z(d.generation);});

    rect
        .transition(tran)
        .attr("x", function() {i++; return i;})
        .attr("y", function(d) {return barChart.h - d.attack;})
        .attr("width", barChart.barWidth)
        .attr("height", function(d) {return d.attack;})
        .attr("fill", function(d){return barChart.z(d.generation);});

    
    i = -1;

    rect
        .transition(tran)
        .attr("x", function() {i++; return i;})
        .attr("y", function(d) {return barChart.h - d.defense;})
        .attr("width", barChart.barWidth)
        .attr("height", function(d) {return d.defense;})
        .attr("fill", function(d){return barChart.z(d.generation);});

    rect.exit()
        .transition(tran)
        .style("fill-opacity", 1e-6)
        .remove();

	return rect;
}

barChart.appendChartGroup = function(svg)
{
	var chart = svg.append('g')
        .attr('class', 'chart-area')
        .attr('width', barChart.w)
        .attr('height', barChart.h)
        .attr('transform', 'translate('+ barChart.margins.left +','+ barChart.margins.top +')' );
    
    return chart;
}

barChart.createAxis = function(svg,data)
{
    if(barChart.showAxis)
    {
        barChart.xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.generation; })]).range([0,barChart.w - 149]);
        barChart.yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.attack; })]).range([barChart.h,0]);
        
        var xAxisGroup = svg.append('g')
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ barChart.margins.left +','+ (barChart.h+barChart.margins.top) +')');

        var yAxisGroup = svg.append('g')
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ barChart.margins.left +','+ barChart.margins.top +')');
        
        barChart.xAxis = d3.axisBottom(barChart.xScale);
        barChart.yAxis = d3.axisLeft(barChart.yScale);
        
        xAxisGroup.call(barChart.xAxis);
        yAxisGroup.call(barChart.yAxis);
    }
	
}

barChart.addBrush = function(svg)
{
    if(barChart.showBrush)
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
                    if (barChart.xScale(d.cx) >= x0 && barChart.xScale(d.cx) <= x1 && 
                        barChart.yScale(d.cy) >= y0 && barChart.yScale(d.cy) <= y1)
                    { return "#ec7014"; }
                    else 
                    { return "rgb(150,150,190)"; }
                });        
        };

        barChart.brush = d3.brush()
            .on("start brush", brushed);

        svg.append("g")
            .attr("class", "brush")
            .call(barChart.brush);
    }
       
}

barChart.addZoom = function(svg)
{
    if(barChart.showZoom)
    {
        function zoomed()
        {
            var t = d3.event.transform;
            
            var nScaleX = t.rescaleX(barChart.xScale);
            barChart.xAxis.scale(nScaleX);
                    
            var xAxisGroup = svg.select('.xAxis');
            xAxisGroup.call(barChart.xAxis);

            svg.select('.chart-area')
                .selectAll('rect')
                .attr("x", function(d) { return nScaleX(d.x); });
        }
        
        barChart.zoom = d3.zoom()
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", barChart.w)
            .attr("height", barChart.margins.bottom)
            .attr('transform', 'translate('+ barChart.margins.left +','+ (barChart.h+barChart.margins.top) +')')
            .call(barChart.zoom);   
    }
    
}

barChart.addLegend = function(svg)
{
    if(barChart.showLabel)
    {
        svg.selectAll("mydots")
            .data(barChart.keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .attr('transform', 'translate('+ barChart.legendTranslateX +','+ barChart.legendTranslateY +')')
            .style("fill", function(d){ return barChart.cl(d);});

        svg.selectAll("mylabels")
            .data(barChart.keys)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr('transform', 'translate('+ barChart.legendTranslateX +','+ barChart.legendTranslateY +')')
            .style("fill", function(d){ return barChart.cl(d);})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    }
    
}

barChart.addAxisLabel = function(svg)
{
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", barChart.w - 800)
    .attr("y", barChart.h + barChart.margins.bottom)
    .text(barChart.labelXaxis);

    var texto = svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 10)
    .attr("x", -50 )
    .text(barChart.labelYaxis);

    return texto;
    
}

barChart.tickFormat = function(svg,data)
{
    if(barChart.showAxis)
    {
        barChart.xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.generation; })]).range([0,barChart.w - 149]);
        barChart.yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.attack; })]).range([barChart.h,0]);
        
        var xAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ barChart.margins.left +','+ (barChart.h+barChart.margins.top) +')');
        
        xAxisGroup.append("g")
            .attr('class', 'xAxis')
            .call(d3.axisLeft(barChart.xScale)
            .ticks(barChart.xTick));

        var yAxisGroup = svg.append('g')
            .attr('transform', 'translate('+ barChart.margins.left +','+ barChart.margins.top +')');

        yAxisGroup.append("g")
            .attr('class', 'yAxis')
            .call(d3.axisLeft(barChart.yScale)
            .ticks(barChart.yTick));
        
        barChart.xAxis = d3.axisBottom(barChart.xScale);
        barChart.yAxis = d3.axisLeft(barChart.yScale);
        
        xAxisGroup.call(barChart.xAxis);
        yAxisGroup.call(barChart.yAxis);
    }
}

barChart.run = function()
{
	d3.csv("pokemon.csv", function(error, data) 
	{
		if (error) throw error;

		data.forEach(function(d) 
		{
            d.hp = +d.hp;
            d.attack = +d.attack;
            d.defense = +d.defense;
			d.generation = +d.generation;
		});
	

	var svg = barChart.appendSvg("#mainDiv");
	var cht = barChart.appendChartGroup(svg);
    barChart.createAxis(svg,data);
    
    d3.interval(function() {barChart.appendRect(cht,data,-1);}, 1500);
    barChart.addLegend(svg);
    barChart.addAxisLabel(svg);
    

	});	
}

window.onload = barChart.run;