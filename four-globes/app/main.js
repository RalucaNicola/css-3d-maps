require([
  "app/slider",
  "app/WebSceneManager"
], function (Slider, WebSceneManager) {

  var options = {
    snap: 45,
    clockwise: true,
    startPos: "top",
  }
  var slider = new Slider("slider", options);
  var targetDiv = document.getElementById("angle");

  slider.on("sliderMove", (angle) => {
    targetDiv.textContent = angle + "°";
    websceneManager.changeHue(angle);
  });

  const websceneManager = new WebSceneManager();

  websceneManager.createScene(["#FAA732", "#DE1770", "#5EADE1"], "view1");
  websceneManager.createScene(["#7F2C85", "#F8EB35", "#AE1B2A"], "view2");
  websceneManager.createScene(["#1FB8B5", "#EAECAA", "#612F91"], "view3");
  websceneManager.createScene(["#E2242D", "#106BAC", "#E5922B"], "view4");

  document.getElementById("rotate").addEventListener("click", function() {
    websceneManager.rotate();
  })

  websceneManager.onFinishLoad(() => {
    document.getElementById("rotate").style.display = "inherit";
    document.getElementById("slider").style.display = "inherit";
  })

});
