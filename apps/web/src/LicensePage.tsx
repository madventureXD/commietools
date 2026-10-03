import { useEffect, useMemo, useState } from 'react'
import { Button, LocalBadge } from '@commietools/ui'

type Translate = (key: string) => string
type DependencyType = 'runtime' | 'development'

interface LicenseRecord {
  id: string
  name: string
  url: string
  osiApproved: boolean
  text: string
  sha256: string
}

interface PackageDocument {
  name: string
  documentId: string
}

interface PackageRecord {
  name: string
  version: string
  licenseExpression: string
  licenseIds: string[]
  dependencyType: DependencyType
  optional: boolean
  installed: boolean
  author: string | null
  repository: string | null
  homepage: string | null
  documents: PackageDocument[]
}

interface ArtifactRecord {
  id: string
  name: string
  version: string
  fileName: string
  size: number
  sha256: string
  licenseIds: string[]
  source: string
  build: string
  components: Array<{ name: string; version?: string; commit: string; licenseIds: string[] }>
  toolIds: string[]
}

interface LicenseRegistry {
  project: { name: string; license: string; source: string }
  lockfileSha256: string
  summary: { packages: number; runtime: number; development: number; optional: number; installed: number; licenseIds: string[] }
  licenses: Record<string, LicenseRecord>
  documents: Record<string, { sha256: string; text: string }>
  packages: PackageRecord[]
  artifacts: ArtifactRecord[]
}

export function LicensePage({ t, navigate }: { t: Translate; navigate: (path: string) => void }) {
  const [registry, setRegistry] = useState<LicenseRegistry | null>(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [dependencyType, setDependencyType] = useState<'all' | DependencyType>('all')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/licenses/registry.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<LicenseRegistry>
      })
      .then(setRegistry)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true)
      })
    return () => controller.abort()
  }, [])

  const packages = useMemo(() => {
    if (!registry) return []
    const needle = search.trim().toLocaleLowerCase()
    return registry.packages.filter((entry) => {
      const matchesType = dependencyType === 'all' || entry.dependencyType === dependencyType
      const haystack = `${entry.name} ${entry.version} ${entry.licenseExpression} ${entry.author ?? ''}`.toLocaleLowerCase()
      return matchesType && (!needle || haystack.includes(needle))
    })
  }, [registry, search, dependencyType])

  return <main className="detail-page license-page">
    <button className="text-link back" onClick={() => navigate('/')}>← {t('licenses.back')}</button>
    <section className="suite-hero license-hero">
      <p className="eyebrow">Open Source</p>
      <h1>{t('licenses.title')}</h1>
      <p>{t('licenses.intro')}</p>
      <LocalBadge>{t('status.offline')}</LocalBadge>
    </section>

    {error && <p className="error" role="alert">{t('licenses.error')}</p>}
    {!registry && !error && <p>{t('licenses.loading')}</p>}
    {registry && <div className="license-layout">
      <section className="settings-card stack">
        <div className="license-heading"><div><p className="category">CommieTools</p><h2>{t('licenses.project')}</h2></div><strong>{registry.project.license}</strong></div>
        <p>{t('licenses.projectDescription')}</p>
        <details><summary>{registry.licenses[registry.project.license]?.name ?? registry.project.license}</summary><pre className="license-text">{registry.licenses[registry.project.license]?.text}</pre></details>
      </section>

      <section className="stack">
        <div className="license-heading"><div><p className="category">Open Source</p><h2>{t('licenses.dependencies')}</h2></div><div className="license-totals"><strong>{registry.summary.packages}</strong><span>{t('licenses.packages')}</span><strong>{registry.summary.licenseIds.length}</strong><span>{t('licenses.licenses')}</span></div></div>
        <div className="license-filters">
          <label className="field"><span>{t('licenses.search')}</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="segmented" aria-label={t('licenses.all')}>
            {(['all', 'runtime', 'development'] as const).map((type) => <Button key={type} className={dependencyType === type ? 'active' : ''} onClick={() => setDependencyType(type)}>{t(`licenses.${type}`)}</Button>)}
          </div>
        </div>
        <p className="license-count" aria-live="polite">{packages.length} {t('licenses.packages')}</p>
        <div className="license-list">
          {packages.map((entry) => <details className="license-package" key={`${entry.name}@${entry.version}`}>
            <summary><span><strong>{entry.name}</strong><small>{entry.version}</small></span><span className="license-expression">{entry.licenseExpression}{entry.optional ? ` · ${t('licenses.optional')}` : ''}</span></summary>
            <div className="license-package-content stack">
              {entry.author && <p>{entry.author}</p>}
              <div className="license-links">{entry.repository && <a href={entry.repository} target="_blank" rel="noreferrer">{t('licenses.source')} ↗</a>}{entry.homepage && <a href={entry.homepage} target="_blank" rel="noreferrer">{t('licenses.homepage')} ↗</a>}</div>
              {entry.licenseIds.map((id) => <details key={id}><summary>{registry.licenses[id]?.name ?? id} ({id})</summary><pre className="license-text">{registry.licenses[id]?.text ?? ''}</pre></details>)}
              {entry.documents.length > 0 && <div className="stack"><h3>{t('licenses.notices')}</h3>{entry.documents.map((document) => <details key={document.documentId}><summary>{document.name}</summary><pre className="license-text">{registry.documents[document.documentId]?.text ?? ''}</pre></details>)}</div>}
            </div>
          </details>)}
          {!packages.length && <p>{t('licenses.none')}</p>}
        </div>
      </section>

      {registry.artifacts.length > 0 && <section className="stack">
        <div className="license-heading"><div><p className="category">WebAssembly</p><h2>{t('licenses.artifacts')}</h2></div><strong>{registry.artifacts.length}</strong></div>
        <p>{t('licenses.artifactsDescription')}</p>
        <div className="license-list">{registry.artifacts.map((artifact) => <details className="license-package" key={artifact.id}><summary><span><strong>{artifact.name}</strong><small>{artifact.version} · {(artifact.size / 1024 / 1024).toFixed(2)} MB</small></span><span className="license-expression">{artifact.licenseIds.join(', ')}</span></summary><div className="license-package-content stack"><div className="license-links"><a href={artifact.source} target="_blank" rel="noreferrer">{t('licenses.source')} ↗</a><a href={artifact.build} target="_blank" rel="noreferrer">{t('licenses.build')} ↗</a></div><p><strong>SHA-256:</strong> <code>{artifact.sha256}</code></p><p><strong>{t('licenses.tools')}:</strong> {artifact.toolIds.join(', ')}</p>{artifact.components.map((component) => <div key={`${artifact.id}-${component.name}`}><strong>{component.name}{component.version ? ` ${component.version}` : ''}</strong><p><code>{component.commit}</code> · {component.licenseIds.join(', ')}</p></div>)}{artifact.licenseIds.map((id) => <details key={id}><summary>{registry.licenses[id]?.name ?? id} ({id})</summary><pre className="license-text">{registry.licenses[id]?.text ?? ''}</pre></details>)}</div></details>)}</div>
      </section>}
    </div>}
  </main>
}
