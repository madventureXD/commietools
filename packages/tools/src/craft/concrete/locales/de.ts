export const concreteDe = {
  'tool.concrete.title': 'Beton, Mörtel und Estrich',
  'tool.concrete.description': 'Materialbedarf für Beton, Mörtel und Estrich: Zement, Wasser, Zuschlag und Sackzahl aus Volumen, Mischung und Verschnitt — mit vollständiger Massenbilanz. Rechnet vollständig im Browser.',
  'tool.concrete.summary': 'Zement, Wasser, Zuschlag und Sackzahl für Beton, Mörtel und Estrich.',
  'tool.concrete.terms': 'Beton,Mörtel,Estrich,Zement,Sand,Kies,Zuschlag,Wasser,Mischungsverhältnis,Zementgehalt,Wasserzementwert,Sack,Fundament,Bodenplatte,Magerbeton,Baustoff,Materialbedarf,Baustelle,Handwerk,#handwerk,#baustoffe',

  'tool.concrete.kind': 'Art',
  'tool.concrete.kind.concrete': 'Beton',
  'tool.concrete.kind.mortar': 'Mörtel',
  'tool.concrete.kind.screed': 'Estrich',
  'tool.concrete.mix': 'Mischung',
  'tool.concrete.mix.lean': 'Magerbeton (C8/10 bis C12/15)',
  'tool.concrete.mix.c2025': 'Standardbeton C20/25 — Fundament, Bodenplatte',
  'tool.concrete.mix.c2530': 'Konstruktiver Beton C25/30 — tragende Bauteile',
  'tool.concrete.mix.c3037': 'Beton C30/37 — höhere Beanspruchung',
  'tool.concrete.mix.cementMortar': 'Zementmörtel (Mauermörtel)',
  'tool.concrete.mix.cementScreed': 'Zementestrich (CT)',

  'tool.concrete.recipe': 'Vorschlag der gewählten Mischung',
  'tool.concrete.cementPerCubicMeter': 'Zementgehalt je m³ Mischung (kg)',
  'tool.concrete.waterCementRatio': 'Wasserzementwert (w/z)',
  'tool.concrete.freshDensity': 'Dichte der frischen Mischung (kg/m³)',
  'tool.concrete.waste': 'Verschnitt (%)',
  'tool.concrete.bagSize': 'Sackgröße Zement (kg)',

  'tool.concrete.assumptions': 'Annahmen: Der Zementgehalt gilt je Kubikmeter fertiger Mischung einschließlich Verschnitt. Der Zuschlag entsteht aus der Massenbilanz: Gesamtmasse minus Zement minus Wasser — deshalb geht Zement + Wasser + Zuschlag immer genau auf die Gesamtmasse auf. Der Wasserzementwert ist ein Masseverhältnis. Volumenteile („1 Teil Zement zu 4 Teilen Kies") werden bewusst nicht umgerechnet: Zement füllt die Hohlräume des Zuschlags, die Volumina addieren sich also nicht.',
  'tool.concrete.sources': 'Vorschlagswerte: Frischbeton rund 2.400 kg/m³, Zementgehalt C20/25 300 kg/m³ bei w/z 0,60, C25/30 340 kg/m³ bei w/z 0,55 und Magerbeton 180 kg/m³ bei w/z 0,75 (baumaterialkalkulator.de, bau-szene.de); Zementestrich 2.200 kg/m³ (baumigo.de, entnommen DIN EN 1991-1-1); Höchstzementgehalt von Estrichmörtel 450 kg/m³ (vdz-online.de, Merkblatt B19). Mörtel- und Estrichwerte ohne belegte Fachquelle sind in der Oberfläche als Erfahrungswerte gekennzeichnet. Keine Normtabelle und keine Normaussage: Dies ist eine Baumischung zum Vorbemessen, keine Betonprüfung.',
  'tool.concrete.roundNote': 'Gerechnet wird auf zwölf gültige Stellen, angezeigt in der Sprache des Nutzers. Die Sackzahl wird immer aufgerundet — halbe Säcke gibt es nicht zu kaufen.'
} as const
