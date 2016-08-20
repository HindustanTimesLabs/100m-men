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

var share = '<p>And in that miniscule amount of time lies Usain Bolt’s glory.</p><a href="https://www.facebook.com/sharer/sharer.php?u=http://www.hindustantimes.com/static/olympics/every-country-fastest-man-in-one-race-100m" target="_blank"><div class = "share fb"><i class="fa fa-facebook social-button" aria-hidden="true"></i> Share</div></a><a href = "http://twitter.com/intent/tweet?url=http://www.hindustantimes.com/static/olympics/every-country-fastest-man-in-one-race-100m&text=Every country\'s fastest man in one race" target="_blank"><div class = "share tw"><i class="fa fa-twitter social-button" aria-hidden="true"></i> Tweet</div></a>'

var steps = [
    {
        'highlight':'Jamaica',
        'arrow':'Jamaica',
        'text':'Usain Bolt',
        'narrative':'Usain Bolt is still the fastest human. Ever. His current record: <b>9.58 seconds</b> in 2009.'
    },
    {
        'narrative':' When Bolt crosses the finish line, the second fastest man - America’s Tyson Gay - is <b>more than a meter</b> behind. That’s about the length of a cricket bat.'
    },
    {
        'narrative':'India\'s Amiya Kumar Mallick is <b>6.63 meters</b> behind. At <b>10.26 seconds</b>, he is <b>six-tenths of a second</b> slower than Bolt. That’s how long it takes to blink twice.'
    },
    {
        'narrative':'Mallick’s 2016 record would have won him a gold 60 years ago. Today, at least <b>101</b> countries have a faster national record than <span class = "india">India</span>. '
    },
    {
        'narrative':'<b>104</b> countries are slower.'
    },
    {
        'narrative':'In Asia, Qatar is the fastest. <span class = "india">India</span> is ranked <b>16</b>, ahead of <b>28</b> countries.'
    },
    {
        'narrative':'In South Asia, <span class = "india">India</span> and Sri Lanka are the <b>fastest</b>. They are neck and neck.'
    },
    {
        'narrative':'Tuvalu - a tiny South Pacific island of 10, 000 people - is the <b>slowest</b> in the world at <b>11.44 seconds.</b>'
    },
    {
        'narrative':'That gap - between Jamaica and Tuvalu is <b>1.86 seconds.</b>'
    },
    {
        'narrative':''
    }
]

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

d3.csv("data/data.csv",function(error,men){

    // calculate min time. That is our friend Usain!
    var mintime = d3.min(men, function(e){return parseFloat(e.cleantime)})

    // STOPWATCH YAY
    var stopWatchTimer = function(){
        currenttime = Date.now()
        if (currenttime-starttime <= mintime*1000){
            d3.select('.time')
                .text(getcleantime(currenttime - starttime)+"s")
        } else {
            if ($('body').attr('time')!='Y'){
                $('body').attr('time','Y')
                d3.select('.time')
                .text('09.58s')
            }

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

    var stepperpos = 1;

    $('#next').on('click',function(){
        if (stepperpos>=1){
            $('#prev').removeClass('inactive')
        } 
        if (stepperpos<steps.length-1){
            $('#next').removeClass('inactive')
        } else {
            $('#next,#prev').addClass('inactive')
            $('#replay').removeClass('inactive')
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

    $('#replay').on('click',function(){
        stepperpos = 0
        stepperpos = changeSlide(0)
        $('#next').removeClass('inactive')
            $('#replay').addClass('inactive')

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
        updateText(1)
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
        
        if (timedelay==0){
            resetOpacity()
        }

        // highlight Usain Bolt
        d3.selectAll('.bar')
            .transition()
            .delay(timedelay)
            .style("fill",function(e){if (e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)
    }

    // Slide 2
    function secondSlide(){
        resetOpacity()
        hideRefLine()
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
            .remove()
        
        // highlight Anil Kumar and Osain Bolt
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country == 'India' || e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .style('opacity',1)
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
        resetOpacity()
        showRefLine()
        d3.selectAll('.arrow, .difference')
            .remove()

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (parseFloat(e.pos_at_max_dist)>=parseFloat(India.pos_at_max_dist)){return colorRange(e['Continent'])} else {return "#F7F7F7"}})
            .style("opacity",function(e){
                if (parseFloat(e.pos_at_max_dist)>parseFloat(India.pos_at_max_dist)){
                    return 0.4
                } else if (parseFloat(e.pos_at_max_dist)==parseFloat(India.pos_at_max_dist)) {
                    if (e.Country == 'India'){
                        return 1
                    } else {
                        return 0.4
                    }
                } else {
                    return 1
                }
            })
            .duration(1000)                
        
    }

    // Slide 5

    function fifthSlide(){
        resetOpacity()
        showRefLine()
        $('.arrow').remove()
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){
                if (parseFloat(e.pos_at_max_dist)<=parseFloat(India.pos_at_max_dist)){
                    return colorRange(e['Continent'])
                } else {
                    return "#F7F7F7"}
                })
            .style("opacity",function(e){
                if ( parseFloat(e.pos_at_max_dist) < parseFloat(India.pos_at_max_dist) ){
                    return 0.4
                } else if (parseFloat(e.pos_at_max_dist)==parseFloat(India.pos_at_max_dist)) {
                    if (e.Country == 'India'){
                                        return 1
                                    } else {
                                        return 0.4
                                    }
                } else {
                    return 1
                }
            })
            .duration(1000)
    }

    // Slide 6

    function sixthSlide(){
        resetOpacity()
        $('.arrow').remove()
        // arrow for Qatar
        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Qatar"))
            .attr("y1", y(85))
            .attr("x2", x("Qatar") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(85))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(85))
            .attr("x1", x("Qatar") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(85) + 5)
            .attr("x2", x("Qatar") - arrowlength+(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow = arrowleft.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Qatar")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
        
        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Qatar")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")

        // arrow for China

        var arrowright = chart.append("g")
                            .attr('class','arrowright arrow a-step')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("China") + x.bandwidth()))
            .attr("y1", y(95.5))
            .attr("x2", x("China") + arrowlength)
            .attr("y2", y(95.5))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(95.5))
            .attr("x1", x("China") + arrowlength)
            .attr("y2", y(95.5)+ 5)
            .attr("x2", x("China") +( arrowlength - 8))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightArrowTextshadow = arrowright.append("text")
                                .attr("class","label-text shadow right-arrow-text")
                                .text("China")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("China")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")

        arrowleft.transition()
                .style('opacity',1)
                .duration(1000)

        arrowright.transition()
                .style('opacity',1)
                .duration(1000)

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Continent=="Asia"){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .style('opacity',1)
            .duration(1000)


    }

    // Slide 7
    function seventhSlide(){
        $('.arrow').remove()
        resetOpacity()
        showRefLine()
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){
                if (_.contains(['India','Pakistan','Nepal','Bangladesh','Afghanistan','Maldives','Bhutan','Sri Lanka'], e.Country)){
                    return colorRange(e['Continent'])
                } else {
                    return "#E5E5E5"
                }
            })
            .duration(1000)

        // arrow for Pakistan
        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Pakistan"))
            .attr("y1", box.height * 0.7)
            .attr("x2", x("Pakistan") - arrowlength-(x.bandwidth()*2))
            .attr("y2", box.height * 0.7)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", box.height * 0.7)
            .attr("x1", x("Pakistan") - arrowlength-(x.bandwidth()*2))
            .attr("y2", box.height * 0.7 + 5)
            .attr("x2", x("Pakistan") - arrowlength-(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow = arrowleft.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Pakistan")
                                .attr('transform','translate('+ (labelLine.attr("x2")-60) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
        var leftArrowtextshadow = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Pakistan")
                                .attr('transform','translate('+ (labelLine.attr("x2")-60) +","+ (parseInt(labelLine.attr("y1"))+5) +")")

        arrowleft.transition()
                .style('opacity',1)

        var arrowright = chart.append("g")
                            .attr('class','arrowright arrow a-step')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Bangladesh") + x.bandwidth()))
            .attr("y1", y(89.5))
            .attr("x2", x("Bangladesh") + arrowlength)
            .attr("y2", y(89.5))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(89.5))
            .attr("x1", x("Bangladesh") + arrowlength)
            .attr("y2", y(89.5)+ 5)
            .attr("x2", x("Bangladesh") +( arrowlength - 8))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightArrowTextshadow = arrowright.append("text")
                                .attr("class","label-text shadow right-arrow-text")
                                .text("Bangladesh")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("Bangladesh")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
         arrowright.transition()
                .style('opacity',1)
    }

    // Slide 8

    function eighthSlide(){
        $('.arrow,.difference').remove()
        resetOpacity()
        hideRefLine()
        d3.selectAll('.bar')
            .transition()
            .style('fill',function(e){
                if (e.Country=='Tuvalu'){
                    return colorRange(e['Continent'])
                } else {
                    return '#E5E5E5'
                }
            })
            .duration(1000)

        // arrow for Tuvalu
        var tuvalu = _.findWhere(men,{Country:'Tuvalu'})

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .attr('id','step2-arrow')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Tuvalu"))
            .attr("y1", y(82))
            .attr("x2", x("Tuvalu") - arrowlength+x.bandwidth())
            .attr("y2", y(82))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(82))
            .attr("x1", x("Tuvalu") - arrowlength+x.bandwidth())
            .attr("y2", y(82) + 5)
            .attr("x2", x("Tuvalu") - arrowlength+x.bandwidth() + 8)
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
                                .text("Tuvalu")
                                .attr('transform','translate('+ (labelLine.attr("x2")-55-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1")              )+5) +")")
        
        arrowleft.transition()
                    .style('opacity',1)
                    .duration(1000)
    }

    // Slide 9

    function ninthSlide(){
        resetOpacity()
        d3.selectAll('.bar')
            .transition()
            .style('fill',function(e){
                if (e.Country=='Tuvalu' || e.Country=='Jamaica'){
                    return colorRange(e['Continent'])
                } else {
                    return '#E5E5E5'
                }
            })
            .duration(1000)

         // arrow for Tuvalu
         var tuvalu = _.findWhere(men,{Country:'Tuvalu'})
        var arrowright = chart.append("g")
                            .attr('class','arrowright arrow a-step')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Tuvalu") + x.bandwidth()))
            .attr("y1", y(tuvalu.pos_at_max_dist-1))
            .attr("x2", x("Tuvalu") + arrowlength)
            .attr("y2", y(tuvalu.pos_at_max_dist-1))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(tuvalu.pos_at_max_dist-1))
            .attr("x1", x("Tuvalu") + arrowlength)
            .attr("y2", y(tuvalu.pos_at_max_dist-1) + 5)
            .attr("x2", x("Tuvalu") +( arrowlength - 8))
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
                                .text("Tuvalu")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
        
     var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .attr('id','step2-arrow')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Jamaica"))
            .attr("y1", y(94))
            .attr("x2", x("Jamaica") - arrowlength+x.bandwidth())
            .attr("y2", y(94))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(94))
            .attr("x1", x("Jamaica") - arrowlength+x.bandwidth())
            .attr("y2", y(94) + 5)
            .attr("x2", x("Jamaica") - arrowlength+x.bandwidth() + 8)
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
                                .text("Jamaica")
                                .attr('transform','translate('+ (labelLine.attr("x2")-55-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1")              )+5) +")")
        

        arrowleft.transition()
                    .style('opacity',1)
                    .duration(1000)


        // highlight difference

        var difference = chart.append('g')
            .attr('class','difference')
            .style('opacity',0)
            .append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Tuvalu")-(x.bandwidth())*2))
            .attr("y1", y(tuvalu.pos_at_max_dist))
            .attr("x2", (x("Tuvalu")-(x.bandwidth())*2))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')

        d3.select('.difference').transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Tuvalu")-(x.bandwidth())*2))
            .attr("y1", y(tuvalu.pos_at_max_dist))
            .attr("x2", (x("Tuvalu")))
            .attr("y2", y(tuvalu.pos_at_max_dist))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Tuvalu")-(x.bandwidth())*2))
            .attr("y1", y(100))
            .attr("x2", (x("Tuvalu")))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        var diff = round((100 - tuvalu.pos_at_max_dist),2)

        d3.select('.difference')
            .append('text')
            .text(diff+"m")
            .attr("class","label-text")
            .attr('transform','translate(' + ( x("Tuvalu")-(x.bandwidth()*7)-45) + "," + y(parseFloat(tuvalu.pos_at_max_dist)+parseFloat(diff/2)) +")")
    }

    function tenthSlide(){
        $('.text').html(share)
        $('.arrow, .difference').remove()
        d3.selectAll('.bar')
            .transition()
            .style('fill',function(e){
                return colorRange(e['Continent'])
            })
            .duration(1000)
    }

    // MISC

    function appendRefLine(val){
        var refline = chart.append('g')
                            .attr('class', 'refline')

        refline.append('line')
                        .attr("y1", y(val))
                        .attr("x1", 0)
                        .attr("y2", y(val))
                        .attr("x2", box.width)

        refline.append('text')
                .attr('class','label-text shadow')
                .text('India')
                .attr('transform','translate('+ (box.width-140) +","+ y(val-0.5) +")")

        refline.append('text')
                .attr('class','label-text')
                .text('India')
                .attr('transform','translate('+ (box.width-140) +","+ y(val-0.5) +")")


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
        } else if (pos == 10){
            tenthSlide()
        }
        updateText(pos)
        return pos
    }

    $('.steps').width((100/steps.length)*1+"%")


    function updateText(pos){
        if (pos!=steps.length){
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
            }
            console.log(pos)
            $('.steps').width((100/steps.length)*pos+"%")
    }

    function resetOpacity(){
        d3.selectAll('.bar')
            .transition()
            .style('opacity',1)
            .duration(1000)
    }

    function hideRefLine(){
        d3.select('.refline')
            .transition()
            .style('opacity',0)
            .duration(1000)
    }

    function showRefLine(){
        d3.select('.refline')
            .transition()
            .style('opacity',1)
            .duration(1000)
    }
})
