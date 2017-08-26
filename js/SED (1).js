//Makes sure the proper libraries are in on the page
document.write(
     unescape("%3Cscript src='https://cdn.plot.ly/plotly-latest.min.js' type='text/javascript'%3E%3C/script%3E")
   );

var number = [], OPassband = [], PMeasurement = [], Uncertainty = [], Units = [], Frequency = [], NEDMeasurement = [],
    NEDUncertainty = [], NEDUnits = [], Refcode = [], Significance = [], PFrequency = [], FMode = [], CTargeted = [],
    SMode = [], Qualifiers = [], Comments = [];
var lengthCounter, lengthCounter2, lengthCounterTotal, searchstring;

var xtemp = [], ytemp = [], typetemp = [], errorBartemp = [], xlinetemp = [], ylinetemp = [];
var xWork = [], yWork = [], typeWork = [], errorBarWork = [], xlineWork = [], ylineWork = [];
var xWavelengthWork = [], xlineWavelengthWork = [], ySIWork = [], yJyHzWork = [], yWMWork = [], ylineWMWork = [],
errorBarSIWork = [], errorBarJyHzWork = [], errorBarWMWork = [];


var x = [], y = [], type = [], errorBar = [],
xline = [], yline = [], xWavelength = [], xlineWavelength = [], ySI = [],
yJyHz = [], yWM = [], ylineWM = [], errorBarSI = [], errorBarJyHz = [], errorBarWM = [], errorBarNull = [];

var data = [];
var TotalTraces = 0;
var InputValue;
var SEDName = [];
var TraceCounter = 0;
var OptionsCounter = 0;
var TraceArray = [0];
var SpectralArray = [];
var XInitial, YInitial, ErrorInitial, XAxisCurrent, YAxisCurrent;
var errorBarline = [], errorBarSIline = [], errorBarlineWork = [], errorBarSIlineWork = [];




function InitialPlot(GalaxyName){
  $("#request-box").fadeOut();
  $("#loading").fadeIn();
  InputValue = GalaxyName.toLowerCase().replace(/\s/g, '');
  // var InputValue = "arp220";
  $.ajax({
    type: "GET",
    url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'https%3A%2F%2Fned.ipac.caltech.edu%2Fcgi-bin%2Fdatasearch%3Fobjname%3D" + InputValue + "%26meas_type%3Dbot%26ebars_spec%3Debars%26label_spec%3Dno%26x_spec%3Dfreq%26y_spec%3DFnu_jy%26xr%3D-1%26of%3Dxml_main%26search_type%3DPhotometry'&diagnostics=true",
    dataType: "xml",
    success: xmlParser,
  });

}

function xmlParser(xml){
  var data = [];
    $(xml).find("TR").each(function(idx, v) {
        data[idx] = [];
        $(v).find("TD").each(function( i , vi) {
            data[idx].push( $(vi).text() );
        });
    });
    if(data == 0){
      alert("No SED Data. Please reload page.");
    }

    for(var i = 0; i < data.length; i++){
      //Table Data
      SEDName.push(InputValue.toUpperCase());
      OPassband.push(data[i][1]);
      PMeasurement.push(data[i][2]);
      Uncertainty.push(data[i][3]);
      Units.push(data[i][4]);
      Frequency.push(data[i][5]);
      NEDMeasurement.push(data[i][6]);
      NEDUncertainty.push(data[i][7]);
      NEDUnits.push(data[i][8]);
      Refcode.push(data[i][9]);
      Significance.push(data[i][10]);
      PFrequency.push(data[i][11]);
      FMode.push(data[i][12]);
      CTargeted.push(data[i][13]);
      SMode.push(data[i][14]);
      Qualifiers.push(data[i][15]);
      Comments.push(data[i][16]);
    }
      lengthCounter2 = OPassband.length;
    for(var i = 1; i <= data.length; i++){
      number[i-1] = i;
    }
    LoadPlot();
    $("#loading").fadeOut();
    OptionsCounter = TotalTraces;
    SpectralArray.push(0);
}



//---------------------Splits x and y broad-band and line points----------------------//
function LineSplit(){
  for(var i = 0; i < typeWork.length; i++){
    if (
      typeWork[i] == ' Line measurement; flux integrated over line; lines measured in emission'
      ||
      typeWork[i] == ' Line measurement; flux integrated over line'
    ){
      delete xWork[i];
      delete xWavelengthWork[i];
      delete yWork[i];
      delete ySIWork[i];
      delete yJyHzWork[i];
      delete yWMWork[i];
      errorBarWMWork[i] = errorBarWork[i] * Math.pow(10, -26);
      errorBarJyHzWork[i] = errorBarWork[i];
      errorBarSIWork[i] = errorBarWMWork[i];

      errorBarlineWork[i] = errorBarWork[i];
      errorBarSIlineWork[i] = errorBarWork[i] * Math.pow(10, -26);

    }else{
      delete xlineWork[i];
      delete ylineWork[i];
      delete ylineWMWork[i];
    }
  }
}
//---------------------Parses the ErrorBar Values and creates ErrorBarNull----------------------//
function ErrorBarParse(){
  //filters out the strings and removes "+/- syntax"
 for(var i = 0; i < errorBarWork.length; i++){
   if(errorBarWork[i] === undefined){
     errorBarWork[i] = "";
   }
    errorBarWork[i] = errorBarWork[i].replace("+/-",""); //removes "+/-"
    errorBarNull.push(0);
 }
}
//---------------------Computes both errorbar values and unit change values----------------------//
function UnitConversions(){
  for(var i = 0; i < xWork.length; i++){
   xWavelengthWork[i] = (299792458/xWork[i]) * 1000000;
   xlineWavelengthWork[i] = (299792458/xlineWork[i]) * 1000000;

   ySIWork[i] = yWork[i] * Math.pow(10, -26);
   errorBarSIWork[i] = errorBarWork[i] * Math.pow(10, -26);

   yJyHzWork[i] = yWork[i] * xWork[i];
   errorBarJyHzWork[i] = errorBarWork[i] * xWork[i];

   yWMWork[i] = ySIWork[i] * xWork[i];
   ylineWMWork[i] = ylineWork[i] * Math.pow(10, -26);
   errorBarWMWork[i] = errorBarSIWork[i] * xWork[i];
 }
}
function RemoveUndefined(input){
  for(var i = 0; i < input.length; i++){
    if(input[i] === undefined){
       delete input[i];
    }
  }
}

function LoadData(){
  RemoveUndefined(xWork);
  RemoveUndefined(xWavelength);
  RemoveUndefined(yWork);
  RemoveUndefined(ySIWork);
  RemoveUndefined(yJyHzWork);
  RemoveUndefined(yWMWork);
  RemoveUndefined(errorBarWork);
  RemoveUndefined(errorBarSIWork);
  RemoveUndefined(errorBarJyHzWork);
  RemoveUndefined(errorBarWMWork);
  RemoveUndefined(xlineWork);
  RemoveUndefined(ylineWork);
  RemoveUndefined(xlineWavelengthWork);
  RemoveUndefined(ylineWMWork);
  RemoveUndefined(errorBarlineWork);
  RemoveUndefined(errorBarSIlineWork);

  x.push(xWork);
  xWavelength.push(xWavelengthWork);
  y.push(yWork);
  ySI.push(ySIWork);
  yJyHz.push(yJyHzWork);
  yWM.push(yWMWork);
  errorBar.push(errorBarWork);
  errorBarSI.push(errorBarSIWork);
  errorBarJyHz.push(errorBarJyHzWork);
  errorBarWM.push(errorBarWMWork);

  for(var i = 0; i < xlineWork.length; i++){
    xline.push(xlineWork[i]);
    yline.push(ylineWork[i]);
    xlineWavelength.push(xlineWavelengthWork[i]);
    ylineWM.push(ylineWMWork[i]);
    errorBarline.push(errorBarlineWork[i]);
    errorBarSIline.push(errorBarSIlineWork[i]);
  }
  RemoveUndefined(yline);
  RemoveUndefined(ylineWM);
  RemoveUndefined(errorBarline);
  RemoveUndefined(errorBarSIline);
}

function CreateTrace(){
  var trace = {
    mode: 'markers',
    type: "scatter",
    name: InputValue,
    text: number,
    // marker:{color: 'rgb(0,0,139)'},
    //
    // marker: {symbol: 'circle-open'},
    x: xWork,
    y: yWork,
    error_y: {
      type: 'data',
      array: errorBarWork,
      visible: true,
      thickness: 1,
      // color: 'rgb(0,0,139)'
    },
  };
  data.push(trace);
  TotalTraces = TotalTraces + 1;
}














function LoadPlot(){
      xWork = Frequency.slice();
      yWork = NEDMeasurement.slice();
      typeWork = FMode.slice();
      errorBarWork = NEDUncertainty.slice();
      xlineWork = Frequency.slice();
      ylineWork = NEDMeasurement.slice();

//ErrorBar Function
ErrorBarParse();
//Unit Conversions for SED Points
UnitConversions();
//splits the lines from the SED points
LineSplit();
//pushes the array of data into function
LoadData();
//Creates object and appends to graph
CreateTrace();

//Graph axis related things
var layout = {
  title: 'Spectral Energy Distribution (SED) for ' + InputValue.toUpperCase(),
  titlefont: {
    color: 'black',
  },
  xaxis: {
    title: 'log(<em>v</em> [Hz])',
    type:'log',
    autorange: true,
    linecolor: 'black',
    linewidth: 2,
    mirror: true,
    ticks: 'inside',
    ticklen: 10,
    tickwidth: 2,
    exponentformat: "power",
    color: '#444'
    },
  yaxis: {
    title: 'log(F<sub><em>v</em></sub> [Jy])',
    type:'log',
    autorange: true,
    linecolor: 'black',
    linewidth: 2,
    mirror: true,
    ticks: 'inside',
    ticklen: 10,
    tickwidth: 2,
    exponentformat: "power",
    color: '#444'
    },
  margin: {t: 50},
  hovermode: false,
  plot_bgcolor: '#fff',
  paper_bgcolor: '#fff',
  legend: {
    bgcolor: 'rgba(0,0,0,0)',
    orientation: 'h',
    font: {
      color: 'black',
    }
  }
};





//----------------Make Plotly Responsive-----------------//
//----------------Edits the CSS in the div---------------//
var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 100;

Plotly.d3.select('#GalaxySED')
    .style({
        width: WIDTH_IN_PERCENT_OF_PARENT + '%',
        height: HEIGHT_IN_PERCENT_OF_PARENT + '%',
    });
var gd = Plotly.d3.select('#GalaxySED').node();

window.onresize = function() {
    Plotly.Plots.resize(gd);
};
//-----------------END Responsive code-------------------//

//Calls the plot into HTML
Plotly.newPlot(gd, data, layout, {displayModeBar: false});
};
