/**
 * Belegprüfung im Browser über die Werkzeugrouten (Edge headless über CDP).
 *
 * Zwei Durchgänge in einer Datei, weil beide dasselbe Gerüst brauchen:
 *
 *   node scripts/viewport-audit.mjs             Ueberbreite (Vorgabe 320 px, `overflow`)
 *   node scripts/viewport-audit.mjs a11y        Barrierefreiheit (1360 px und 390 px)
 *
 * Umgebung:
 *   COMMIETOOLS_AUDIT_URL      Vorschauadresse (Vorgabe http://127.0.0.1:5173)
 *   COMMIETOOLS_AUDIT_ROUTES   Kommaliste von Routen (Vorgabe: alle aus dem Register)
 *   COMMIETOOLS_AUDIT_WIDTHS   Kommaliste von Breiten (uebersteuert die Vorgaben)
 *   EDGE_PATH                  Pfad zu msedge.exe
 *
 * Der Barrierefreiheits-Durchgang misst je Route: Bedienzielgroessen, zugaengliche Namen,
 * Beschriftungen der Eingabefelder, Ueberschriftenfolge, Kontrast kleiner und grosser Texte.
 * Jede Route meldet mit, wie viele Bedienelemente sie angesehen hat; findet ein Durchgang
 * nichts anzusehen, bricht er ab, statt still zu bestehen.
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const mode = process.argv[2] === 'a11y' ? 'a11y' : 'overflow'
/**
 * Farbschema der Messung. Der Kontrast unterscheidet sich deutlich: weisse Schrift auf dem
 * Markenrot ergibt im dunklen Schema 3,28:1, im hellen 5,65:1 (gemessen 2026-10-06).
 * Ein vollstaendiger Barrierefreiheits-Durchgang laeuft deshalb zweimal
 * (COMMIETOOLS_AUDIT_SCHEME=dark und =light).
 */
const scheme = process.env.COMMIETOOLS_AUDIT_SCHEME ?? 'dark'
const baseUrl = process.env.COMMIETOOLS_AUDIT_URL ?? 'http://127.0.0.1:5173'
const edgePath = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const catalog = await readFile(new URL('../packages/tools/src/catalog/toolIndex.ts', import.meta.url), 'utf8')
const allRoutes = [...catalog.matchAll(/"route": "([^"]+)"/gu)].map((match) => match[1])
const routes = process.env.COMMIETOOLS_AUDIT_ROUTES?.split(',').filter(Boolean) ?? allRoutes
const widths = (process.env.COMMIETOOLS_AUDIT_WIDTHS?.split(',').filter(Boolean).map(Number)
  ?? (mode === 'a11y' ? [1360, 390] : [320]))
const profile = await mkdtemp(join(tmpdir(), 'commietools-audit-'))
const port = 9333 + Math.floor(Math.random() * 500)
const edge = spawn(edgePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' })

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
let socket
let nextId = 0
const pending = new Map()

function command(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

const evaluate = async (expression) => {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(`Page error: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`)
  return result.result.value
}

/** Wartet, bis die Route wirklich gerendert ist — sonst prüft der Lauf eine leere Seite. */
async function waitForRoute() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const ready = await evaluate('(() => ({ tool: Boolean(document.querySelector(".tool-content")), h1: Boolean(document.querySelector("main h1")) }))()')
    if (ready.tool) return { ready: true }
    await delay(250)
  }
  const url = await evaluate('location.href').catch(() => null)
  const body = await evaluate('document.body ? document.body.innerText.slice(0, 60) : null').catch(() => null)
  return { ready: false, url, body }
}

const OVERFLOW_JS = `(() => {
  const width = document.documentElement.clientWidth;
  const visible = (element) => {
    if (typeof element.checkVisibility === 'function') {
      return element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true });
    }
    const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  };
  const offenders = [...document.querySelectorAll('body *')].flatMap((element) => {
    const rect = element.getBoundingClientRect();
    const scrollContainer = [...function* () { let parent = element.parentElement; while (parent) { yield parent; parent = parent.parentElement } }()].find((parent) => { const parentStyle = getComputedStyle(parent); return /(auto|scroll)/.test(parentStyle.overflowX) && parent.scrollWidth > parent.clientWidth });
    if (!visible(element) || rect.right <= width + 0.5 || scrollContainer) return [];
    return [{ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 100), right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10, ancestors: [...function* () { let parent = element.parentElement; while (parent && parent !== document.body) { yield parent.tagName.toLowerCase() + (parent.className ? '.' + String(parent.className).trim().replace(/\\\\s+/g, '.') : ''); parent = parent.parentElement } }()].slice(0, 5) }];
  });
  return { viewport: width, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 12) };
})()`

const A11Y_JS = `(async () => {
  const MIN_TARGET = 44;
  /**
   * Leer seit 2026-10-06: Die weisse Schrift auf dem Markenrot ergab 3,28:1 bei verlangten 4,5:1.
   * Behoben ueber das schemaabhaengige Token --color-action-text (hell weiss 5,65:1, dunkel
   * dunkel 5,76:1). Die Flaechen werden damit wieder regulaer geprueft; eine stehende Ausnahme
   * wuerde kuenftige Regressionen an genau diesen Flaechen verschlucken.
   */
  const AKZEPTIERTE_KONTRASTE = [
  ];
  /**
   * Wichtig: Chromium meldet fuer Inhalte in einem GESCHLOSSENEN details weiterhin ein Rechteck
   * (versteckt wird ueber content-visibility, nicht ueber display). Eine Sichtbarkeitspruefung
   * nur ueber display/visibility/rect zaehlt solche Inhalte faelschlich als sichtbar.
   */
  const visible = (element) => {
    if (typeof element.checkVisibility === 'function') {
      return element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true });
    }
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  };
  const text = (element) => (element ? (element.textContent || '').replace(/\\s+/g, ' ').trim() : '');
  const labelFor = (element) => {
    if (!element.id) return null;
    const labels = document.querySelectorAll('label[for="' + CSS.escape(element.id) + '"]');
    return labels.length ? text(labels[0]) : null;
  };
  const accessibleName = (element) => {
    if (element.getAttribute('aria-labelledby')) {
      const ids = element.getAttribute('aria-labelledby').split(/\\s+/);
      const parts = ids.map((id) => text(document.getElementById(id))).filter(Boolean);
      if (parts.length) return parts.join(' ');
    }
    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label').trim();
    const tag = element.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') {
      const own = labelFor(element) || text(element.closest('label'));
      if (own) return own;
      if (element.getAttribute('placeholder')) return element.getAttribute('placeholder').trim();
      if (element.getAttribute('title')) return element.getAttribute('title').trim();
      return null;
    }
    if (tag === 'img') return (element.getAttribute('alt') || '').trim() || null;
    /**
     * Sichtbaren Text OHNE aria-hidden-Kinder lesen. Die Gegenprobe (Karte M2-009) deckte die
     * Luecke auf: Ein Knopf, dessen gesamter Inhalt in einem aria-hidden-Element steckt (etwa ein
     * reines Symbol), wurde als "benannt" gezaehlt, obwohl assistive Technik KEINEN Namen erhaelt.
     * Genau solche Knoepfe sind hier der klassische Fall (Symbolknoepfe, Schubladen, Werkzeugleisten).
     * (Kein Backtick in diesem Kommentar — er beendet sonst den Template-String des Messausdrucks.)
     */
    const sichtbarerText = [...element.childNodes]
      .filter((node) => !(node.nodeType === 1 && node.getAttribute('aria-hidden') === 'true'))
      .map((node) => node.textContent || '')
      .join(' ')
      .replace(/\\s+/g, ' ')
      .trim();
    return sichtbarerText || (element.getAttribute('title') || '').trim() || null;
  };
  const describe = (element) => element.tagName.toLowerCase() + (element.className ? '.' + String(element.className).trim().replace(/\\s+/g, '.').slice(0, 60) : '');
  const inParagraphText = (element) => {
    const name = accessibleName(element) || '';
    if (name.split(' ').length > 6 || name.length > 60) return true;
    return false;
  };
  const interactiveSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="checkbox"], [role="switch"], [tabindex]:not([tabindex="-1"])';
  const controls = [...document.querySelectorAll(interactiveSelector)].filter(visible);

  const findings = { controls: controls.length, targets: [], names: [], labels: [], headings: [], contrast: [], contrastAkzeptiert: [], ariaHidden: [], clipped: [] };

  for (const element of controls) {
    const rect = element.getBoundingClientRect();
    const name = accessibleName(element);
    if (!name) findings.names.push({ element: describe(element), html: element.outerHTML.slice(0, 120) });
    if (element.getAttribute('aria-hidden') === 'true') findings.ariaHidden.push({ element: describe(element), name });
    const isInlineLink = element.tagName.toLowerCase() === 'a' && inParagraphText(element);
    const width = Math.round(rect.width); const height = Math.round(rect.height);
    // Steckt das Bedienelement in einem Etikett, ist das Etikett seine Klickfläche — so bedient man
    // ein Kontrollkästchen: man klickt den Text daneben. Gemessen wird dann das Etikett; die eigene
    // Größe des Elements wird trotzdem mitgeschrieben, damit die Zahl niemandem verborgen bleibt.
    const etikett = element.closest('label');
    const ziel = etikett ? etikett.getBoundingClientRect() : rect;
    const zielBreite = Math.round(ziel.width); const zielHoehe = Math.round(ziel.height);
    if (!isInlineLink && (zielHoehe < MIN_TARGET || zielBreite < MIN_TARGET)) {
      findings.targets.push({ element: describe(element), width, height, zielBreite, zielHoehe, ueberEtikett: Boolean(etikett), name: name ? name.slice(0, 48) : null });
    }
    if (element.scrollWidth > element.clientWidth + 1) {
      findings.clipped.push({ element: describe(element), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, name: name ? name.slice(0, 40) : null });
    }
  }

  for (const element of [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')].filter(visible)) {
    const name = accessibleName(element);
    if (!name) findings.labels.push({ element: describe(element), id: element.id || null, type: element.getAttribute('type') });
  }

  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible).map((element) => Number(element.tagName[1]));
  const jumps = [];
  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index] - headings[index - 1] > 1) jumps.push('Sprung ' + headings[index - 1] + ' zu ' + headings[index]);
  }
  /**
   * Inhalt in einem geschlossenen details zaehlt fuer Hilfstechnik nicht — und wird deshalb oben
   * nicht mitgezaehlt. Beim Aufklappen ist er aber da; die Ueberschriftenfolge wird deshalb
   * zusaetzlich mit geoeffneten Abschnitten geprueft, sonst meldet die Pruefung eine Struktur
   * als sauber, die der Nutzer nach einem Klick als Sprung hoert.
   */
  const closed = [...document.querySelectorAll('details:not([open])')];
  closed.forEach((element) => { element.open = true });
  const opened = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible).map((element) => Number(element.tagName[1]));
  closed.forEach((element) => { element.open = false });
  const jumpsOpened = [];
  for (let index = 1; index < opened.length; index += 1) {
    if (opened[index] - opened[index - 1] > 1) jumpsOpened.push('Sprung ' + opened[index - 1] + ' zu ' + opened[index]);
  }
  findings.headings = { sequence: headings.slice(0, 20), h1Count: headings.filter((level) => level === 1).length, jumps, jumpsOpened, closedSections: closed.length };

  const parseColor = (value) => {
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return null;
    const parts = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const luminance = (color) => {
    const channel = (value) => { const normalized = value / 255; return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4) };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  };
  const ratio = (first, second) => { const a = luminance(first); const b = luminance(second); const light = Math.max(a, b); const dark = Math.min(a, b); return (light + 0.05) / (dark + 0.05) };
  const effectiveBackground = (element) => {
    let node = element;
    while (node) {
      const style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== 'none') return null;
      const color = parseColor(style.backgroundColor);
      if (color && color.a === 1) return color;
      node = node.parentElement;
    }
    return null;
  };
  let skippedContrast = 0;
  for (const element of [...document.querySelectorAll('body *')].filter(visible)) {
    const own = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim().length > 1);
    if (!own) continue;
    const style = getComputedStyle(element);
    const color = parseColor(style.color);
    const background = effectiveBackground(element);
    if (!color || !background) { skippedContrast += 1; continue; }
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = large ? 3 : 4.5;
    const measured = Math.round(ratio(color, background) * 100) / 100;
    if (measured < required) {
      const eintrag = { element: describe(element), text: text(element).slice(0, 40), size: Math.round(size * 10) / 10, weight, required, measured };
      if (AKZEPTIERTE_KONTRASTE.some((ausnahme) => element.matches(ausnahme.auswahl))) findings.contrastAkzeptiert.push(eintrag);
      else findings.contrast.push(eintrag);
    }
  }
  findings.skippedContrast = skippedContrast;
  findings.targets = findings.targets.slice(0, 40);
  findings.names = findings.names.slice(0, 20);
  findings.labels = findings.labels.slice(0, 20);
  findings.contrast = findings.contrast.slice(0, 20);
  findings.ariaHidden = findings.ariaHidden.slice(0, 10);
  findings.clipped = findings.clipped.slice(0, 20);

  /**
   * **Offenes Menue (Karte M2-009).** Der geschlossene Zustand sagt nichts ueber die Eintraege der
   * Werkzeugschublade: Sie sind unsichtbar und werden von der Hauptschleife uebersprungen. Hier
   * wird die Schublade geoeffnet, mitgemessen und wieder geschlossen — der Reproduzierbarkeit
   * wegen mit fester Wartezeit, und weil ein Menue ohne Messung eine ungeprueft ausgelieferte
   * Flaeche ist.
   */
  findings.opened = { elements: 0, names: [], targets: [] };
  const menueKnopf = document.querySelector('button.tool-menu-open');
  if (menueKnopf) {
    menueKnopf.click();
    await new Promise((fertig) => setTimeout(fertig, 300));
    const imMenue = [...document.querySelectorAll(interactiveSelector)].filter(visible);
    findings.opened.elements = imMenue.length;
    for (const element of imMenue) {
      if (!accessibleName(element)) findings.opened.names.push({ element: describe(element), html: element.outerHTML.slice(0, 120) });
      const flaeche = element.closest('label') ?? element;
      const kasten = flaeche.getBoundingClientRect();
      const istLink = element.tagName.toLowerCase() === 'a' && inParagraphText(element);
      if (!istLink && (kasten.width < MIN_TARGET || kasten.height < MIN_TARGET)) {
        findings.opened.targets.push({ element: describe(element), width: Math.round(kasten.width), height: Math.round(kasten.height) });
      }
    }
    findings.opened.names = findings.opened.names.slice(0, 20);
    findings.opened.targets = findings.opened.targets.slice(0, 20);
    menueKnopf.click();
    await new Promise((fertig) => setTimeout(fertig, 150));
  }

  return findings;
})()`

try {
  let target
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      target = targets.find((item) => item.type === 'page')
      if (target) break
    } catch { /* Edge is still starting. */ }
    await delay(100)
  }
  if (!target) throw new Error('Edge debugging target did not start')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result)
  })
  await command('Page.enable')
  await command('Runtime.enable')
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] })

  const failures = []
  let emptyRoutes = 0
  for (const width of widths) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 })
    for (const route of routes) {
      await command('Page.navigate', { url: `${baseUrl}${route}` })
      const state = await waitForRoute()
      if (!state.ready) {
        emptyRoutes += 1
        console.error(`Route ohne Inhalt: ${route} (${width} px) — Seite steht auf ${state.url}, Text: ${JSON.stringify(state.body)}`)
        console.error('  Hinweis: Vorschau lauscht oft nur auf IPv6 ([::1]) — dann http://localhost:<port> verwenden, nicht 127.0.0.1.')
        continue
      }
      await delay(400)
      if (mode === 'overflow') {
        const measurement = await evaluate(OVERFLOW_JS)
        if (!measurement) throw new Error(`No measurement on ${route}`)
        if (measurement.scrollWidth > measurement.viewport || measurement.offenders.length) failures.push({ route, width, ...measurement })
        else console.log(`ok ${route} ${width}px`)
      } else {
        const findings = await evaluate(A11Y_JS)
        if (!findings) throw new Error(`No a11y measurement on ${route}`)
        if (findings.controls === 0) { emptyRoutes += 1; console.error(`Route ohne Bedienelemente: ${route} (${width} px)`); continue }
        const geoeffnet = findings.opened ?? { elements: 0, names: [], targets: [] }
        const problems = findings.targets.length + findings.names.length + findings.labels.length
          + findings.contrast.length + findings.ariaHidden.length + findings.clipped.length
          + findings.headings.jumps.length + findings.headings.jumpsOpened.length
          + geoeffnet.names.length + geoeffnet.targets.length
          + (findings.headings.h1Count !== 1 ? 1 : 0)
        console.log(`${problems ? 'BEFUND' : 'ok'} ${route} ${width}px  Bedienelemente=${findings.controls}`
          + ` Ziele<44=${findings.targets.length} ohneNamen=${findings.names.length} ohneBeschriftung=${findings.labels.length}`
          + ` Kontrast=${findings.contrast.length} akzeptiert=${findings.contrastAkzeptiert.length} (uebersprungen=${findings.skippedContrast}) abgeschnitten=${findings.clipped.length}`
          + ` h1=${findings.headings.h1Count} Spruenge=${findings.headings.jumps.length}/${findings.headings.jumpsOpened.length}`
          + ` Menue=${geoeffnet.elements} MenueOhneNamen=${geoeffnet.names.length} MenueZiele<44=${geoeffnet.targets.length}`)
        if (problems) failures.push({ route, width, ...findings })
      }
    }
  }
  if (emptyRoutes) { console.error(`Abbruch: ${emptyRoutes} Durchgänge ohne prüfbaren Inhalt`); process.exitCode = 2 }
  else if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1 }
  else console.log(`Audit passed (${mode}, Schema ${scheme}): ${routes.length} routes${widths.length > 1 ? ` × ${widths.length} widths` : ''}`)

/**
 * **Grenzen dieses Pruefers, ausdruecklich (Karte M2-009).** Ein gruener Lauf ist kein
 * WCAG-Urteil: Er sieht das DOM einer gerenderten Seite an — nicht, was ein Vorleser vorliest,
 * nicht die Fokusreihenfolge bei reiner Tastaturbedienung, nicht das Verhalten bei 400 % Zoom und
 * nicht reduzierte Bewegung. Diese Faelle bleiben Handarbeit und stehen so auch in der Uebergabe.
 */
if (mode === 'a11y') {
  console.log('Nicht geprueft: Vorleserausgabe, Tastaturdurchlauf, Zoom bis 400%, Fokusreihenfolge, reduzierte Bewegung.')
}
} finally {
  socket?.close()
  edge.kill()
  if (edge.exitCode === null) await Promise.race([once(edge, 'exit'), delay(2000)])
  /**
   * Aufräumen darf eine laufende Ausnahme nicht ersetzen: Ein `throw` im `finally` überschreibt
   * den ursprünglichen Fehler, und die eigentliche Ursache geht verloren. Deshalb wird ein
   * endgültig misslungenes Aufräumen **gemeldet**, nicht geworfen (Lint-Regel no-unsafe-finally).
   */
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { await rm(profile, { recursive: true, force: true }); break } catch (error) {
      if (attempt === 4) console.error(`Profil konnte nicht entfernt werden: ${profile} (${error?.message ?? error})`)
      else await delay(200)
    }
  }
}
