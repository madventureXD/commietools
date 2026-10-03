import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mode = process.argv[2] ?? 'check'
const lockPath = join(root, 'package-lock.json')
const policyPath = join(root, 'licenses', 'policy.json')
const artifactsPath = join(root, 'licenses', 'artifacts.json')
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
  return raw.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git$/, '')
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
    const expression = lockEntry.license
    if (!expression) fail(`${name}@${lockEntry.version ?? 'unknown'} has no license expression in package-lock.json`)
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
    lockfileSha256: sha256(lockText),
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
    ...registry.packages.map((entry) => `| ${entry.name.replace(/\|/g, '\\|')} | ${entry.version} | ${entry.dependencyType}${entry.optional ? ', optional' : ''} | ${entry.licenseExpression.replace(/\|/g, '\\|')} |`),
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

const registry = buildRegistry()
const registryText = stableJson(registry)
const noticesText = notices(registry)
const projectLicenseText = registry.licenses['AGPL-3.0-only']?.text
if (!projectLicenseText) fail('SPDX does not provide AGPL-3.0-only')

if (mode === 'generate') {
  writeFileSync(registryPath, registryText)
  writeFileSync(publicRegistryPath, registryText)
  writeFileSync(noticesPath, noticesText)
  writeFileSync(licensePath, `${projectLicenseText}\n`)
  writeFileSync(copyrightPath, copyrightText)
  console.log(`Generated complete license registry for ${registry.summary.packages} packages and ${registry.summary.licenseIds.length} licenses.`)
} else if (mode === 'check') {
  for (const [path, expected] of [[registryPath, registryText], [publicRegistryPath, registryText], [noticesPath, noticesText], [licensePath, `${projectLicenseText}\n`], [copyrightPath, copyrightText]]) {
    if (!existsSync(path)) fail(`missing generated file ${path.slice(root.length + 1)}`)
    if (readFileSync(path, 'utf8') !== expected) fail(`${path.slice(root.length + 1)} is incomplete or stale; run npm run licenses:generate`)
  }
  console.log(`License audit passed: ${registry.summary.packages} packages, ${registry.summary.licenseIds.length} complete license texts, ${Object.keys(registry.documents).length} preserved package documents.`)
} else {
  fail(`unknown mode ${mode}; use generate or check`)
}
