export const inspectionDe = {
  'tool.inspection.title': 'Prüffristen',
  'tool.inspection.description': 'Wiederkehrende Prüfungen für Leitern, PSA und Prüfmittel verwalten: nächster Termin aus letzter Prüfung und Intervall, Resttage und Einordnung in überfällig, bald fällig und in Ordnung — mit Export als Tabelle. Rechnet und speichert vollständig im Browser.',
  'tool.inspection.summary': 'Nächste Prüftermine aus letzter Prüfung und Intervall, mit Resttagen und Export.',
  'tool.inspection.terms': 'prüffrist,prüffristen,prüfprotokoll,prüftermin,wiederkehrende prüfung,leiter,leiterprüfung,psa,prüfmittel,betriebsmittel,dguv,unterweisung,intervall,überfällig,fällig,mängelliste,arbeitsschutz,export,csv,#prüffristen,#arbeitsschutz',

  'tool.inspection.list': 'Prüfliste',
  'tool.inspection.add': 'Eintrag hinzufügen',
  'tool.inspection.label': 'Gegenstand',
  'tool.inspection.interval': 'Intervall (Monate)',
  'tool.inspection.lastChecked': 'Letzte Prüfung',
  'tool.inspection.note': 'Notiz (optional)',
  'tool.inspection.remove': 'Entfernen',
  'tool.inspection.empty': 'Noch keine Einträge. Bezeichnung, Intervall und letzte Prüfung eintragen — die Liste rechnet den nächsten Termin.',
  'tool.inspection.count': 'Einträge',

  'tool.inspection.nextDue': 'Fällig am',
  'tool.inspection.daysLeft': 'Resttage',
  'tool.inspection.dueToday': 'heute fällig',
  'tool.inspection.daysOverdue': 'Tage überfällig',
  'tool.inspection.state.overdue': 'Überfällig',
  'tool.inspection.state.dueSoon': 'Bald fällig',
  'tool.inspection.state.ok': 'In Ordnung',

  'tool.inspection.settings': 'Warnschwelle',
  'tool.inspection.warnDays': 'Bald fällig ab (Tage davor)',

  'tool.inspection.export': 'Liste als Tabelle speichern',
  'tool.inspection.exportName': 'prueffristen.csv',
  'tool.inspection.exportNote': 'Getrennt durch Semikolon, Datum im Format der gewählten Sprache — so öffnen deutsche und spanische Tabellenprogramme die Datei ohne Nachfrage.',

  'tool.inspection.header.label': 'Gegenstand',
  'tool.inspection.header.note': 'Notiz',
  'tool.inspection.header.interval': 'Intervall (Monate)',
  'tool.inspection.header.lastChecked': 'Letzte Prüfung',
  'tool.inspection.header.nextDue': 'Fällig am',
  'tool.inspection.header.days': 'Resttage',

  'tool.inspection.noReminder': 'Ohne Server kann dieses Werkzeug nicht erinnern: Es zeigt beim Öffnen, was fällig ist, und speichert die Liste in diesem Browser. Für Erinnerungen die exportierte Tabelle in den Kalender übernehmen.',
  'tool.inspection.assumptions': 'Annahmen: Der nächste Termin ist die letzte Prüfung plus das Intervall in Monaten; Monatsenden werden korrekt behandelt (31. Januar + 1 Monat = 28./29. Februar). „Heute fällig" zählt als bald fällig, nicht als überfällig. Die Liste steht in diesem Browser, nicht auf einem Server — sie ist beim nächsten Öffnen wieder da, aber auf keinem anderen Gerät. **Keine vorgeschlagenen Intervalle:** Prüffristen ergeben sich aus der Gefährdungsbeurteilung des Betreibers und aus den Unfallverhütungsvorschriften; dieses Werkzeug kennt sie nicht und rät nicht. Die Einordnung ersetzt keine Prüfung und keine Unterweisung.',
  'tool.inspection.sources': 'Rechenweg: Datumsarithmetik über Temporal (PlainDate), dieselbe Grundlage wie im Werkzeug „Zeit und Datum" — damit stimmen Monats- und Jahresgrenzen. Keine Normtabellen und keine Fristvorschläge: Das Werkzeug rechnet ausschließlich, was eingegeben wird.',

  'tool.inspection.error.empty': 'Noch kein Eintrag vorhanden. Zuerst Bezeichnung, Intervall und letzte Prüfung eintragen.',
  'tool.inspection.error.label': 'Jeder Eintrag braucht eine Bezeichnung (höchstens 80 Zeichen).',
  'tool.inspection.error.interval': 'Das Intervall muss eine ganze Zahl zwischen 1 und 120 Monaten sein.',
  'tool.inspection.error.date': 'Das Datum der letzten Prüfung fehlt oder ist unbrauchbar ( JJJJ-MM-TT).',
  'tool.inspection.error.future': 'Die letzte Prüfung kann nicht in der Zukunft liegen.',
  'tool.inspection.error.tooMany': 'Die Liste ist voll (höchstens 200 Einträge). Zuerst Erledigtes entfernen.',
  'tool.inspection.error.warn': 'Die Warnschwelle muss eine ganze Zahl zwischen 1 und 365 Tagen sein.'
} as const
