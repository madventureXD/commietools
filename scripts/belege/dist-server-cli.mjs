import { startDistServer } from './dist-server.mjs'
const { origin } = await startDistServer({ port: 4173 })
console.log(`Dist with declared headers: ${origin}`)
