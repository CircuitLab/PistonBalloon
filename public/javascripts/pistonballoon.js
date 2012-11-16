$(function() {
  var socket = io.connect();
  console.log('connected : ', socket);
/*  -> function pump() 
  $('input#go').on('click', function(e) {
    socket.emit('go');
  });
*/

socket.on('turnOn', function() {
  console.log('turn on switch.');
  //  $('#go').attr('disabled', false);
  pumpTurnOn();
});

socket.on('turnOff', function() {
  console.log('turn off switch.');
  //  $('#go').attr('disabled', true);
  pumpTurnOff();
});

socket.on('tick', function() {
  console.log('tickin\'');
});

socket.on('pump', function(data) {
  pumpNumber = data;
  console.log(pumpNumber);
  pumpNum(pumpNumber);
});


  /*
   *display
   */
   var width = 400,
   height = 400,
   radius = Math.min(width, height) / 2,
   data = d3.range(20).map(Math.random).sort(d3.descending),
   color = d3.scale.linear()
     .domain([0, 4, 20])
     .range(["green", "yellow", "red"]),
   pumpColor = d3.scale.linear()
     .domain([0, 1])
     .range(["white","dimgray"]),
   arc = d3.svg.arc().outerRadius(radius),
   arc2 = d3.svg.arc().outerRadius(radius * 0.6).innerRadius(radius * 0.55),
   donut = d3.layout.pie(),
   buttonData =  [ 70, 68, 66, 64, 62, 60 ]
   donut2 = d3.layout.pie()
     .sort(null)
     .value(function(d) { return d; }),
   canPush = false,
   circleText = "wait...",
   pumpNumber = 0,
   maxPumpNumber = 200;  //max 
   pumpData = [ pumpNumber, maxPumpNumber - pumpNumber];




  //show outside pattern  

  var vis = d3.select("body").append("svg")
    .data([data])
    .attr("width", width)
    .attr("height", height)
    .style("margin","50px 0");  

  var arcs = vis.selectAll("g.arc")
    .data(donut)
    .enter().append("g")
    .attr("class", "arc")
    .attr("transform", "translate(" + radius + "," + radius + ")");


  var paths = arcs.append("path")
    .attr("fill", function(d, i) { return color(i); });

  //show title

  var title = vis.append("text")
    .attr("x", 20)
    .attr("y", 15)
    .attr("font-size", "15")
    .attr("fill","#ddd")
    .text("PistonBalloon")
    .on("click", pumpTurnOn);


  //show pumpData gauge
  var g = vis.selectAll("arc2")
    .data(donut2(pumpData))
    .enter().append("g")
    .attr("class", "arc2")
    .attr("transform", "translate(" + radius + "," + radius + ")");

  var paths2 = g.append("path")
    .attr("d", arc2)
    .attr("opacity",0)
    .style("fill", function(d, i) { return pumpColor(i); })
    .each(function(d) { this._current = d; console.log(this._current);});

  paths2.transition()
    .attr("opacity",1)
    .ease("bounce")
    .delay(2000)
    .duration(3000)
    .attrTween("d", tweenPie2);

  function tweenPie2(b) {
   // console.log(this._current);
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) {
      return arc2(i(t));
  };
}

function tweenPie3(b) {
    //console.log(this._current);
    var i = d3.interpolate(this._current, b);
    this._current = i(0);
    return function(t) {
      return arc2(i(t));
    };
  }





  //button in the center

  var circles = vis.selectAll("circle")
    .data(buttonData)
    .enter()
    .append("circle")
    .attr("cx", 200)
    .attr("cy", 200)
    .attr("r", 0)
    .attr("fill", function(d,i) {
      return "rgb(0,0," + (i * 40 + 100) + ")";
    })
    .on("click", pump);

  circles.transition()
    .ease("exp")
    .delay(function(d, i) { return 1500 + i * 50; })
    .duration(1000)
    .attr("r", function(d) {
      return d;
    })
    ;

  setInterval(changeCirclesRadius, 4000);

  function changeCirclesRadius(){
   circles.transition()
     .ease("sin")
     .duration(2000)
     .attr("r", function(d) {
      return d * 1.05;
     });

   circles.transition()
     .ease("sin")
     .delay(2000)
     .duration(2000)
     .attr("r", function(d) {
       return d;
     });
  }



  // text in the button
  var push = vis.append("text")
    .attr("x", 152)
    .attr("y", 207)
    .attr("font-size", "20")
    .attr("fill","#fff")
    .attr("opacity",0)
    .text(circleText)
    .on("click", pump);


  push.transition()
    .ease("quad")
    .delay(1500)
    .duration(2000)
    .attr("opacity", 0.8);

  // the snumber on pumps
  var counter = vis.append("text")
    .attr("x", 192)
    .attr("y", 120)
    .attr("font-size", "22")
    .attr("fill","#fff")
    .attr("opacity",0)
    .text(pumpNumber)
    ;

  counter.transition()
    .ease("quad")
    .delay(1600)
    .duration(2000)
    .attr("opacity", 0.8);

  function pump() {
    if(canPush){
     vis.append("circle")
       .attr("cx", 200)
       .attr("cy", 200)
       .attr("r", 1e-6)
       .attr("opacity", 1)
       .transition()
       .duration(1000)
       .ease(Math.sqrt)
       .attr("r", 80)
       .attr("opacity", 1)
       .transition()
       .delay(1000)
       .duration(500)
       .ease(Math.sqrt)
       .attr("opacity", 0)
       .remove();

     circles.transition()
       .ease("exp")
       .delay(function(d, i) { return i * 50; })
       .duration(200)
       .attr("r", function(d) {
         return d * 1.6;
       })
       .transition()
       .delay(function(d, i) { return 200+i * 50; })
       .duration(200)
       .attr("r", function(d) {
         return d * 1;
       });
     
     socket.emit('go');
     console.log('emit go');
   }
 }

 function pumpTurnOff(){
  canPush = false;
  circles.transition()
    .ease("bounce")
    .duration(2000)
    .attr("fill", function(d,i) {
      return "rgb(0,0," + (i * 40 + 100) + ")";
    });
  circleText = "wait..."
  push.transition()
    .text(circleText);
} 

function pumpTurnOn(){
  canPush =true;
  circles.transition()
    .ease("bounce")
    .duration(2000)
    .attr("fill", function(d,i) {
      return "rgb(" + (i * 40 + 100) + ",0,0)";
    });
  circleText = "push";
  push.transition()
    .text(circleText);

}

function pumpNum(num){
  if(canPush){
    pumpNumber = num;
    if(pumpNumber >= maxPumpNumber ){
      pumpNumber = maxPumpNumber;
      　　
      circles.transition()
        .ease("exp")
        .duration(1000)
        .attr("opacity",0);

      push.transition()
        .ease("quad")
        .duration(2000)
        .attr("opacity", 0);

      g.transition()
        .ease("quad")
        .duration(2000)
        .attr("opacity", 0);

      paths.transition()
        .ease("elastic")
        .delay(function(d, i) { return 1500 + i * 50; })
        .duration(750)
        .attrTween("d", tweenDonut3)
        ;

    }


    pumpData = [ pumpNumber, maxPumpNumber - pumpNumber]
    
    paths2.data(donut2(pumpData)) ;
    paths2.transition()
      .ease("elastic")
      .duration(1000)
      .attrTween("d", tweenPie3);

    counter.transition()
     .text(pumpNumber);
  }
}



paths.transition()
  .ease("exp")
  .duration(1000)
  .attrTween("d", tweenPie);

paths.transition()
  .ease("elastic")
  .delay(function(d, i) { return 1000 + i * 50; })
  .duration(750)
  .attrTween("d", tweenDonut)
  ;

paths.transition()
  .ease("elastic")
  .delay(function(d, i) { return 2000 + i * 50; })
  .duration(750)
  .attrTween("d", tweenDonut2)
  ;


function tweenPie(b) {
  b.innerRadius = radius * .4;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
  return function(t) {
    return arc(i(t));
  };
}

function tweenDonut(b) {
  b.innerRadius = radius * .9;
  var i = d3.interpolate({innerRadius: 0}, b);
  return function(t) {
    return arc(i(t));
  };
}

function tweenDonut2(b) {
  b.innerRadius = radius * .7;
  var i = d3.interpolate({innerRadius: 0}, b);
  return function(t) {
    return arc(i(t));
  };
}
function tweenDonut3(b) {
  b.innerRadius = radius * 0;
  var i = d3.interpolate({innerRadius: 0}, b);
  return function(t) {
    return arc(i(t));
  };
}




});
