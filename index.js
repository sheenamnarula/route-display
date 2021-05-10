const express = require("express");
const app = express();
const Mustache = require("mustache");
const server = async () => {
  app.get("/", async function (req, res) {
    Mustache.clearCache();
    app.set("view engine", "mustache");

    const csvFilePath = "data.csv";
    const csv = require("csvtojson");
    let jsonArray = await csv().fromFile(csvFilePath);

    jsonArray = JSON.stringify(jsonArray);
    res.setHeader("content-type", "text/html");

    res.status(200).send(
      Mustache.render(
        [
          `
<!DOCTYPE html>
<html>
  <head>
    <title>Route Display</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

    <style type="text/css">
    #map {
        height: 100%;
      }
            html,
      body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      
    </style>
    <script type="text/javascript">

    let data = ${jsonArray}

    let start = {}

    function handleOnChange(dateElem){
      let selectedDate;
      if(!dateElem){
        selectedDate = data[0].createdAt.split(" ")[0]
      }else {
      selectedDate = dateElem.value ;
      }
      let latLngArr =[]
      data.map((elem)=>{
          
          if(elem.createdAt.includes(selectedDate)){
              latLngArr.push({lat : parseFloat(elem.lat), lng: parseFloat(elem.long)}) 
          }
      })
       start = latLngArr.shift()
      initMap(latLngArr,start)
    }

    function initMap(latLngArr,start) {
    let datesPushed = []
    for (i = 0; i < data.length; i++) {
      if(!datesPushed.includes(data[i].createdAt.split(" ")[0])){
        datesPushed.push(data[i].createdAt.split(" ")[0])
        $("#selectId").append("<option>" + data[i].createdAt.split(" ")[0] + "</option>");
      }
    }
    const map = new google.maps.Map(document.getElementById("map"), {
      center: 
      start,
      zoom: 6,
      mapTypeId: "terrain",
    });
  
    const lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: "#393",
    };
    
    const line = new google.maps.Polyline({
      path: latLngArr,
      icons: [
        {
          icon: lineSymbol,
          offset: "100%",
        },
      ],
      map: map,
    });
    animateCircle(line);
    latLngArr = []
  }

  function animateCircle(line) {
    let count = 0;
    window.setInterval(() => {
      count = (count + 1) % 200;
      const icons = line.get("icons");
      icons[0].offset = count / 2 + "%";
      line.set("icons", icons);
    }, 300);
  }

    </script>
  </head>
  <body style="height:100%;margin:0;padding:0;">
  <label for="dates">Select date for route:</label>
  <select id=selectId onchange="handleOnChange(this)"></select>
  <br><br>
    <div style="height:100%;" id="map"> 
    </div>
    <!-- Async script executes immediately and must be after any DOM elements used in callback. -->
    <script
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDTy5nM522z31mZc-mChFN-UtMNVwJeNZw&callback=handleOnChange&libraries=&v=weekly"
    async
    ></script>
  </body>
</html>
`,
        ].join("\n")
      )
    );
  });

  app.listen(3000, "localhost", () => {
    console.log("http://localhost:3000");
  });
};

server().then(() => {
  console.log("server started at");
});
