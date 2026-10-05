import { paintDe } from './de'
import { paintEn } from './en'
import { paintEs } from './es'

export const paintMessages = { de: paintDe, en: paintEn, es: paintEs } as const
