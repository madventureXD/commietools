import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { approvedReview, unresolvedReviews } from './rust-review-policy.mjs'
import { rustSourceId } from './rust-source-id.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mode = process.argv[2] ?? 'check'
const lockPath = join(root, 'package-lock.json')
const policyPath = join(root, 'licenses', 'policy.json')
const artifactsPath = join(root, 'licenses', 'artifacts.json')
const overridesPath = join(root, 'licenses', 'overrides.json')
const registryPath = join(root, 'licenses', 'registry.json')
const publicRegistryPath = join(root, 'apps', 'web', 'public', 'licenses', 'registry.json')
const noticesPath = join(root, 'THIRD_PARTY_NOTICES.md')
const licensePath = join(root, 'LICENSE')
const copyrightPath = join(root, 'COPYRIGHT')
const copyrightText = 'Copyright (C) 2026 CommieTools contributors\n'

function fail(message) {
  console.error(`License audit failed: ${message}`)
  process.exit(1)
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalText(value) {
  return value.replace(/\r\n/gu, '\n')
}

function packageNameFromPath(path) {
  const tail = path.split('node_modules/').at(-1)
  if (!tail) return ''
  const segments = tail.split('/')
  return segments[0]?.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0]
}

function normalizeRepository(repository) {
  const raw = typeof repository === 'string' ? repository : repository?.url
  if (!raw) return null
  if (/^[\w.-]+\/[\w.-]+$/.test(raw)) return `https://github.com/${raw}`
  // Kurzformen aus Paketmetadaten in einen anklickbaren Web-Verweis bringen. Sonst entstehen auf
  // der Lizenzseite Verweise wie "git@github.com:owner/repo", die im Browser ins Leere führen.
  const githubKurz = /^(?:git\+)?(?:ssh:\/\/)?(?:git@)?github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i.exec(raw)
  if (githubKurz) return `https://github.com/${githubKurz[1]}/${githubKurz[2]}`
  const githubSchema = /^github:([\w.-]+)\/([\w.-]+)$/i.exec(raw)
  if (githubSchema) return `https://github.com/${githubSchema[1]}/${githubSchema[2]}`
  const web = raw.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git$/, '')
  // Nur Web-Adressen sind als Verweis brauchbar; SSH-/Git-Protokolle öffnet kein Browser.
  return /^https?:\/\//i.test(web) ? web : null
}

function authorName(author) {
  if (!author) return null
  if (typeof author === 'string') return author
  return author.name ?? null
}

function licenseIds(expression, spdx) {
  const ids = expression.match(/[A-Za-z0-9][A-Za-z0-9.+-]*/g) ?? []
  return [...new Set(ids.filter((id) => spdx[id]))]
}

function packageDocuments(packageDirectory, documents) {
  if (!packageDirectory || !existsSync(packageDirectory)) return []
  return readdirSync(packageDirectory)
    .filter((name) => /^(licen[cs]e|copying|notice)(\.|$)/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const text = readFileSync(join(packageDirectory, name), 'utf8').trim()
      if (!text) fail(`empty license document ${packageDirectory}/${name}`)
      const id = sha256(text)
      documents[id] ??= { sha256: id, text }
      return { name, documentId: id }
    })
}

function buildRegistry() {
  const lockText = readFileSync(lockPath, 'utf8')
  const lock = JSON.parse(lockText)
  const policy = readJson(policyPath)
  const artifactConfig = readJson(artifactsPath)
  const overrides = existsSync(overridesPath) ? readJson(overridesPath) : { overrides: [] }
  const internalManifests = [
    'package.json',
    'apps/web/package.json',
    'packages/core/package.json',
    'packages/i18n/package.json',
    'packages/tools/package.json',
    'packages/ui/package.json',
  ]
  for (const manifestPath of internalManifests) {
    const manifest = readJson(join(root, ...manifestPath.split('/')))
    if (manifest.license !== policy.projectLicense) {
      fail(`${manifestPath} must declare license ${policy.projectLicense}`)
    }
  }
  const spdx = readJson(join(root, 'node_modules', 'spdx-license-list', 'spdx-full.json'))
  const expressions = new Set()
  const documents = {}
  const packages = []

  for (const [packagePath, lockEntry] of Object.entries(lock.packages)) {
    if (!packagePath.startsWith('node_modules/')) continue
    const name = packageNameFromPath(packagePath)
    if (name.startsWith('@commietools/')) continue
    // Die Lizenz kommt aus package-lock.json. Fehlt sie dort, greift nur ein
    // einzeln beschlossener Eintrag aus licenses/overrides.json, und der muss
    // den SHA-256 der Lizenzdatei treffen. Eine neue Paketfassung oder eine
    // geänderte Lizenzdatei lässt den Eintrag bewusst verfallen.
    let expression = lockEntry.license
    let licenseSource = 'lockfile'
    if (!expression) {
      const override = (overrides.overrides ?? []).find((entry) => entry.name === name && entry.version === lockEntry.version)
      if (!override) {
        fail(`${name}@${lockEntry.version ?? 'unknown'} has no license expression in package-lock.json and no reviewed override in licenses/overrides.json`)
      }
      const evidenceFile = join(root, ...String(override.evidence?.path ?? '').split('/'))
      if (!override.evidence?.path || !existsSync(evidenceFile)) {
        fail(`override for ${name}@${lockEntry.version} names a missing evidence file`)
      }
      const evidenceHash = sha256(canonicalText(readFileSync(evidenceFile, 'utf8').trim()))
      if (evidenceHash !== override.evidence.sha256) {
        fail(`override for ${name}@${lockEntry.version} is stale: ${override.evidence.path} no longer hashes to the recorded value`)
      }
      if (!policy.allowedExpressions.includes(override.expression)) {
        fail(`override for ${name}@${lockEntry.version} uses unreviewed license expression ${override.expression}`)
      }
      expression = override.expression
      licenseSource = 'reviewed-override'
    }
    if (!policy.allowedExpressions.includes(expression)) fail(`${name}@${lockEntry.version} uses unreviewed license expression ${expression}`)
    expressions.add(expression)

    const packageDirectory = join(root, ...packagePath.split('/'))
    const manifestPath = join(packageDirectory, 'package.json')
    const manifest = !lockEntry.optional && existsSync(manifestPath) ? readJson(manifestPath) : {}
    const ids = licenseIds(expression, spdx)
    if (!ids.length) fail(`${name}@${lockEntry.version} has no resolvable SPDX license in ${expression}`)

    packages.push({
      name,
      version: lockEntry.version,
      licenseExpression: expression,
      licenseSource,
      licenseIds: ids,
      dependencyType: lockEntry.dev ? 'development' : 'runtime',
      optional: Boolean(lockEntry.optional),
      author: authorName(manifest.author),
      repository: normalizeRepository(manifest.repository),
      homepage: manifest.homepage ?? null,
      // Optional native packages differ by operating system. Their SPDX texts
      // remain complete, while package-local documents are collected only for
      // dependencies installed consistently on every supported platform.
      documents: packageDocuments(!lockEntry.optional && existsSync(packageDirectory) ? packageDirectory : null, documents)
    })
  }

  packages.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version))
  const artifacts = artifactConfig.artifacts.map((artifact) => {
    const sourcePath = join(root, ...artifact.sourcePath.split('/'))
    if (!existsSync(sourcePath)) fail(`missing licensed artifact ${artifact.sourcePath}`)
    const data = readFileSync(sourcePath)
    if (!artifact.licenseIds?.length) fail(`artifact ${artifact.id} has no license IDs`)
    for (const id of artifact.licenseIds) if (!spdx[id]) fail(`artifact ${artifact.id} has unknown SPDX license ${id}`)
    return {
      id: artifact.id,
      name: artifact.name,
      version: artifact.version,
      fileName: artifact.sourcePath.split('/').at(-1),
      size: statSync(sourcePath).size,
      sha256: sha256(data),
      licenseIds: [...artifact.licenseIds].sort(),
      source: artifact.source,
      build: artifact.build,
      components: artifact.components,
      toolIds: artifact.toolIds
    }
  })
  const usedLicenseIds = [...new Set([policy.projectLicense, ...packages.flatMap((entry) => entry.licenseIds), ...artifacts.flatMap((entry) => entry.licenseIds)])].sort()
  const licenses = Object.fromEntries(usedLicenseIds.map((id) => {
    const entry = spdx[id]
    if (!entry?.licenseText?.trim()) fail(`SPDX has no complete text for ${id}`)
    return [id, {
      id,
      name: entry.name,
      url: entry.url,
      osiApproved: Boolean(entry.osiApproved),
      text: entry.licenseText.trim(),
      sha256: sha256(entry.licenseText.trim())
    }]
  }))

  return {
    schemaVersion: 1,
    project: {
      name: 'CommieTools',
      license: policy.projectLicense,
      source: 'LICENSE'
    },
    // Git may materialise the same lockfile with CRLF or LF depending on the checkout.
    // Hash its canonical text so a clean Windows worktree verifies the committed registry.
    lockfileSha256: sha256(canonicalText(lockText)),
    policy: {
      allowedExpressions: [...policy.allowedExpressions].sort(),
      reviewRequired: [...policy.reviewRequired].sort()
    },
    summary: {
      packages: packages.length,
      runtime: packages.filter((entry) => entry.dependencyType === 'runtime').length,
      development: packages.filter((entry) => entry.dependencyType === 'development').length,
      optional: packages.filter((entry) => entry.optional).length,
      licenseExpressions: [...expressions].sort(),
      licenseIds: usedLicenseIds
    },
    artifacts,
    licenses,
    documents,
    packages
  }
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function notices(registry) {
  const lines = [
    '# Third-party notices',
    '',
    'This file is generated by `npm run licenses:generate`. Do not edit it manually.',
    '',
    `CommieTools uses ${registry.summary.packages} locked third-party packages. Complete SPDX license texts and package-specific LICENSE, LICENCE, COPYING, and NOTICE documents are stored in \`licenses/registry.json\` and published at \`/licenses\`.`,
    '',
    '| Package | Version | Use | License |',
    '| --- | --- | --- | --- |',
    ...registry.packages.map((entry) => `| ${entry.name.replace(/\|/g, '\\|')} | ${entry.version} | ${entry.dependencyType}${entry.optional ? ', optional' : ''} | ${entry.licenseExpression.replace(/\|/g, '\\|')}${entry.licenseSource === 'reviewed-override' ? ' (from package LICENSE, reviewed)' : ''} |`),
    '',
    '## Embedded binary artifacts',
    '',
    '| Artifact | Version | SHA-256 | Licenses |',
    '| --- | --- | --- | --- |',
    ...registry.artifacts.map((entry) => `| ${entry.name} | ${entry.version} | \`${entry.sha256}\` | ${entry.licenseIds.join(', ')} |`),
    ''
  ]
  return lines.join('\n')
}

const rustComponentsPath = join(root, 'licenses', 'rust-components.json')
const rustReviewPath = join(root, 'licenses', 'rust-review.json')
const publicRustPath = join(root, 'apps', 'web', 'public', 'licenses', 'rust-components.json')

/**
 * Wertet einen SPDX-Ausdruck strukturell aus (M9-002).
 *
 * Die Zulassungsliste ist eine exakte Zeichenkettenliste; Rust-Abhängigkeiten liefern aber
 * Ausdrücke wie `MIT OR Apache-2.0` oder `(Apache-2.0 OR MIT) AND BSD-3-Clause`. Statt die
 * Liste um jede Schreibweise zu erweitern (was sie aushöhlen würde), wird der Ausdruck
 * verstanden: OR verlangt mindestens einen erlaubten Zweig, AND verlangt alle.
 * Die informelle Schreibweise mit Schrägstrich (`MIT/Apache-2.0`) wird als ODER gelesen und
 * im Bericht als Auslegung gekennzeichnet, nicht verschwiegen.
 */
function spdxAuswerten(ausdruck, erlaubt) {
  let text = String(ausdruck).replace(/\s+/g, ' ').trim()
  const ausgelegt = /[^()]*\/[^()]*/.test(text)
  text = text.replace(/([A-Za-z0-9.+-]+)\s*\/\s*([A-Za-z0-9.+-]+)/g, '$1 OR $2')
  let stelle = 0
  function auswerten() {
    const teile = []
    let op = null
    for (;;) {
      while (text[stelle] === ' ') stelle += 1
      let knoten
      if (text[stelle] === '(') {
        stelle += 1
        knoten = auswerten()
        while (text[stelle] === ' ') stelle += 1
        if (text[stelle] !== ')') throw new Error('Klammer nicht geschlossen')
        stelle += 1
      } else {
        const treffer = /^[A-Za-z0-9.+-]+/.exec(text.slice(stelle))
        if (!treffer) throw new Error(`unlesbar bei "${text.slice(stelle, stelle + 12)}"`)
        knoten = { atom: treffer[0] }
        stelle += treffer[0].length
      }
      teile.push(knoten)
      while (text[stelle] === ' ') stelle += 1
      const naechster = /^(AND|OR)\b/.exec(text.slice(stelle))
      if (!naechster) break
      if (op && op !== naechster[1]) throw new Error('gemischte Operatoren ohne Klammern')
      op = naechster[1]
      stelle += naechster[1].length
    }
    if (teile.length === 1) return teile[0]
    return { op, kinder: teile }
  }
  const baum = auswerten()
  if (text.slice(stelle).trim()) throw new Error('unerwarteter Rest im Lizenzausdruck')
  const erfuellt = (knoten) => knoten.atom ? erlaubt.has(knoten.atom) : knoten.op === 'OR' ? knoten.kinder.some(erfuellt) : knoten.kinder.every(erfuellt)
  const fehlende = []
  const sammeln = (knoten) => { if (knoten.atom) { if (!erlaubt.has(knoten.atom)) fehlende.push(knoten.atom) } else knoten.kinder.forEach(sammeln) }
  sammeln(baum)
  return { erfuellt: erfuellt(baum), fehlende: [...new Set(fehlende)], ausgelegt }
}

/** Prüft die Rust-Komponentenliste gegen die Richtlinie und die ausdrückliche Entscheidungsliste. */
function pruefeRustKomponenten() {
  if (!existsSync(rustComponentsPath)) fail('licenses/rust-components.json fehlt — node scripts/rust-components.mjs')
  const liste = readJson(rustComponentsPath)
  for (const component of liste.komponenten ?? []) component.sourceId = rustSourceId(component, root)
  const erlaubt = new Set(readJson(policyPath).allowedExpressions)
  const entschieden = existsSync(rustReviewPath) ? (readJson(rustReviewPath).review ?? []) : []
  const offen = []
  const auslegungen = []
  for (const k of liste.komponenten ?? []) {
    if (!k.license) { offen.push({ k, grund: 'keine Lizenzangabe' }); continue }
    const bewertet = spdxAuswerten(k.license, erlaubt)
    if (bewertet.ausgelegt) auslegungen.push(`${k.name} ${k.version}: "${k.license}" als ODER gelesen`)
    if (!bewertet.erfuellt) offen.push({ k, grund: `Lizenz ${k.license} (fehlend: ${bewertet.fehlende.join(', ')})` })
  }
  const unentschieden = offen.filter((o) => !approvedReview(o.k, entschieden, 'license'))
  const ohneHinweisUnentschieden = (liste.komponenten ?? [])
    .filter((k) => k.noticeMissing)
    .filter((k) => !approvedReview(k, entschieden, 'notice'))
  const ausstehend = unresolvedReviews(liste.komponenten ?? [], entschieden)
  const reviewIds = entschieden.map((e) => `${e.name}@${e.version}`)
  if (new Set(reviewIds).size !== reviewIds.length) fail('Doppelte Rust-Entscheidungen')
  if (entschieden.some((e) => !['pending', 'approved', 'rejected', 'resolved'].includes(e.status))) fail('Unbekannter Rust-Entscheidungsstatus')
  // Die verzeichneten Originalhinweise müssen vorhanden und nicht leer sein — sonst ist die
  // Lizenzangabe im Register nur eine Behauptung. (Gegenprobe: eine entfernte Hinweisdatei
  // muss diese Prüfung scheitern lassen.)
  const fehlendeHinweise = []
  for (const k of liste.komponenten ?? []) {
    for (const rel of k.noticeFiles ?? []) {
      const pfad = join(root, 'licenses', rel)
      if (!existsSync(pfad) || statSync(pfad).size === 0) fehlendeHinweise.push(`${k.name} ${k.version}: ${rel}`)
    }
  }
  for (const f of fehlendeHinweise) console.error(`  Originalhinweis fehlt oder ist leer: ${f}`)
  for (const e of ausstehend) console.error(`  Entscheidung ${e.status ?? 'pending'}: ${e.name} ${e.version}`)
  for (const o of unentschieden) console.error(`  offen ohne Entscheidung: ${o.k.name} ${o.k.version} — ${o.grund}`)
  for (const k of ohneHinweisUnentschieden) console.error(`  Originalhinweis fehlt und ist nicht entschieden: ${k.name} ${k.version}`)
  if (unentschieden.length || ohneHinweisUnentschieden.length || fehlendeHinweise.length || ausstehend.length) {
    fail('Rust-Komponenten: offene Lizenz-/Hinweisfragen ohne Eintrag in licenses/rust-review.json oder fehlende Originalhinweise')
  }
  console.log(
    `Rust components: ${liste.anzahl} components, ${liste.mitOriginalhinweis} with original notices, ` +
      `${entschieden.length} explicitly reviewed, ${auslegungen.length} informal expressions read as disjunctions.`
  )
  for (const a of auslegungen) console.log(`  Auslegung: ${a}`)
  return liste
}

/** Revisionsgebundene, absolute Links und eigener Quellcodezugang (M9-003).
 *  Vorher trug `project.source` nur den Text „LICENSE", und der Build-Link der Signatur-Engine
 *  war ein relativer Pfad — im Browser landet so etwas auf SPA-HTML statt auf dem Dokument. */
function ergaenzeQuellzugang(registry) {
  let revision
  try {
    revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    revision = null
  }
  registry.project.repository = 'https://github.com/madventureXD/commietools'
  registry.project.revision = revision
  const absolut = []
  for (const artefakt of registry.artifacts ?? []) {
    for (const feld of ['build', 'source']) {
      const wert = artefakt[feld]
      if (wert && !/^https?:/i.test(wert) && revision) {
        artefakt[feld] = `https://github.com/madventureXD/commietools/blob/${revision}/${wert}`
        absolut.push(`${artefakt.id}.${feld}`)
      }
    }
  }
  return absolut
}

/** Rust-Komponenten samt Hinweisdateien für die Lizenzseite aufbereiten (M9-001/M9-003). */
function baueRustTeil(pruefen) {
  if (!existsSync(rustComponentsPath)) return null
  const liste = readJson(rustComponentsPath)
  const ziel = join(root, 'apps', 'web', 'public', 'licenses', 'notices', 'rust')
  /**
   * Aufräumregel für verwaiste Hinweisordner (Entscheidung Thomas, 2026-10-06).
   *
   * Beim Erzeugen wurden neue Ordner angelegt, alte aber nie entfernt — so sammelten sich dort
   * 21 Leichen nicht mehr enthaltener Komponenten (`lopdf-0.36.0`, `lodf 0.45.0`, `sha2-0.11.0` …),
   * während `licenses/notices/rust` korrekt aufgeräumt war. Beim Erzeugen wird der Zielordner
   * deshalb bereinigt; beim Prüfen werden Verwaiste **gemeldet** statt still entfernt — ein
   * Prüflauf darf nichts ändern.
   */
  const gehoert = new Set((liste.komponenten ?? []).map((k) => `${k.name}-${k.version}`))
  const vorhanden = existsSync(ziel)
    ? readdirSync(ziel, { withFileTypes: true }).filter((eintrag) => eintrag.isDirectory()).map((eintrag) => eintrag.name)
    : []
  const verwaist = vorhanden.filter((name) => !gehoert.has(name)).sort()
  if (pruefen) {
    if (verwaist.length) fail(`verwaiste Hinweisordner in apps/web/public/licenses/notices/rust: ${verwaist.join(', ')} — npm run licenses:generate`)
  } else {
    for (const name of verwaist) rmSync(join(ziel, name), { recursive: true, force: true })
  }
  const komponenten = []
  for (const k of liste.komponenten ?? []) {
    const namen = (k.noticeFiles ?? []).map((rel) => rel.split('/').pop())
    if (!pruefen && namen.length) {
      mkdirSync(join(ziel, `${k.name}-${k.version}`), { recursive: true })
      for (const rel of k.noticeFiles) {
        writeFileSync(join(root, 'apps', 'web', 'public', 'licenses', rel), readFileSync(join(root, 'licenses', rel)))
      }
    }
    komponenten.push({
      name: k.name,
      version: k.version,
      license: k.license,
      repository: k.repository,
      noticeMissing: Boolean(k.noticeMissing),
      notices: namen.map((n) => ({ name: n, pfad: `/licenses/notices/rust/${k.name}-${k.version}/${n}` })),
    })
  }
  const entschieden = existsSync(rustReviewPath) ? (readJson(rustReviewPath).review ?? []) : []
  return {
    summary: {
      components: komponenten.length,
      withNotices: komponenten.filter((k) => !k.noticeMissing).length,
      reviewed: entschieden.length,
    },
    zielprofil: liste.grundlage?.zielprofil ?? null,
    komponenten,
  }
}

if (mode === 'rust-check') { pruefeRustKomponenten(); process.exit(0) }

const registry = buildRegistry()
ergaenzeQuellzugang(registry)
registry.rust = baueRustTeil(mode === 'check')
const registryText = stableJson(registry)
const noticesText = notices(registry)
const projectLicenseText = registry.licenses['AGPL-3.0-only']?.text
if (!projectLicenseText) fail('SPDX does not provide AGPL-3.0-only')

/**
 * Neutralisiert die Revision für den **Vergleich** (Entscheidung Thomas, 2026-10-06).
 *
 * Das Register trägt die Revision des Stands, in dem es erzeugt wurde, und die daraus gebildeten
 * Build-Adressen. Dadurch war nach jedem Commit der Vergleich rot, obwohl sich inhaltlich nichts
 * geändert hatte — gemessen war der Unterschied genau die Revisionszeile samt Adressen. Geprüft
 * wird deshalb der Inhalt **ohne** Revision; gebunden wird sie weiterhin beim Erzeugen (Release),
 * und die ausgelieferte Datei trägt sie unverändert.
 */
function ohneRevision(text) {
  const neutral = 'REVISION'
  return text
    .replace(/"revision":\s*"[0-9a-f]{7,40}"/gu, `"revision": "${neutral}"`)
    .replace(/"revision":\s*null/gu, `"revision": "${neutral}"`)
    .replace(/\/blob\/[0-9a-f]{7,40}\//gu, `/blob/${neutral}/`)
}

if (mode === 'generate') {
  writeFileSync(registryPath, registryText)
  writeFileSync(publicRegistryPath, registryText)
  writeFileSync(noticesPath, noticesText)
  writeFileSync(licensePath, `${projectLicenseText}\n`)
  writeFileSync(copyrightPath, copyrightText)
  console.log(`Generated complete license registry for ${registry.summary.packages} packages and ${registry.summary.licenseIds.length} licenses.`)
  writeFileSync(publicRustPath, readFileSync(rustComponentsPath, 'utf8'))
  pruefeRustKomponenten()
} else if (mode === 'check') {
  for (const [path, expected] of [[registryPath, registryText], [publicRegistryPath, registryText], [noticesPath, noticesText], [licensePath, `${projectLicenseText}\n`], [copyrightPath, copyrightText]]) {
    if (!existsSync(path)) fail(`missing generated file ${path.slice(root.length + 1)}`)
    if (canonicalText(ohneRevision(readFileSync(path, 'utf8'))) !== canonicalText(ohneRevision(expected))) fail(`${path.slice(root.length + 1)} is incomplete or stale; run npm run licenses:generate`)
  }
  console.log(`License audit passed: ${registry.summary.packages} packages, ${registry.summary.licenseIds.length} complete license texts, ${Object.keys(registry.documents).length} preserved package documents.`)
  pruefeRustKomponenten()
} else {
  fail(`unknown mode ${mode}; use generate or check`)
}
