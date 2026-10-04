import { convertDe } from './de'
import { convertEn } from './en'
import { convertEs } from './es'

export const convertMessages = { de: convertDe, en: convertEn, es: convertEs } as const
