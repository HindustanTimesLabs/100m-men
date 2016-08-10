require("../css/styles.scss");
d3 = require("d3")
$ = jQuery = require("jQuery")
_ = require("underscore")

// scroll check to hide stepper

$(window).scroll(function() {
    var windscroll = $(window).scrollTop();
    var chartpos = ($('.chart').position().top)+50
    if ($('.stepper-container').hasClass('active')){
        if (chartpos>windscroll){
            d3.select('.stepper-container')
                .transition()
                .style('opacity',0)
                .duration(50)
            } else {
            d3.select('.stepper-container')
                .transition()
                .style('opacity',1)
                .duration(50)
        }
    }
}).scroll();

var steps = [
    {
        'highlight':'Jamaica',
        'arrow':'Jamaica',
        'text':'Usain Bolt',
        'narrative':'Usain Bolt’s 2009 record at 9.58s, continues to be the fastest in the world.'
    },
    {
        'highlight':'Jamaica, India',
        'arrow':'Jamaica, India',
        'text':'Usain Bolt',
        'narrative':'When Bolt is at the finish line, India\'s Anil Kumar is 6.63m behind.'
    },
    {
        'highlight':'none',
        'arrow':'Jamaica',
        'text':'Usain Bolt',
        'narrative':'Usain Bolt’s 2009 record at 9.58s, continues to be the fastest in the world.'
    },
    {
        'highlight':'none',
        'arrow':'Jamaica',
        'text':'Usain Bolt',
        'narrative':'Usain Bolt’s 2009 record at 9.58s, continues to be the fastest in the world.'
    }
]

steps.forEach(function(e,i){
    if (i==0){
        $('.steps').append('<div class = "progress-step progress-active" id="step'+(i+1)+'"></div>')
    } else {
        $('.steps').append('<div class = "progress-step" id="step'+(i+1)+'"></div>')
    }
})


var box = {
            height: $(window).height()*2,
            width: $(window).width(),  
            sidemargin: 50, 
            topmargin: 50
        }

// this animates our lovely scroll
var scrollAnimator = function(){
    $("html, body").animate(
        { scrollTop: ($('.dummydiv').position().top)}
        , 100/10.43841336 * 1000, 'swing'
    );
};

var starttime, currenttime

var barwidth = 2;

var ease = d3.easeLinear;

box.effectiveheight = box.height-(box.topmargin*3)

var svg = d3.select(".chart")
    .append("svg")
    .attr("class","chart-svg")
    .attr('height', (box.height))
    .attr('width',(box.width-box.sidemargin))

d3.csv("data/clean_men.csv",function(error,men){

    // omit the manual omit folks
    men = _.reject(men,{'ManualOmit':'Y'})

    // calculate min time. That is our friend Usain!
    var mintime = d3.min(men, function(e){return parseFloat(e.cleantime)})

    // STOPWATCH YAY
    var stopWatchTimer = function(){
        currenttime = Date.now()
        if (currenttime-starttime < mintime*1000){
            d3.select('.time')
                .text(getcleantime(currenttime - starttime)+"s")
        } else {
            clearInterval(stopWatchTimer)
        }
    }

    // define scale bands
    var x = d3.scaleBand()
                .domain(_.chain(men).pluck('Country').uniq().value())
                .range([0,(box.width-(box.sidemargin*2))])

    // y scales!
    var y = d3.scaleLinear()
        .range([(box.height-(box.topmargin*3.5)), 0])
        .domain([100,0]);

    // continent list! In alphabetical order
    var continentList = _.chain(men).pluck('Continent').uniq().value().sort()

    // Continents are best when they are colorful!
    var colorList = ["#334D5C","#DF5A49","#EFC94C","#45b29D","#2980B9","#E37A3f","#FDEEA7"]
    
    // color range cause we need to connect our continents and some colors
    var colorRange = d3.scaleOrdinal(colorList)
                        .domain(continentList);

    // legend stuff!
    var legend = d3.select('.legend')

    legend.selectAll('.key')
            .data(continentList)
            .enter()
            .append('div')
            .attr('class','key')
            .append('div')
            .attr('class','legend-box')
            .style('background-color',function(e){return colorRange(e)})

    legend.selectAll('.key')
            .append('p')
            .text(function(e){return e})

    // We begin the chart here peoplezzzzz
    var chart = svg.append('g')
        .attr("class","chart-container")
        .attr("transform","translate(" + box.sidemargin + "," + (box.topmargin) + ")")

    var xAxis = d3.axisTop()
        .scale(x)

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks('10')
        .tickFormat(function(d) { if (d == 0){ return "Start"} else if (d==10 || d==100){return d+"m"} else {return d} })
        .tickSize(-box.width, 0, 0)

    chart.append("g")
        .attr("transform","translate(0,0)")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")

    chart.selectAll(".bar")
        .data(men)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x (d['Country']); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return 0; })
        .attr("height",0)
        .style("fill",function(e){return colorRange(e['Continent'])})

    chart.selectAll(".bar")
        .sort(function(a, b) { return x(a.pos_at_max_dist) - x(b.pos_at_max_dist); })

    // what happens when you click on the start button
    $('.button').on("click",function(){
        $('.stopwatch').removeClass('inactive')
        starttime = Date.now()
        setTimeout(scrollAnimator, 1000);
        var timer = setInterval(stopWatchTimer, 0.5);

        d3.selectAll('.bar')
            .transition()
            .attr("height", function(d) { return y(d['pos_at_max_dist']); })
            .duration(function(e){return e['pos_at_max_dist']/e['speed'] * 1000 })

        d3.select('.stepper-container')
            .transition()
            .style('z-index',10)
            .transition()
            .delay((mintime*1000)+2000)
            .attr('class','stepper-container active')
            .style('opacity',1)
            .duration(1000)

        d3.select('.stopwatch')
            .transition()
            .delay((mintime*1000)+1000)
            .style('opacity',0)
            .duration(1000)


        // arrow for Jamaica

        var arrowright = chart.append("g")
                            .attr('class','a-step arrowright arrow')
                            .attr('id','step1-arrow')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("Jamaica") + 40)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("Jamaica") + 40)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("Jamaica") + 40 - 8)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("Usain Bolt")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
    
        // fade in the arrow
        d3.selectAll('#step1-arrow')
            .transition()
            .delay((mintime*1000)+1000)
            .style("opacity",1)
            .duration(1000)

        // highlight Usain Bolt
        d3.selectAll('.bar')
            .transition()
            .delay((mintime*1000)+1000)
            .style("fill",function(e){if (e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)

    })

    chart.append('line')
        .attr("class","finish-line axis")
        .attr("x1", 0)     // x position of the first end of the line
        .attr("y1", y(100))      // y position of the first end of the line
        .attr("x2", box.width)     // x position of the second end of the line
        .attr("y2", y(100))
        .style("stroke-width","5px")

    chart.append('text')
        .attr("class","finish-line-text")
        .text("Finish Line")
        .attr("transform","translate("+((box.width/2)-100)+","+(box.height-box.topmargin-80)+")")

    $('.stepper li').on('click',function(){
        $('.stepper li').removeClass('active')
        $(this).addClass('active')
    })

    var stepperpos = 1;

    $('#next').on('click',function(){

        stepperpos = stepperpos + 1;

        if (stepperpos = 2){
        d3.select('.stepper-container .text')
            .transition()
            .delay(100)
            .style('opacity',0)
            .duration(300)
            .transition()
            .delay(300)
            .text(steps[stepperpos-1].narrative)
            .style('opacity',1)
            .duration(500)

        $('.steps .progress-step').removeClass('progress-active')

        $('#step'+stepperpos).addClass('progress-active')

        // $('.stepper-container .text').html()

        d3.selectAll("#step1-arrow").remove()

        // highlight Anil Kumar and Osain Bolt
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country == 'India' || e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)

        // arrow for India
        var lowerComp = _.findWhere(men,{Country:'India'})

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("India"))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("India") - 40)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("India") - 40)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("India") - 40 + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("India")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
        
        // arrow for Jamaica

        var arrowright = chart.append("g")
                            .attr('class','arrowright arrow a-step')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("Jamaica") + 40)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("Jamaica") + 40)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("Jamaica") + 40 - 8)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("Jamaica")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
        
        // fade in arrows
        d3.selectAll('.arrow')
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        // highlight difference
        var difference = chart.append('g')
            .attr('class','difference')
            .style('opacity',0)
            .append('line')
            .attr('class','difference-l')
            .attr("x1", (x("India")-(x.bandwidth())*2))
            .attr("y1", y(lowerComp.pos_at_max_dist))
            .attr("x2", (x("India")-(x.bandwidth())*2))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')

        d3.select('.difference').transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("India")-(x.bandwidth())*2))
            .attr("y1", y(_.findWhere(men,{Country:'India'}).pos_at_max_dist))
            .attr("x2", (x("India")))
            .attr("y2", y(_.findWhere(men,{Country:'India'}).pos_at_max_dist))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("India")-(x.bandwidth())*2))
            .attr("y1", y(100))
            .attr("x2", (x("India")))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        var diff = round((100 - lowerComp.pos_at_max_dist),2)

        d3.select('.difference')
            .append('text')
            .text(diff+"m")
            .attr("class","label-text")
            .attr('transform','translate(' + ( x("India")-(x.bandwidth()*5)-40) + "," + y(parseFloat(lowerComp.pos_at_max_dist)+parseFloat(diff/2)) +")")
        }

        
    })

    // code for round function

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    // code for stopwatch
   var stopwatch = d3.select('.stopwatch')

    // code to clean time

    function getcleantime(time){
        var milliseconds = ((time % 1000)/10).toFixed(0)
        var seconds = parseInt(time/1000)
        if (seconds<1){
            seconds = '00'
        } else {
            seconds = '0'+seconds
        }
        if (milliseconds<1){
            milliseconds = '00'
        } else if (milliseconds<10){
            milliseconds = '0'+milliseconds
        }
        return seconds + "." + milliseconds 
    }

})
