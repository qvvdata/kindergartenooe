import L from 'leaflet';
import * as d3scale from 'd3-scale';


var legend = {};

legend['manual-bivariate'] = function(MAP) {
    var legend = L.control({position: 'topleft'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend multivariate');

        // loop through the status values and generate a label with a coloured square for each value
        div.innerHTML = `<p class="title">&nbsp;${MAP.value[0]}</p>`+ MAP.order[1].map(
        (x,i) => {
            return MAP.order[0].map((y,j) => {
                return `<span style="background: ${MAP.colorschemes[j][i]}"></span>`;
            }).join('')+` ${MAP.order[0][i]}`;
        }).join('<br />') + '<br />⟶&#xfe0e; ' + MAP.value[1];
        return div;
    };


    legend.getColor = function(data) {
        var v1 = MAP.order[0].indexOf(data[MAP.value[0]]);
        var v2 = MAP.order[1].indexOf(data[MAP.value[1]]);

        return MAP.colorschemes[v2][
              v1
              ];
    };

    return legend;
};
legend['category-multi'] = function(MAP) {
    var legend = L.control({position: 'topleft'});
    var scale = d3scale.scaleOrdinal(MAP.colorschemes[0]);
    if(MAP.categories) {
        scale = scale.domain(MAP.categories);
    }
    var patterns = {};

    legend.onAdd = function (map) {
        if(MAP.categories) {
            for(var e of document.querySelectorAll('span.scalevalue')) {
                e.style.borderBottom = `4px solid ${scale(e.innerHTML)}`;
            }
        }


        var div = L.DomUtil.create('div', 'info legend category');
        return div;
    };


    legend.getColor = function(data) {
        var d = MAP.value(data);

        if(d.length==1) {
            return {'fillColor': scale(d[0])};
        } else {
            if(d.length>2) {
                console.log('too many in one place', d, data)
            }
            var k = d.join('-');
            if(!patterns[k]) {
                patterns[k] = new L.StripePattern({
                    color: scale(d[0]),
                    spaceColor: scale(d[1]),
                    spaceOpacity: 1,
                    opacity: 1,
                    angle: 45,
                    weight: 4,
                    spaceWeight: 4});
            }
            return {'fillPattern': patterns[k]};
        }
    };

    return legend;
};

legend['threshold-or-category'] = function(MAP) {
    var legend = L.control({position: 'topleft'});
    var scale = d3scale.scaleOrdinal(MAP.colorschemes[0].concat(MAP.colorschemes[1]));
    if(MAP.categories) {
        scale = scale.domain(MAP.categories[0].concat(MAP.categories[1]));
    }
    var patterns = {};

    legend.onAdd = function (map) {
        if(MAP.categories) {
            for(var e of document.querySelectorAll('span.scalevalue')) {
                e.style.borderBottom = `4px solid ${scale(e.innerHTML)}`;
            }
        }

        var div = L.DomUtil.create('div', 'info legend threshold');
        div.innerHTML+=`${MAP.thresholds.labels[0]}&nbsp;`;
        MAP.thresholds.colors.map((c,i) =>
            div.innerHTML+=`<span style="background: ${c}"></span>`);
        div.innerHTML+=`&nbsp;${MAP.thresholds.labels.slice().reverse()[0]}`;
        return div;
    };


    legend.getColor = function(data) {
        var d = MAP.value(data);

        if(!d) {
            return {'fillColor': 'black', fillOpacity: 1};
        }
        if(d.length==2 && (d[0]==0)) {
            return {'fillColor': scale(d[1]), fillOpacity: 1};
        } else {
            var k = d.join();
            if(!patterns[k]) {
                patterns[k] = new L.StripePattern({
                    color: scale(d[1]),
                    spaceColor: '#cdcc32',
                    spaceOpacity: 0.5,
                    opacity: 0.9,
                    angle: 45,
                    weight: 4,
                    spaceWeight: 4});
            }
            return {'fillPattern': patterns[k], fillOpacity: 1};
        }
    };

    return legend;
};

export {legend};
