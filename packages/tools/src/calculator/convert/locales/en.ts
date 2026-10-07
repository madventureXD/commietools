export const convertEn = {
  'tool.convert.title': 'Convert',
  'tool.convert.description': 'Units (length, area, volume, mass, temperature, pressure, force, energy, power, speed), angles, number bases from 2 to 36, inch fractions and 18 calendars. All computation stays in the browser.',
  'tool.convert.summary': 'Units, angles, bases, inches and calendars.',
  'tool.convert.terms': 'convert,converter,units,unit converter,conversion,length,area,volume,mass,weight,temperature,pressure,force,torque,energy,power,speed,angle,degrees,radians,gradians,number base,binary,octal,hexadecimal,base,inch,inch fraction,millimetre,measure,calendar,calendar conversion,hebrew calendar,islamic calendar,ISO week,#calculate,#convert',

  'tool.convert.mode': 'Conversion type',
  'tool.convert.mode.units': 'Units',
  'tool.convert.mode.angle': 'Angles',
  'tool.convert.mode.base': 'Number bases',
  // Karte M3-004: Richtungslabels sind Sprachschluessel mit Parametern; die Einheitenzeichen
  // stehen als eigene Werte (sprachneutral 'in'/'mm', im Deutschen 'Zoll').
  'tool.convert.unit.inch': 'in',
  'tool.convert.unit.mm': 'mm',
  'tool.convert.inchDirection': '{from} → {to}',

  'tool.convert.mode.inch': 'Inches and measure',
  'tool.convert.mode.calendar': 'Calendars',

  'tool.convert.category': 'Quantity',
  'tool.convert.category.length': 'Length',
  'tool.convert.category.area': 'Area',
  'tool.convert.category.volume': 'Volume',
  'tool.convert.category.mass': 'Mass',
  'tool.convert.category.temperature': 'Temperature',
  'tool.convert.category.pressure': 'Pressure',
  'tool.convert.category.force': 'Force',
  'tool.convert.category.energy': 'Energy',
  'tool.convert.category.power': 'Power',
  'tool.convert.category.speed': 'Speed',

  'tool.convert.field.value': 'Value',
  'tool.convert.field.from': 'from',
  'tool.convert.field.to': 'to',
  'tool.convert.field.base': 'Base (2 to 36)',
  'tool.convert.field.whole': 'Whole inches',
  'tool.convert.field.numerator': 'Numerator',
  'tool.convert.field.denominator': 'Denominator',
  'tool.convert.field.date': 'Date (YYYY-MM-DD)',
  'tool.convert.field.calendar': 'Calendar',
  'tool.convert.field.year': 'Year in the calendar',
  'tool.convert.field.monthCode': 'Month in the calendar',
  'tool.convert.field.day': 'Day',
  'tool.convert.direction': 'Direction',
  'tool.convert.direction.forward': 'Into the calendar date',
  'tool.convert.direction.backward': 'Back to the Gregorian date',
  'tool.convert.inchDenominator': 'Denominator of the fraction',
  'tool.convert.calendarResult': 'Calendar date',
  'tool.convert.gregorianResult': 'Gregorian date',

  'tool.convert.error.unknownUnit': 'The calculator does not know this unit.',
  'tool.convert.error.unsupportedCalendar': 'This calendar cannot be converted back in this environment. No date is guessed.',

  'tool.convert.formulas': 'Conversion via the base unit: value × factor(from) ÷ factor(to). Temperature and angles run directly through unit arithmetic, because they are shifted as well as scaled (0 °C = 32 °F). Number bases are computed in BigInt, inch fractions through the definition 1 inch = 25.4 mm.',
  'tool.convert.assumptions': 'Assumptions: conversion factors are determined from the unit library at runtime — not copied from a table. Metric horsepower (PS = 735.49875 W) and the speeds mph and knots are named constants, because the library does not carry them. Calendar dates are read through monthCode so leap months stay unambiguous; calendar names come from the browser language setting.',
  'tool.convert.sources': 'Built on mathjs (Apache-2.0) through the calculator core\'s curated factories, see ADR 0005 — no second engine. Calendars via Intl and Temporal (TC39 polyfill, ISC; native in the browser, loaded on demand otherwise). Inch: international agreement of 1959 (1 in = 25.4 mm). Verified on 2026-10-03 against independent recomputation.'
} as const
