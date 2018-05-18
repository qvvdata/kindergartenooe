var maps = {};
import * as d3scale from 'd3-scale';
var cs = ['#381f41', '#664273','#a79cab','#41624b'];
var cs2 = ['yellow', 'orange','red','green'];
var ts = d3scale.scaleThreshold().domain([-25,-0.1,0.1]).range(['großer Rückgang','Rückgang','keine Veränderung','Zuwachs']);
maps['kindergaerten'] = {
  title: 'Wo Eltern ihre Kinder abgemeldet haben',
  description: 'In dieser Karte wird die prozentuelle Veränderung der Anzahl der Kindergartenkinder in Nachmittagsbetreuung zwischen Jänner und März/April 2018 dargestellt. Gemeinden, die keine Auskunft gegeben oder keine Nachmittagsbetreuung haben werden gestreift dargestellt.',
  detail: 'In einigen Gemeinden gibt es <span class="scalevalue">keine Betreuung/Kooperation</span> oder nur eine Betreuung durch <span class="scalevalue">Caritas oder andere private Erhalter</span>, manche haben <span class="scalevalue">keine Auskunft</span> gegeben.',
  data: 'gemeinden.csv',
  data_key: 'gkz',
  property_key: 'GKZ',
  source: 'Eigenrecherche',
  is_gemeinden: false,
  search_keys: ['PG'],
  search_title: 'Gemeindesuche',
  topojson: 'gemeinden.topojson',
  bundesland: 4,
  value: function(d) {
    if(d.length==0) {
      return null;
    }
    d = d[0];
    if(d.Kategorie=='Alles da') {
      return [0,ts(d['Prozentuelle Änderung'])];
    }
    return [1,d.Kategorie];
  },

  scale: 'threshold-or-category',

  search: true,
  colorschemes: [
    cs,
    ['#888888','#000000', '#820B0B']
  ],
  legend: 0,
  thresholds: {colors: cs, thresholds: ts.domain(), labels: ts.range()},

  categories: [['großer Rückgang', 'Rückgang', 'keine Veränderung', 'Zuwachs'],
    ['keine Betreuung/Kooperation', 'Caritas oder andere private Erhalter', 'keine Auskunft']],
  /*baselayer: () => L.tileLayer('https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg', {
      subdomains: ["maps", "maps1", "maps2", "maps3"],
      attribution: 'cc-by 3.0 basemap.at',
      detectRetina: true
  }) ,*/

  tooltip: function(d, p, pctfmt, numfmt) {
    if(d.length==0) {
      return p.PG;
    }
    d = d[0];
    return `<strong>${d.name}</strong>`+
      (d.Kategorie=='Alles da'?`
      <span style="padding-left: 0.5em; font-weight: bold; font-size: 1.25em; float: right; display: inline-block;">${d['Prozentuelle Änderung']>0?'+':''}${pctfmt(d['Prozentuelle Änderung'])} %</span>
<br />
Kindergartenkinder: ${numfmt(d['Kinder insgesamt'])}<br />
Kinder am Nachmittag vor Gebühr: ${numfmt(d['Jänner: Kinder in Nachmittagsbetreuung'])}<br />
Kinder am Nachmittag nach Gebühr: ${numfmt(d['März: Kinder in Nachmittagsbetreuung'])}<br />
Veränderung: ${d.Differenz>0?'+':''}${numfmt(d['Differenz'])}
        `:(
          d.Kategorie=='keine Auskunft'?`<br />
          Mitarbeiter der Gemeinde ${d.name} haben das Beantworten unserer Fragen mehrfach abgelehnt.
          Womöglich haben Sie mehr Glück: Rufen die Gemeinde unter ${d.Telefonnummer} an und teilen Sie uns die
          Rückmeldung über <a target="_blank" href="https://form.jotformeu.com/81265006658357">dieses Formular</a> mit.
`:`<br />${d.Kategorie}`))+ `
    ${d['Karte-Text']?'<br /><span class="kartetext">'+d['Karte-Text']+'</span>':''}`;
  }
};
maps['kindergaerten2'] = {
  title: 'Test',
  description: 'test',
  detail: 'test',
  data: 'gemeinden.csv',
  data_key: 'gkz',
  property_key: 'GKZ',
  source: 'Eigenrecherche',
  is_gemeinden: false,
  search_keys: ['PG'],
  search_title: 'Gemeindesuche',
  topojson: 'gemeinden.topojson',
  value: function(d) {
    if(d.length==0) {
      return null;
    }
    d = d[0];
    if(d.Kategorie=='Alles da') {
      return [0,ts(d['Prozentuelle Änderung'])];
    }
    return [1,d.Kategorie];
  },

  scale: 'threshold-or-category',

  search: true,
  colorschemes: [
    cs2,
    ['#888888','#000000', '#820B0B']
  ],
  legend: 0,
  thresholds: {colors: cs2, thresholds: ts.domain(), labels: ts.range()},
  bundesland: 4,

  categories: [['großer Rückgang', 'Rückgang', 'keine Veränderung', 'Zuwachs'],
    ['keine Betreuung/Kooperation', 'Caritas oder andere private Erhalter', 'keine Auskunft']],
  /*baselayer: () => L.tileLayer('https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg', {
      subdomains: ["maps", "maps1", "maps2", "maps3"],
      attribution: 'cc-by 3.0 basemap.at',
      detectRetina: true
  }) ,*/

  tooltip: function(d, p, pctfmt, numfmt) {
    if(d.length==0) {
      return p.PG;
    }
    d = d[0];
    return `<strong>${d.name}</strong>2`;
  }
};

Object.keys(maps).map((x) => {maps[x].map=x});

export { maps };
