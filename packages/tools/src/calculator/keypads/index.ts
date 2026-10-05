/**
 * Die vier Tastenfelder als Sammlung — **nur für Prüfungen**. Kein Werkzeug lädt dieses Modul:
 * jede Werkzeugroute importiert ihr eigenes Feld aus `keypads/<rechenart>.ts`, damit in ihrem
 * Bündel nur ihr Tastenfeld liegt.
 */
import { type KeypadLayout } from '../keypad'
import { STANDARD_KEYPAD } from './standard'
import { SCIENTIFIC_KEYPAD } from './scientific'
import { PROGRAMMER_KEYPAD } from './programmer'
import { RPN_KEYPAD } from './rpn'

export const ALL_KEYPADS: readonly KeypadLayout[] = [
  STANDARD_KEYPAD,
  SCIENTIFIC_KEYPAD,
  PROGRAMMER_KEYPAD,
  RPN_KEYPAD
]
