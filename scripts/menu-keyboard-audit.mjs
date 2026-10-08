import assert from 'node:assert/strict'
import { starte } from './belege/cdp-harness.mjs'
import { startDistServer } from './belege/dist-server.mjs'

const service = await startDistServer()
const browser = await starte({ breite: 390 })
const key = async (key, code, windowsVirtualKeyCode, modifiers = 0) => {
  const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined
  await browser.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, code, text, unmodifiedText: text, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode, modifiers })
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode, modifiers })
}
const until = async (expression) => {
  for (let attempt = 0; attempt < 80; attempt += 1) { if (await browser.evaluate(expression)) return; await browser.warte(50) }
  throw new Error('Keyboard state timeout: ' + expression)
}
try {
  await browser.oeffne(service.origin + '/tools/pdf-split')
  await browser.send('Page.bringToFront')
  await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await until('!!document.querySelector("button.tool-menu-trigger")')
  await until('!!document.querySelector(".tool-content")')
  const route = await browser.evaluate('location.pathname')
  await browser.evaluate('document.querySelector("button.tool-menu-trigger").focus()')
  await key('Enter', 'Enter', 13)
  await until('document.querySelector("dialog").matches(":modal")')
  await browser.warte(400)
  assert.equal(await browser.evaluate('document.activeElement.matches(".tool-menu-close")'), true)
  const groups = await browser.evaluate('document.querySelectorAll(".tool-menu-group").length')
  assert.ok(groups > 0)
  for (let index = 0; index < groups; index += 1) {
    await browser.evaluate(`document.querySelectorAll('.tool-menu-group > summary')[${index}].focus()`)
    await key(' ', 'Space', 32)
    assert.equal(await browser.evaluate(`document.querySelectorAll('.tool-menu-group')[${index}].open`), true)
  }
  const count = await browser.evaluate('document.querySelectorAll("dialog button,dialog input,dialog summary").length')
  for (const modifiers of [0, 8]) {
    for (let index = 0; index < count + 2; index += 1) {
      await key('Tab', 'Tab', 9, modifiers)
      assert.equal(await browser.evaluate('document.querySelector("dialog").contains(document.activeElement)'), true, `Focus escaped, tab ${index}, shift ${Boolean(modifiers)}`)
    }
  }
  await key('Escape', 'Escape', 27)
  await until('!document.querySelector("dialog").open && document.activeElement.matches(".tool-menu-trigger")')
  assert.equal(await browser.evaluate('location.pathname'), route)
  await key('Enter', 'Enter', 13)
  await until('document.querySelector("dialog").open')
  const history = await browser.send('Page.getNavigationHistory')
  assert.ok(history.currentIndex > 0)
  await browser.send('Page.navigateToHistoryEntry', { entryId: history.entries[history.currentIndex - 1].id })
  await until('!document.querySelector("dialog").open && document.activeElement.matches(".tool-menu-trigger")')
  assert.equal(await browser.evaluate('location.pathname'), route)
  assert.deepEqual(browser.fehler, [])
  console.log(JSON.stringify({ passed: 'Actual browser key events: Enter, all category summaries by Space, forward/backward Tab containment, Escape, browser Back, route stability and focus return', groups, tabEvents: (count + 2) * 2, width: 390, screenReader: 'not tested', realTouch: 'not tested' }, null, 2))
} finally { await browser.ende(); await service.close() }
