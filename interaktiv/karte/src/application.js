'use strict';
require('./leaflet.fusesearch.09e7508.css?modules=false');
require('./style.css?modules=false');
require('leaflet-responsive-popup/leaflet.responsive.popup.css?modules=false')


import {getEmbed} from './pymembed';
window.getEmbed = getEmbed;

import L from 'leaflet';
import LS from 'leaflet-sleep';
import URI from 'urijs';
import * as request from 'd3-request/index';
import * as format from 'd3-format/index';
import * as queue from 'd3-queue/index';
import * as scale from 'd3-scale/index';
import * as topojson  from 'topojson/index';
import './leaflet.fusesearch.09e7508';
import './leaflet.pattern.d543c9f';
import 'leaflet-responsive-popup';



import {maps} from './data';

import {legend} from './legend';

var last_json = null;
var last_data = null;
var last_layer = null;
var last_legend = null;
var layer_style = null;



var pymChild = new pym.Child();


format.formatDefaultLocale({decimal: ",", thousands: ".", grouping: [3], currency: ['€ ','']})
var numfmt = format.format(',d');
var pctfmt = format.format(',.2r');

var map = L.map('graph',
  {
    wakeMessage: 'Karte mit Klick aktivieren',
    wakeMessageTouch: 'Karte mit Berührung aktivieren',
    sleepOpacity: .95,
    hoverToWake: false,
    zoomSnap: 0.25
  });
map.zoomControl.setPosition('bottomright');
var searchCtrl = L.control.fuseSearch({maxResultLength: 6, placeholder: 'Gemeindesuche', title: 'Gemeindesuche'});


map.createPane('popup2',map._container);
map.on('move', function() {
  map._panes['popup2'].style.transform = map._mapPane.style.transform;
});






function change_map(MAP) {
  var colorlegend = legend[MAP.scale](MAP);
  if(MAP.baselayer) {
    MAP.baselayer().addTo(map).bringToBack();
  }
  Array.prototype.map.bind(document.querySelectorAll('h1')
    )((e) => e.innerHTML = PARAMS.bundesland && MAP.bundesland_title ? MAP.bundesland_title : MAP.title);
  Array.prototype.map.bind(document.querySelectorAll('footer .actual_source')
    )((e) => e.innerHTML = MAP.source);
  Array.prototype.map.bind(document.querySelectorAll('p.detail')
    )((e) => e.innerHTML = MAP.detail || '');
  Array.prototype.map.bind(document.querySelectorAll('body p.description')
    )((e) => e.innerHTML = MAP.description || '');

  if(PARAMS.link) {
    document.getElementsByTagName('h1')[0].innerHTML=`<a href="${PARAMS.link}" target="_blank">${document.getElementsByTagName('h1')[0].innerHTML}</a>`;
  }


  if(PARAMS.force_message || (PARAMS.bundesland && MAP.bundesland_message)) {
    document.querySelector('#bundesland_message').innerHTML = MAP.bundesland_message;
  }


  queue.queue()
    .defer(request.json, MAP.topojson)
    .defer(request[MAP.data.split('.').reverse()[0]], MAP.data)
    .await(function(error, topo, data){
      var os = topo.objects[Object.keys(topo.objects)[0]];

      layer_style = function(feature) {
              var r = {
                  color: 'white',
                  weight: L.Browser.retina?0.25:0.5,
                  opacity: 0.75,
                  fillOpacity: 0.75
                };
              var fill = feature.data?colorlegend.getColor(feature.data):{fillColor: 'lightgrey'};
              for(var k of Object.keys(fill)) {
                if(k=='fillPattern') {
                  fill[k].addTo(map);
                }
                r[k] = fill[k];
              }
              return r;
              };
      if(PARAMS.bundesland || MAP.bundesland) {
        os.geometries = os.geometries.filter((x) => x.properties.GKZ[0]==(PARAMS.bundesland||MAP.bundesland));
      }
      var tf = topojson.feature(topo, os);
      if(!last_layer || last_data!=MAP.data || last_json!=MAP.topojson) {
        var layer;
        layer = L.geoJson(
          tf, {
            smoothFactor: L.Browser.retina?0.5:1,
            onEachFeature: function(feature,thislayer) {
              feature.layer = thislayer;
              thislayer.on({
                'mouseover': (e) => {e.target.setStyle({weight: 1.5})},
                'mouseout': (e) => {e.target.setStyle(layer_style(feature))}
              });
            }
          });

        layer.addTo(map);
        last_layer = layer;
        last_data = MAP.data;
        last_json = MAP.topojson;
      }
      for(let [k,thislayer] of Object.entries(last_layer._layers)) {
        var feature = thislayer.feature;
        feature.data = data.filter((x) => x[MAP.data_key]==feature.properties[MAP.property_key]);

        var p = feature.properties;
        var d = feature.data;
        if(!d) {
          return;
        }
        thislayer.bindPopup(L.responsivePopup().setContent(
          MAP.tooltip(d,p,pctfmt,numfmt)
        ),{pane: 'popup2'});
      }
      last_layer.setStyle(layer_style);
      if(MAP.is_gemeinden) {
        var bm_key = (x) => PARAMS.bundesland?x.properties[MAP.property_key].slice(0,3):x.properties[MAP.property_key][0];
        var bm = topojson.mesh(topo,
          topo.objects[Object.keys(topo.objects)[0]],
            (a,b) => bm_key(a)!==bm_key(b)
        );
        var blayer = L.geoJson(
          [bm],
          {style: {fillColor: 'transparent',
            fillOpacity: 0, color: 'white', weight: 2, opacity: 1,
          attribution: 'Grenzen: cc-by Geoland.at, Wien.gv.at'}}
        );
        blayer.addTo(map);
      }

      if(MAP.search) {
        searchCtrl.indexFeatures(tf,MAP.search_keys);
        searchCtrl.addTo(map);
        document.getElementById('controls').appendChild(searchCtrl._container);
        searchCtrl._container.children[0].innerHTML=MAP.search_title;
        document.querySelector('a.button').style.visibility=MAP.search===false?'hidden':'visible';
      }


      if(last_legend) {
        last_legend.remove();
      }
      colorlegend.addTo(map);
      last_legend = colorlegend;

      var b = last_layer.getBounds()
      map.fitBounds(b, {
        paddingTopLeft: [0,60],
        paddingBottomRight: [0,25],
        animate: false
      });
      map.setMaxBounds(map.getBounds().pad(5));
      map.options.minZoom = map.getZoom()-0.5;
      map.fire('zoomend');

      pymChild.sendHeight();
  });

}


var PARAMS = URI.parseQuery(document.location.search)
var MAP = maps[PARAMS.map];
if(MAP) {
  change_map(MAP);

  /*
  setTimeout(() => {
    setInterval(() => change_map(maps['kindergaerten']), 10000);
  },5000)
  setInterval(() => change_map(maps['kindergaerten2']), 10000);
  */
}

(() => {
  var popup_highlight = null;
  var popup_line = null;

  map.on('popupopen', function(e) {
    if(popup_highlight) {
      map.removeLayer(popup_highlight);
      popup_highlight=null;
    }
    if(popup_line) {
      map.removeLayer(popup_line);
      popup_line=null;
    }
    if(map._container.clientWidth<500) {
      document.getElementById('info').innerHTML = e.popup._content;
      document.getElementById('info').style.maxHeight = 999+'px';
      map.closePopup();
      var t = map.containerPointToLatLng([map._size.x/2, 0]);
      popup_line = L.polyline([[e.popup._latlng.lat,e.popup._latlng.lng],
        t], {color: '#f1f1f1',weight: 2, opacity: 0.7}).addTo(map);
      if(MAP.search) {
        document.querySelector('a.button').scrollIntoView();
      }
      pymChild.scrollParentToChildPos(
        document.getElementById('info').getBoundingClientRect().top + window.pageYOffset - 125
      );
    } else {
      document.getElementById('info').innerHTML = '';
      document.getElementById('info').style.maxHeight = "0";
    }
    popup_highlight = L.geoJson(
      e.popup._source.feature.layer.toGeoJSON(),
      {style: {weight: 1.75, color: 'white', fillColor: 'transparent'}}).addTo(map);
    pymChild.sendHeight();
  });
  map.on('popupclose', function(e) {
    if(map._container.clientWidth<500){
      return;
    }
    if(popup_highlight) {
      map.removeLayer(popup_highlight);
    }
    if(popup_line) {
      map.removeLayer(popup_line);
    }
  });
  map.on('move', (e) => {
    if(popup_line) {
      map.removeLayer(popup_line);
      popup_line=null;
    }
  });
})();


window.addEventListener('resize', function() {
  pymChild.sendHeight();
})

module.exports = {change_map: change_map, maps: maps};
