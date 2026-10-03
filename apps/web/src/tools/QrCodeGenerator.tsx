import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { auxiliaryMimeTypes, buildQrPayload, encodeQrPayload, type QrContentType, type QrPayloadInput } from '@commietools/tools'
import { Button, LocalBadge } from '@commietools/ui'
import { SaveFileControl } from './SaveFileControl'

const logoAccept = auxiliaryMimeTypes('qr-code-generator', 'logo').join(',')

type Translate = (key: string) => string
type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded'
type CornerStyle = 'square' | 'rounded' | 'dot' | 'extra-rounded'
type Correction = 'L' | 'M' | 'Q' | 'H'
type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp'

const contentTypes: QrContentType[] = ['text', 'url', 'wifi', 'contact', 'email', 'phone', 'sms', 'geo']
const dotStyles: DotStyle[] = ['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded']
const dotStyleKeys: Record<DotStyle, string> = {
  square: 'square', rounded: 'rounded', dots: 'dots', classy: 'classy',
  'classy-rounded': 'classyRounded', 'extra-rounded': 'extraRounded'
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

export function QrCodeGenerator({ t }: { t: Translate }) {
  const [input, setInput] = useState<QrPayloadInput>({ type: 'url', url: 'https://commietools.org', security: 'WPA' })
  const [size, setSize] = useState(360)
  const [margin, setMargin] = useState(16)
  const [correction, setCorrection] = useState<Correction>('Q')
  const [dotStyle, setDotStyle] = useState<DotStyle>('rounded')
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('extra-rounded')
  const [foreground, setForeground] = useState('#17181b')
  const [background, setBackground] = useState('#ffffff')
  const [cornerColor, setCornerColor] = useState('#c91f2c')
  const [logo, setLogo] = useState('')
  const [logoSize, setLogoSize] = useState(28)
  const [hideDots, setHideDots] = useState(true)
  const [format, setFormat] = useState<ExportFormat>('png')
  const previewRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const payload = useMemo(() => buildQrPayload(input), [input])
  const encodedPayload = useMemo(() => encodeQrPayload(payload), [payload])

  const update = <Key extends keyof QrPayloadInput>(key: Key, value: QrPayloadInput[Key]) => setInput((current) => ({ ...current, [key]: value }))

  useEffect(() => {
    const options = {
      width: size, height: size, type: 'svg' as const, data: encodedPayload || ' ', margin,
      image: logo || undefined,
      qrOptions: { errorCorrectionLevel: correction },
      dotsOptions: { color: foreground, type: dotStyle },
      backgroundOptions: { color: background },
      cornersSquareOptions: { color: cornerColor, type: cornerStyle },
      cornersDotOptions: { color: cornerColor, type: cornerStyle === 'square' ? 'square' as const : 'dot' as const },
      imageOptions: { hideBackgroundDots: hideDots, imageSize: logoSize / 100, margin: 4, saveAsBlob: true }
    }
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options)
      if (previewRef.current) qrRef.current.append(previewRef.current)
    } else {
      qrRef.current.update(options)
    }
  }, [encodedPayload, size, margin, correction, dotStyle, cornerStyle, foreground, background, cornerColor, logo, logoSize, hideDots])

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => setLogo(typeof reader.result === 'string' ? reader.result : ''))
    reader.readAsDataURL(file)
  }

  async function qrBlob(): Promise<Blob | null> {
    if (!payload || !qrRef.current) return null
    const data = await qrRef.current.getRawData(format)
    return data instanceof Blob ? data : data ? new Blob([data]) : null
  }

  const basicInput = (key: keyof QrPayloadInput, label: string, type = 'text') => <Field label={label}><input type={type} value={String(input[key] ?? '')} onChange={(event) => update(key, event.target.value as never)} /></Field>

  return <div className="qr-layout">
    <div className="qr-controls stack">
      <section className="settings-card stack"><h2>{t('tool.qr.content')}</h2><Field label={t('tool.qr.type')}><select value={input.type} onChange={(event) => update('type', event.target.value as QrContentType)}>{contentTypes.map((type) => <option key={type} value={type}>{t(`tool.qr.type.${type}`)}</option>)}</select></Field>
        {input.type === 'text' && <Field label={t('tool.qr.text')}><textarea value={input.text ?? ''} onChange={(event) => update('text', event.target.value)} /></Field>}
        {input.type === 'url' && basicInput('url', t('tool.qr.url'), 'url')}
        {input.type === 'wifi' && <div className="form-grid">{basicInput('ssid', t('tool.qr.ssid'))}{basicInput('password', t('tool.qr.password'), 'password')}<Field label={t('tool.qr.security')}><select value={input.security} onChange={(event) => update('security', event.target.value as QrPayloadInput['security'])}><option value="WPA">WPA/WPA2/WPA3</option><option value="WEP">WEP</option><option value="nopass">{t('tool.qr.security.open')}</option></select></Field><label className="check-field"><input type="checkbox" checked={input.hidden ?? false} onChange={(event) => update('hidden', event.target.checked)} />{t('tool.qr.hidden')}</label></div>}
        {input.type === 'contact' && <div className="form-grid">{basicInput('firstName', t('tool.qr.firstName'))}{basicInput('lastName', t('tool.qr.lastName'))}{basicInput('organization', t('tool.qr.organization'))}{basicInput('phone', t('tool.qr.phone'), 'tel')}{basicInput('email', t('tool.qr.email'), 'email')}{basicInput('website', t('tool.qr.website'), 'url')}</div>}
        {input.type === 'email' && <div className="form-grid">{basicInput('email', t('tool.qr.email'), 'email')}{basicInput('subject', t('tool.qr.subject'))}<Field label={t('tool.qr.body')}><textarea value={input.body ?? ''} onChange={(event) => update('body', event.target.value)} /></Field></div>}
        {input.type === 'phone' && basicInput('phone', t('tool.qr.phone'), 'tel')}
        {input.type === 'sms' && <div className="form-grid">{basicInput('phone', t('tool.qr.phone'), 'tel')}<Field label={t('tool.qr.body')}><textarea value={input.body ?? ''} onChange={(event) => update('body', event.target.value)} /></Field></div>}
        {input.type === 'geo' && <div className="form-grid">{basicInput('latitude', t('tool.qr.latitude'), 'number')}{basicInput('longitude', t('tool.qr.longitude'), 'number')}</div>}
      </section>
      <section className="settings-card stack"><h2>{t('tool.qr.design')}</h2><div className="form-grid"><Field label={`${t('tool.qr.size')}: ${size}px`}><input type="range" min="160" max="1200" step="20" value={size} onChange={(event) => setSize(Number(event.target.value))} /></Field><Field label={`${t('tool.qr.margin')}: ${margin}px`}><input type="range" min="0" max="64" value={margin} onChange={(event) => setMargin(Number(event.target.value))} /></Field><Field label={t('tool.qr.correction')}><select value={correction} onChange={(event) => setCorrection(event.target.value as Correction)}><option value="L">L — 7%</option><option value="M">M — 15%</option><option value="Q">Q — 25%</option><option value="H">H — 30%</option></select></Field><Field label={t('tool.qr.dotsStyle')}><select value={dotStyle} onChange={(event) => setDotStyle(event.target.value as DotStyle)}>{dotStyles.map((style) => <option key={style} value={style}>{t(`tool.qr.style.${dotStyleKeys[style]}`)}</option>)}</select></Field><Field label={t('tool.qr.cornerStyle')}><select value={cornerStyle} onChange={(event) => setCornerStyle(event.target.value as CornerStyle)}><option value="square">{t('tool.qr.style.square')}</option><option value="rounded">{t('tool.qr.style.rounded')}</option><option value="dot">{t('tool.qr.style.dots')}</option><option value="extra-rounded">{t('tool.qr.style.extraRounded')}</option></select></Field><Field label={t('tool.qr.foreground')}><input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} /></Field><Field label={t('tool.qr.background')}><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></Field><Field label={t('tool.qr.cornerColor')}><input type="color" value={cornerColor} onChange={(event) => setCornerColor(event.target.value)} /></Field></div>
        <div className="form-grid"><Field label={t('tool.qr.logo')}><input type="file" accept={logoAccept} onChange={selectLogo} /></Field>{logo && <Button onClick={() => setLogo('')}>{t('tool.qr.removeLogo')}</Button>}<Field label={`${t('tool.qr.logoSize')}: ${logoSize}%`}><input type="range" min="10" max="45" value={logoSize} onChange={(event) => setLogoSize(Number(event.target.value))} /></Field><label className="check-field"><input type="checkbox" checked={hideDots} onChange={(event) => setHideDots(event.target.checked)} />{t('tool.qr.hideDots')}</label></div>
      </section>
    </div>
    <aside className="qr-preview settings-card"><div className="preview-heading"><h2>{t('tool.qr.preview')}</h2><LocalBadge>{t('status.local')}</LocalBadge></div><div ref={previewRef} className="qr-canvas" aria-label={t('tool.qr.preview')} />{!payload && <p>{t('tool.qr.empty')}</p>}<p className="privacy-note">{t('tool.qr.privacy')}</p><p className="scan-note">{t('tool.qr.scanHint')}</p><Field label={t('tool.qr.format')}><select value={format} onChange={(event) => setFormat(event.target.value as ExportFormat)}><option value="png">PNG</option><option value="svg">SVG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></Field>{payload && <SaveFileControl getBlob={qrBlob} suggestedName={`commietools-qr.${format === 'jpeg' ? 'jpg' : format}`} mimeType={format === 'svg' ? 'image/svg+xml' : `image/${format}`} t={t} />}</aside>
  </div>
}
