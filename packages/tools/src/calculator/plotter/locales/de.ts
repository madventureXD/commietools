export const plotterDe = {
  'tool.plotter.title': 'Funktionsplotter',
  'tool.plotter.description': 'Mehrere Funktionen gleichzeitig zeichnen, mit Wertetabelle und berechneten Nullstellen. Gezeichnet wird mit einem eigenen Zeichner. Rechnet vollständig im Browser.',
  'tool.plotter.summary': 'Kurven, Wertetabelle und Nullstellen.',
  'tool.plotter.terms': 'Funktionsplotter,Plotter,Funktion,Kurve,Graph,Diagramm,Funktionsgraph,zeichnen,Nullstelle,Wertetabelle,Parabel,Sinus,Steigung,Schnittpunkt,Mathe,Schule,Berufsschule,#rechnen,#mathematik',

  'tool.plotter.field.curves': 'Funktionen (eine je Zeile, Variable x)',
  'tool.plotter.field.xMin': 'x von',
  'tool.plotter.field.xMax': 'x bis',
  'tool.plotter.field.yMin': 'y von (optional)',
  'tool.plotter.field.yMax': 'y bis (optional)',
  'tool.plotter.field.samples': 'Stützstellen der Tabelle',
  'tool.plotter.out.plot': 'Schaubild',
  'tool.plotter.out.roots': 'Nullstellen',
  'tool.plotter.out.table': 'Wertetabelle',
  'tool.plotter.out.noRoots': 'Im Bereich keine Nullstelle gefunden.',
  'tool.plotter.out.curve': 'Kurve',
  'tool.plotter.out.x': 'x',
  'tool.plotter.out.notDefined': 'nicht definiert',

  'tool.plotter.note.engine': 'Gezeichnet wird mit einem eigenen Zeichner: Er erzeugt die Kurvenpunkte aus demselben Rechenkern, der auch die Wertetabelle rechnet. Es wird keine Zeichenbibliothek nachgeladen.',
  'tool.plotter.note.table': 'Die Wertetabelle und die Nullstellen rechnet der Rechenkern des Rechners, nicht die Zeichenfläche. So gibt es nur einen Rechenweg für einen Ausdruck.',
  'tool.plotter.note.roots': 'Nullstellen werden über Vorzeichenwechsel gesucht und eingegrenzt. Eine Polstelle wie bei 1/x ist keine Nullstelle und wird nicht als solche gemeldet.',

  'tool.plotter.formulas': 'Gezeichnet wird über Stützstellen im angegebenen x-Bereich. Die Wertetabelle setzt die angegebene Anzahl x-Werte in jede Funktion ein. Nullstellen: Das Vorzeichen des Funktionswerts wird zwischen benachbarten Stützstellen verglichen; bei einem Wechsel wird die Stelle durch fortgesetzte Halbierung bis auf etwa 1e-15 eingegrenzt und der Wert dort geprüft.',
  'tool.plotter.assumptions': 'Annahmen: Die Variable heißt x. Bereiche müssen x von < x bis erfüllen. y-Grenzen sind optional; ohne sie skaliert der Zeichner selbst. Wertetabelle und Nullstellen rechnen im Dezimalmodell des Rechenkerns (64 Stellen). Nicht definierte Stellen (etwa Division durch null) werden als solche gekennzeichnet, nicht als 0 ausgegeben.',
  'tool.plotter.sources': 'Zeichnung: eigener Zeichner (SVG-Geometrie), keine Zeichenbibliothek. Rechenweg: eigener Rechenkern (mathjs, Apache-2.0, ADR 0005). Nullstellensuche: eigenes Bisektionsverfahren mit Polstellenprüfung. Stand 2026-10-03.'
} as const
