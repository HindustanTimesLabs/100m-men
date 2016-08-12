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
        'narrative':'<span class = "med">Usain Bolt is still the fastest human being. Ever. His record: <b>9.58 seconds</b> in 2009.</span>'
    },
    {
        'narrative':'When Bolt crosses the finish line, the second fastest man - America’s <b>Tyson Gay - is more than a meter behind</b>. That’s about the length of a cricket bat.'
    },
    {
        'narrative':'<span class ="small">India\'s Amiya Kumar Mallick is farther behind: 6.63 meters. But his record - 10.26 seconds - is <b>six-tenths of a second behind</b> Bolt. That’s how long it takes to blink twice.</span>'
    },
    {
        'narrative':'<span class ="small">Mallick’s record was good enough to win him a gold medal at the Melbourne Olympics in 1956. Today, at least <b>100 countries</b> have a faster national record than <span class = "india">India</span>.</span> '
    },
    {
        'narrative':'<span class = "big"><b>112 countries</b> are slower.</big>'
    },
    {
        'narrative':'<span class = "big">In Asia, <b><span class = "india">India</span> is ranked 16.</b> It’s ahead of 32 countries.</big>'
    },
    {
        'narrative':'<span class = "med">In South Asia, <b><span class = "india">India</span> is the fastest.</b> Sri Lanka comes close, finishing just 0.02 seconds later.</span>'
    },
    {
        'narrative':'<span class ="small">Bhutan at 12.15 seconds is the slowest country in the world. That’s <b>two-and-half seconds behind Bolt.</b> That’s probably how long it takes to say, “Wow! Usain Bolt is really fast.”</span>'
    },
    {
        'narrative':'Pick any two countries and watch their fastest runners compete. '
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
            height: $(window).height()*2.3,
            width: $(window).width(),  
            sidemargin: 50, 
            topmargin: 50
        }

// this animates our lovely scroll
var scrollAnimator = function(){
    $("html, body").animate(
        { scrollTop: ($('.legend').position().top)-($(window).height()*0.97)}
        , 100/10.43841336 * 700, 'swing'
    );
};

var starttime, currenttime

var barwidth = 2, arrowlength = 40

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
    var countryList = _.chain(men).pluck('Country').uniq().value()
    // define scale bands
    var x = d3.scaleBand()
                .domain(countryList)
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
        .on('click',function(e){console.log(e)})

    var India = _.findWhere(men,{Country:'India'})

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

            firstSlide((mintime*1000)+1000)
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

    $('.progress-step').on('click',function(){
        $('.steps .progress-step').removeClass('progress-active')
        $(this).addClass('progress-active')
        var currentstep = $(this).attr('id').split('step')[1]
        if (stepperpos>=1){
            $('#prev').removeClass('inactive')
        } 
        if (stepperpos<steps.length-1){
            $('#next').removeClass('inactive')
        } else {
            $('#next').addClass('inactive')
        }
        if (stepperpos==2){
            $('#prev').addClass('inactive')
        } 
        if (stepperpos<=steps.length){
            $('#next').removeClass('inactive')
        }
        stepperpos = changeSlide(currentstep-1)
    })

    $('#next').on('click',function(){
        if (stepperpos>=1){
            $('#prev').removeClass('inactive')
        } 
        if (stepperpos<steps.length-1){
            $('#next').removeClass('inactive')
        } else {
            $('#next').addClass('inactive')
        }
        stepperpos = changeSlide(stepperpos)
        
    })
    $('#prev').on('click',function(){
        if (stepperpos==2){
            $('#prev').addClass('inactive')
        } 

        if (stepperpos<=steps.length){
            $('#next').removeClass('inactive')
        }
        stepperpos = changeSlide(stepperpos-2)

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

    // Slide 1
    function firstSlide(timedelay){
        $('.a-step').remove()
        
        // arrow for Jamaica

        var arrowright = chart.append("g")
                            .attr('class','a-step arrowright arrow')
                            .attr('id','step1-arrow')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("Jamaica") + (arrowlength - 8))
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
            .delay(timedelay)
            .style("opacity",1)
            .duration(1000)

        // highlight Usain Bolt
        d3.selectAll('.bar')
            .transition()
            .delay(timedelay)
            .style("fill",function(e){if (e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)
    }

    // Slide 2
    function secondSlide(){
        $('.a-step, .difference').remove()

        // arrow for Jamaica

        var arrowright = chart.append("g")
                            .attr('class','a-step arrowright arrow')
                            .attr('id','step1-arrow')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("Jamaica") + (arrowlength - 8))
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

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country == 'United States' || e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)

        // arrow for US
        var selected = _.findWhere(men,{Country:'United States'})

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .attr('id','step2-arrow')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("United States"))
            .attr("y1", box.height * 0.8)
            .attr("x2", x("United States") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.8)
            .attr("x1", x("United States") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.8 + 5)
            .attr("x2", x("United States") - arrowlength+x.bandwidth() + 8)
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
                                .text("Tyson Gay")
                                .attr('transform','translate('+ (labelLine.attr("x2")-75-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1")              )+5) +")")

        d3.selectAll('.arrow')
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

    }

    // Slide 3
    function thirdSlide(){
        d3.selectAll('.arrow,.refline')
            // .transition()
            // .style('opacity',0)
            .remove()
        
        // highlight Anil Kumar and Osain Bolt
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country == 'India' || e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)

        // arrow for India

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("India"))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("India") - arrowlength+x.bandwidth() + 8)
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
            .attr("x2", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("Jamaica") + arrowlength)
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("Jamaica") +( arrowlength - 8))
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
            .attr("y1", y(India.pos_at_max_dist))
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
            .attr("y1", y(India.pos_at_max_dist))
            .attr("x2", (x("India")))
            .attr("y2", y(India.pos_at_max_dist))
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

        var diff = round((100 - India.pos_at_max_dist),2)

        d3.select('.difference')
            .append('text')
            .text(diff+"m")
            .attr("class","label-text")
            .attr('transform','translate(' + ( x("India")-(x.bandwidth()*5)-40) + "," + y(parseFloat(India.pos_at_max_dist)+parseFloat(diff/2)) +")")

    }

    // Slide 4

    function fourthSlide(){
        // highlight fast people
        

        d3.selectAll('.arrow, .difference')
            // .transition()
            // .style('opacity',0)
            .remove()

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (parseFloat(e.pos_at_max_dist)>=parseFloat(India.pos_at_max_dist)){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            // .style("opacity",function(e){
            //     if (parseFloat(e.pos_at_max_dist)>parseFloat(India.pos_at_max_dist)){
            //         return 0.4
            //     } else if (parseFloat(e.pos_at_max_dist)==parseFloat(India.pos_at_max_dist)) {
            //         return 1
            //     } else {
            //         return 1
            //     }
            // })
            .duration(1000)

        var arrowleft = chart.append("g")
                            .attr('class','shadow arrowleft arrow a-step')

        var labelLine = arrowleft.append("line")
            .attr("x1", x("India"))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("India") - arrowlength+x.bandwidth() + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')

        var labelLine = arrowleft.append("line")
            .attr("x1", x("India"))
            .attr("y1", box.height * 0.75)
            .attr("x2", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.75)
            .attr("x1", x("India") - arrowlength+x.bandwidth())
            .attr("y2", box.height * 0.75 + 5)
            .attr("x2", x("India") - arrowlength+x.bandwidth() + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        arrowleft.append("text")
                                .attr("class","label-text left-arrow-text shadow")
                                .text("India")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
                                .attr('st')

        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("India")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
                                .attr('st')                    
        
    }

    // Slide 5

    function fifthSlide(){
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (parseFloat(e.pos_at_max_dist)<=parseFloat(India.pos_at_max_dist)){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            // .style("opacity",function(e){
            //     if (parseFloat(e.pos_at_max_dist)<parseFloat(India.pos_at_max_dist)){
            //         return 0.4
            //     } else if (parseFloat(e.pos_at_max_dist)==parseFloat(India.pos_at_max_dist)) {
            //         return 1
            //     } else {
            //         return 1
            //     }
            // })
            .duration(1000)
    }

    // Slide 6

    function sixthSlide(){
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Continent=="Asia"){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .style('opacity',1)
            .duration(1000)
    }

    // Slide 7
    function seventhSlide(){
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){
                if (_.contains(['India','Pakistan','Nepal','Bangladesh','Afghanistan','Maldives','Bhutan'], e.Country)){
                    return colorRange(e['Continent'])
                } else {
                    return "#E5E5E5"
                }
            })
            .duration(1000)
    }

    // Slide 8

    function eighthSlide(){
         $("html, body").animate(
            { scrollTop: ($('body').scrollTop()-80)}
            , 1000, 'swing'
        );
         // arrow for Bhutan

         var bhutan = _.findWhere(men,{Country:'Bhutan'})
        var arrowright = chart.append("g")
                            .attr('class','arrowright arrow a-step')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Bhutan") + x.bandwidth()))
            .attr("y1", y(bhutan.pos_at_max_dist-1))
            .attr("x2", x("Bhutan") + arrowlength)
            .attr("y2", y(bhutan.pos_at_max_dist-1))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(bhutan.pos_at_max_dist-1))
            .attr("x1", x("Bhutan") + arrowlength)
            .attr("y2", y(bhutan.pos_at_max_dist-1) + 5)
            .attr("x2", x("Bhutan") +( arrowlength - 8))
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
                                .text("Bhutan")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
        arrowright.transition()
                    .style('opacity',1)
                    .duration(1000)
    }

    // Slide 9

    function ninthSlide(){
        // d3.select('.stepper-container .text')
        //     .append('select')
        //     .attr('class','country-selector')

        // $('country-selector').append('<option>'+'some'+'</option>')
    }


    // MISC

    function appendRefLine(val){
        var refline = chart.append('line')
                        .attr('class', 'refline')
                        .attr("y1", y(val))
                        .attr("x1", 0)
                        .attr("y2", y(val))
                        .attr("x2", box.width)
    }

    function changeSlide(pos){
        pos = pos+1;
        if (pos == 1){
            firstSlide (0)
        } else if (pos == 2){
            secondSlide()
        } else if (pos == 3){
            thirdSlide()
        } else if (pos == 4){
            fourthSlide()
            appendRefLine(India.pos_at_max_dist)
        } else if (pos == 5){
            fifthSlide()
        } else if (pos == 6){
            sixthSlide()
        } else if (pos == 7){
            seventhSlide()
        } else if (pos == 8){
            eighthSlide()
        } else if (pos == 9){
            ninthSlide()
        }
        updateText(pos)
        return pos
    }

    function updateText(pos){
        d3.select('.stepper-container .text')
            .transition()
            .delay(100)
            .style('opacity',0)
            .duration(300)
            .transition()
            .delay(100)
            .style('opacity',1)
            .duration(300)
            setTimeout(function(){$('.stepper-container .text').html(steps[pos-1].narrative)},450)
        
        $('.steps .progress-step').removeClass('progress-active')
        $('#step'+pos).addClass('progress-active')
    }
})
