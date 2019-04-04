define([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "dojo/_base/declare",
  "dojo/promise/all",
], function(WebScene, SceneView, FeatureLayer, declare, all) {

  const WebSceneManager = declare(null, {

    views: [],
    layerViews: [],
    rotating: false,
    viewsLoaded: 0,
    layerViewLoaded: [],

    createScene: function(colors, container) {
      const webscene = new WebScene({
        portalItem: {
          id: "c894a37c07124bfcbe1ae60ba757f63e"
        }
      });

      const countryBoundaries = new FeatureLayer({
        url: "http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer",
        title: "World Countries",
        renderer: {
          type: "simple",
          symbol: {
            type: "polygon-3d",
            symbolLayers: [{
              type: "fill",
              material: { color: colors[2] },
              outline: {
                color: colors[2]
              }
            }]
          }
        }
      });

      webscene.add(countryBoundaries);

      const view = new SceneView({
        container: container,
        map: webscene,
        ui: {
          components: []
        }
      });

      this.layerViewLoaded.push(
        view.whenLayerView(countryBoundaries)
        .then((layerView) => {
          this.layerViews.push(layerView);
        })
      );

      view.when(() => {
        view.environment.background.color = colors[0];
        webscene.ground.surfaceColor = colors[1];
        this.viewsLoaded += 1;
      });

      this.views.push(view);
    },

    changeHue: function(angle){
      this.views.forEach(function(view) {
        view.container.setAttribute("style", "filter:hue-rotate(" + angle + "deg)");
      });
    },

    rotate: function() {
      this.rotating = !this.rotating;
      if (this.viewsLoaded == 4) {
        this.views.forEach((view) => {
          this.animate(view);
        });
      }
    },

    animate: function(view){
      if (this.rotating) {
         const camera = view.camera.clone();
         camera.position.longitude -= 1;
         view.goTo(camera);
         requestAnimationFrame(() => {this.animate(view);});
        }
    },

    onFinishLoad: function(callback) {
      let loaded = [false, false, false, false];
      all(this.layerViewLoaded)
        .then(() => {
          this.layerViews.forEach((layerView, i) => {
            layerView.watch("updating", (value) => {
              if (!value) {
                loaded[i] = true;
              }
              if (loaded[0] && loaded[1] && loaded[2] && loaded[3]) {
                callback();
              }
            });
          });
        });
    }
  });

  return WebSceneManager;

});
