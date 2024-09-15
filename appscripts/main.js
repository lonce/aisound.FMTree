/*
Inspired by this video: https://www.youtube.com/watch?v=DpwUVExX27E
On using the Stern-Brocot sequence to iterate efficiently through all rational numbers. 
*/
//import sndFactory from 'http://localhost:8000/aiSounds/fm2.js'
//import aiSlider from 'http://localhost:8000/aisInterface/aiSlider.js'

import sndFactory from 'https://aisound.sonicthings.org/aiSounds/fm2.js'
import aiSlider from 'https://aisound.sonicthings.org/aisInterface/aiSlider.js'


//--------------------------
//var audioCtx = new AudioContext();
//var snd = sfactory(audioCtx);

var snd;
var sliderDiv=document.createElement('div');  // append later, after drawing FM tree

sndFactory().then((newsnd) => {
  snd=newsnd; 

  // Set min and max, then we can use aiSliders which call setParamNorm
  snd.setParam("Carrier Frequency", 100, "min");
  snd.setParam("Carrier Frequency", 400, "max");
  snd.setParam("Modulation Index", 0, "min");
  snd.setParam("Modulation Index", 400, "max")

  snd.cf = 330;
  snd.setParam("Carrier Frequency", snd.cf)
  snd.mf_ratio;
  snd.mi = 100;
  snd.setParam("Modulation Index", snd.mi)
  snd.setParam("Gain", .5)

  sliderDiv.appendChild(aiSlider(snd, "Carrier Frequency", window));
  sliderDiv.appendChild(document.createElement('br'));
  sliderDiv.appendChild(aiSlider(snd, "Modulation Index", window));

});


var activeNode=null; //which node is responsible for playing the sound
//--------------------------

console.log("yo, I'm alive!");
var static_xmlns = "http://www.w3.org/2000/svg"


//document.addEventListener('DOMContentLoaded', function() {

console.log("loaded");
var bg = document.getElementById("svg_div")

//var svgelmt = document.getElementById("svg_area");
var svgelmt = document.createElementNS(static_xmlns, 'svg');
svgelmt.setAttribute('width', '1000');
svgelmt.setAttribute('height', '400');
svgelmt.setAttribute('id', 'svg_area');
svgelmt.setAttribute('fill', 'none');
bg.appendChild(svgelmt);

console.log("svgelmt is " + svgelmt)

var m_height = parseFloat(svgelmt.getAttribute("height"));
var m_width  = parseFloat(svgelmt.getAttribute("width"));


console.log("svgelmet width is  " + m_width);
console.log("svgelmet height is  " + m_height);

svgelmt.addEventListener("mousedown", function(ev){
        console.log("mouse down on bg : " + ev.offsetX + "," + ev.offsetY)
});

          //------------------------------------------

var makeText=function(x,y,label){
  var newText = document.createElementNS(static_xmlns,"text");
  newText.setAttributeNS(null,"x",x);      
  newText.setAttributeNS(null,"y",y);  
  newText.setAttributeNS(null,"pointer-events",'none'); // clicks pass through text to what's underneath
  //newText.setAttributeNS(null,"textLength",'30');
  //newText.setAttributeNS(null,"style", 'font: italic 11px serif; fill: white; text-anchor: middle; writing-mode: vertical-rl; text-orientation: upright; ' );
  newText.setAttributeNS(null,"style", 'font: italic 11px serif; fill: white; text-anchor: middle;' );
  newText.innerHTML=label
  return(newText)

}

var highlightButt=function(butt, val){
  if (val == 1){
      butt.setAttributeNS(null, 'style', 'fill: blue; stroke: white; stroke-width: 4px;' );
    } else {
      setTimeout(function(){
        butt.setAttributeNS(null, 'style', 'fill: blue; stroke: blue; stroke-width: 1px;' );
      }, 100)
    }
}

var makeCircle=function(x,y,r,id){
  var circle = document.createElementNS(static_xmlns, 'circle');  
  circle.setAttributeNS(null, 'cx', x);
  circle.setAttributeNS(null, 'cy', y);
  circle.setAttributeNS(null, 'r', r);
  circle.setAttributeNS(null, 'id', id); 
  circle.setAttributeNS(null, 'style', 'fill: blue; stroke: blue; stroke-width: 1px;' );

  circle.addEventListener("mousedown",function(e){
    if (activeNode != null){
      highlightButt(activeNode, 0);
    }
    snd.cf=snd.getParam("Carrier Frequency")
    activeNode=e.target;
    snd.mf_ratio=activeNode.ninfo.num/activeNode.ninfo.den;
    console.log(`num=${activeNode.ninfo.num} and den = ${activeNode.ninfo.den} so will set ratio to ${snd.mf_ratio}`)
    console.log(    `so cf = ${snd.cf} and mf = ${snd.cf/snd.mf_ratio}`)
    snd.setParam("Modulation Frequency", snd.cf/snd.mf_ratio)
    snd.play();
    highlightButt(e.target, 1);
    //playBtn.pushed=true;
    //playBtn.setAttribute('value', 'release');
  });

  circle.addEventListener("mouseup",function(e){
    snd.release();
    highlightButt(e.target, 0);
    activeNode=null;
    //playBtn.pushed=true;
    //playBtn.setAttribute('value', 'release');
  });

  return circle;
}



var drawLine=function(n1,n2){
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke', 'red')
  path.setAttribute('width', '4')
  //path.setAttribute('d','M100,0 L200,100 100,200 0,100Z');
  path.setAttribute('d', 'M'+ n1.x +','+n1.y+' L'+n2.x +','+n2.y+' Z')
  //path.setAttribute('fill','red');
  svgelmt.appendChild(path);
}


var makeTree=function(levels, svgelmt){
  var m_height = parseFloat(svgelmt.getAttribute("height")*2/3);
  var m_width  = parseFloat(svgelmt.getAttribute("width"));
  var hspacing=m_height/levels;

  var nodedict={}


  var makeChildren=function(pidx){
    let level=pidx.length;
    if (level == levels) return;
    let wspacing=m_width/(Math.pow(2,level));

    var bs;

    bs=pidx+"0"
    nodedict[bs]={bs: bs, x: nodedict[pidx].x-wspacing/2, y: nodedict[pidx].y+hspacing, num: nodedict[pidx].num, den: (nodedict[pidx].num + nodedict[pidx].den)}
    drawLine(nodedict[pidx], nodedict[pidx+"0"])
    makeChildren(bs);

    bs=pidx+"1"
    nodedict[bs]={bs: bs, x: nodedict[pidx].x+wspacing/2, y: nodedict[pidx].y+hspacing, den: nodedict[pidx].den, num: (nodedict[pidx].num + nodedict[pidx].den)}
    drawLine(nodedict[pidx], nodedict[pidx+"1"])
    makeChildren(bs);
  }
  nodedict["0"]={x: m_width/2, y: +hspacing/2, num:1, den: 1}
  makeChildren("0")
  return nodedict
}


var nodedict=makeTree(6,svgelmt);

for (var pidx in nodedict) {
  var c;
  if (nodedict.hasOwnProperty(pidx)) {
    c=makeCircle(nodedict[pidx].x, nodedict[pidx].y, 15, pidx)
    c.ninfo=nodedict[pidx]
    svgelmt.appendChild(c)
    svgelmt.appendChild(makeText(nodedict[pidx].x, nodedict[pidx].y, nodedict[pidx].num + "/"  + nodedict[pidx].den))
  }
}


bg.appendChild(sliderDiv)

