export type Locale = 'de' | 'en'

export const messages = {
  de: {
    'app.name': 'CommieTools',
    'app.tagline': 'Kostenlose Werkzeuge für alle.',
    'app.promise': 'Deine Werkzeuge. Dein Gerät. Deine Daten.',
    'nav.tools': 'Werkzeuge',
    'nav.about': 'Prinzipien',
    'action.theme': 'Farbschema wechseln',
    'action.language': 'Sprache wechseln',
    'status.local': 'Lokal verarbeitet',
    'status.offline': 'Offline verfügbar',
    'catalog.title': 'Werkzeuge',
    'catalog.intro': 'Klare, präzise Werkzeuge, die deine Daten respektieren.',
    'category.text': 'Text',
    'category.pdf': 'PDF',
    'category.image': 'Bilder',
    'category.developer': 'Entwicklung',
    'tool.textStats.title': 'Textstatistik',
    'tool.textStats.description': 'Zählt Zeichen, Wörter und Zeilen direkt im Browser.',
    'tool.textStats.input': 'Text eingeben',
    'tool.textStats.placeholder': 'Text hier einfügen …',
    'tool.textStats.characters': 'Zeichen',
    'tool.textStats.words': 'Wörter',
    'tool.textStats.lines': 'Zeilen',
    'principles.title': 'Gebaut für Vertrauen',
    'principles.local': 'Dateien und Inhalte bleiben standardmäßig auf deinem Gerät.',
    'principles.offline': 'Werkzeuge ohne Live-Daten funktionieren auch ohne Internet.',
    'principles.consistent': 'Ein gemeinsames Bedienmodell macht jedes Tool vertraut.'
  },
  en: {
    'app.name': 'CommieTools',
    'app.tagline': 'Free tools for everyone.',
    'app.promise': 'Your tools. Your device. Your data.',
    'nav.tools': 'Tools',
    'nav.about': 'Principles',
    'action.theme': 'Switch color theme',
    'action.language': 'Switch language',
    'status.local': 'Processed locally',
    'status.offline': 'Available offline',
    'catalog.title': 'Tools',
    'catalog.intro': 'Clear, precise tools that respect your data.',
    'category.text': 'Text',
    'category.pdf': 'PDF',
    'category.image': 'Images',
    'category.developer': 'Developer',
    'tool.textStats.title': 'Text statistics',
    'tool.textStats.description': 'Counts characters, words and lines in your browser.',
    'tool.textStats.input': 'Enter text',
    'tool.textStats.placeholder': 'Paste text here…',
    'tool.textStats.characters': 'Characters',
    'tool.textStats.words': 'Words',
    'tool.textStats.lines': 'Lines',
    'principles.title': 'Built for trust',
    'principles.local': 'Files and content stay on your device by default.',
    'principles.offline': 'Tools without live data continue to work without internet.',
    'principles.consistent': 'A shared interaction model makes every tool familiar.'
  }
} as const

export type MessageKey = keyof typeof messages.en

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key]
}

