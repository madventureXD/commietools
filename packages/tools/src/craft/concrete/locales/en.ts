export const concreteEn = {
  'tool.concrete.title': 'Concrete, mortar and screed',
  'tool.concrete.description': 'Material quantities for concrete, mortar and screed: cement, water, aggregate and bag count from volume, mix and waste — with a complete mass balance. Runs entirely in the browser.',
  'tool.concrete.summary': 'Cement, water, aggregate and bags for concrete, mortar and screed.',
  'tool.concrete.terms': 'concrete,mortar,screed,cement,sand,gravel,aggregate,water,mix ratio,cement content,water cement ratio,bag,foundation,slab,building material,quantity,site,trade,#trades,#materials',

  'tool.concrete.kind': 'Kind',
  'tool.concrete.kind.concrete': 'Concrete',
  'tool.concrete.kind.mortar': 'Mortar',
  'tool.concrete.kind.screed': 'Screed',
  'tool.concrete.mix': 'Mix',
  'tool.concrete.mix.lean': 'Lean concrete (C8/10 to C12/15)',
  'tool.concrete.mix.c2025': 'Standard concrete C20/25 — foundation, slab',
  'tool.concrete.mix.c2530': 'Structural concrete C25/30 — load-bearing parts',
  'tool.concrete.mix.c3037': 'Concrete C30/37 — higher exposure',
  'tool.concrete.mix.cementMortar': 'Cement mortar (masonry mortar)',
  'tool.concrete.mix.cementScreed': 'Cement screed (CT)',

  'tool.concrete.recipe': 'Suggested values of the chosen mix',
  'tool.concrete.cementPerCubicMeter': 'Cement content per m³ of mix (kg)',
  'tool.concrete.waterCementRatio': 'Water-cement ratio (w/c)',
  'tool.concrete.freshDensity': 'Density of the fresh mix (kg/m³)',
  'tool.concrete.waste': 'Waste (%)',
  'tool.concrete.bagSize': 'Cement bag size (kg)',

  'tool.concrete.assumptions': 'Assumptions: the cement content applies to one cubic metre of finished mix including waste. The aggregate follows from the mass balance: total mass minus cement minus water — which is why cement + water + aggregate always add up to the total mass exactly. The water-cement ratio is a mass ratio. Volume parts ("1 part cement to 4 parts gravel") are deliberately not converted: cement fills the voids of the aggregate, so the volumes do not simply add up.',
  'tool.concrete.sources': 'Suggested values: fresh concrete about 2,400 kg/m³, cement content C20/25 300 kg/m³ at w/c 0.60, C25/30 340 kg/m³ at w/c 0.55 and lean concrete 180 kg/m³ at w/c 0.75 (baumaterialkalkulator.de, bau-szene.de); cement screed 2,200 kg/m³ (baumigo.de, taken from DIN EN 1991-1-1); maximum cement content of screed mortar 450 kg/m³ (vdz-online.de, leaflet B19). Mortar and screed values without a published source are marked as rule-of-thumb values in the interface. No standard table and no statement about standards: this is a site mix for estimating quantities, not a concrete test.',
  'tool.concrete.roundNote': 'Values are computed to twelve significant digits and displayed in the user\u2019s language. The bag count is always rounded up — half bags are not for sale.'
} as const
