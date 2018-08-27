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


maps['kinderbetreuung'] = {
  title: 'Kindergarten-Öffnungszeiten in Österreich',
  description: 'Öffnungszeiten von Einrichtungen, die Kinder von 3 – 6-Jährigen betreuen. Gibt es mehrere Einrichtungen, wird die durchschnittliche Öffnungszeit, gewichtet nach der Anzahl der Kinder, angezeigt.',
  detail: '',
  data: 'gemeinden_kinderbetreuung.csv',
  data_key: 'gkz',
  property_key: 'GKZ',
  source: 'Statistik Austria',
  is_gemeinden: true,
  search_keys: ['name'],
  search_title: 'Gemeindesuche',
  topojson: 'gemeinden m bezirke 2018.topojson',

  scale: 'zero-and-linear',

  numfmt: (d) => {
    var hours = Math.floor(d/60);
    var minutes = Math.round(d-hours*60);
    return hours+':'+(minutes<10?'0':'')+minutes+' Stunden';
  },

  value: function(d) {
    if(d.length==0) {
      return 0;
    }
    return parseFloat(d[0]['gemgew16']);
  },


  search: true,
  colorschemes: ['#f2f2f2'].concat(['#DCD7DE','#40234b']),
  legend: 0,

  tooltip: function(d, p, pctfmt, numfmt) {
    if(d.length==0) {
      return p.name;
    }
    d = d[0];
    var tt = `<strong>${d.name}</strong><br />`;
    if(d.Einrsumcountstd16==0){
      tt+='Keine Betreuungseinrichtung für 3- bis 6-jährige in der Gemeinde.';
    } else {
      var stunden = Math.floor(d.gemgew16/60);
      var minuten = Math.round(d.gemgew16-stunden*60);
      tt += `Öffnungszeit / Tag (Ø): ${stunden}:${minuten<10?'0':''}${minuten} Stunden<br />
        Vergleich zu 2006
        ${d.Einrsumcountstd16 >1 && d.Einrsumcountstd06>1?'*':''}
        : ${(d.diffmin>0?"+":'')+numfmt(d.diffmin)} Minuten<br />
        Einrichtungen: ${numfmt(d.Einrsumcountstd16)}<br />
        Betreute Kinder: ${numfmt(d.summegewkind16)}
      `
      if(d.Einrsumcountstd16>1 && d.Einrsumcountstd06>1) {
        tt += '<br />* gewichteter Wert, berücksichtigt Zahl der Kinder in den einzelnen Einrichtungen';
      }
    }
    return tt;
  }
};

maps['kinderbetreuung03'] = {
  title: 'Betreuungsangebot für unter 3-Jährige in Österreich',
  description: 'Öffnungszeiten von Einrichtungen, die Kinder von 0 bis 3 Jahre betreuen. Gibt es mehrere Einrichtungen, wird die durchschnittliche Öffnungszeit, gewichtet nach der Anzahl der Kinder, angezeigt.',
  detail: '',
  data: 'gemeinden_kinderbetreuung_03.csv',
  data_key: 'gkz',
  property_key: 'GKZ',
  source: 'Statistik Austria',
  is_gemeinden: true,
  search_keys: ['name'],
  search_title: 'Gemeindesuche',
  topojson: 'gemeinden m bezirke 2018.topojson',

  scale: 'zero-and-linear',

  numfmt: (d) => {
    var hours = Math.floor(d/60);
    var minutes = Math.round(d-hours*60);
    return hours+':'+(minutes<10?'0':'')+minutes+' Stunden';
  },

  value: function(d) {
    if(d.length==0) {
      return 0;
    }
    return parseFloat(d[0]['gemgew16']);
  },


  search: true,
  colorschemes: ['#f2f2f2'].concat(['#DCD7DE','#40234b']),
  legend: 0,

  tooltip: function(d, p, pctfmt, numfmt) {
    if(d.length==0) {
      return p.name;
    }
    d = d[0];
    var tt = `<strong>${d.name}</strong><br />`;
    if(d.Einrsumcountstd16==0){
      tt+='Keine Betreuungseinrichtung für unter 3-Jährige in der Gemeinde.';
    } else {
      tt += `Öffnungszeit / Tag (Ø): ${d.timegemgew16} Stunden${d.Einrsumcountstd16>0?'*':''}<br />
        Einrichtungen 2016: ${numfmt(d.Einrsumcountstd16)}<br />
        Betreute unter 3-Jährige: ${numfmt(d.sum_0_3_16)}
      `
      if(d.Einrsumcountstd16>1) {
        tt += '<br />* gewichteter Wert, berücksichtigt Zahl der Kinder in den einzelnen Einrichtungen';
      }
    }
    return tt;
  }
};

Object.keys(maps).map((x) => {maps[x].map=x});

export { maps };
