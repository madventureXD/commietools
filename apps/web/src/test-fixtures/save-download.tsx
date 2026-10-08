import React from 'react'
import { createRoot } from 'react-dom/client'
import { SaveFileControl } from '../tools/SaveFileControl'

const bytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55, 10, 0, 255])
const root = document.createElement('div'); document.body.append(root)
createRoot(root).render(<SaveFileControl blob={new Blob([bytes], { type: 'application/pdf' })} suggestedName="Prüfung-日本語.pdf" mimeType="application/pdf" t={(key) => key} />)
