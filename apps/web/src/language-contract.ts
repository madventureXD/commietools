export function placeholders(text: string): string[] {
  return (text.match(/\{[A-Za-z_][A-Za-z0-9_]*\}/gu) ?? []).sort()
}

/** Validate raw catalogs before fallback; every text class uses this contract. */
export function validateCatalog(reference: Readonly<Record<string, string>>, catalog: Readonly<Record<string, unknown>>): string[] {
  const errors: string[] = []
  for (const key of new Set([...Object.keys(reference), ...Object.keys(catalog)])) {
    const text = catalog[key]
    if (!(key in reference)) errors.push(`${key}: extra key`)
    if (typeof text !== 'string' || !text.trim()) { errors.push(`${key}: missing/empty`); continue }
    if (!text.isWellFormed()) errors.push(`${key}: surrogate`)
    if (text.normalize('NFC') !== text) errors.push(`${key}: NFC`)
    // eslint-disable-next-line no-control-regex -- Intentional validation of forbidden controls.
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(text)) errors.push(`${key}: control`)
    if (/[{}]/u.test(text.replace(/\{[A-Za-z_][A-Za-z0-9_]*\}/gu, ''))) errors.push(`${key}: interpolation`)
    if (typeof reference[key] === 'string' && placeholders(text).join('|') !== placeholders(reference[key]).join('|')) errors.push(`${key}: placeholders`)
  }
  return errors
}
