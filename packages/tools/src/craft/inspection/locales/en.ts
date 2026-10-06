export const inspectionEn = {
  'tool.inspection.title': 'Inspection deadlines',
  'tool.inspection.description': 'Keep recurring inspections for ladders, PPE and test equipment in order: next date from the last inspection and the interval, days remaining and a grouping into overdue, due soon and fine — with a table export. Calculates and stores entirely in the browser.',
  'tool.inspection.summary': 'Next inspection dates from last inspection and interval, with days remaining.',
  'tool.inspection.terms': 'inspection deadline,test date,inspection interval,recurring inspection,ladder,ladder inspection,ppe,test equipment,equipment,dguv,instruction,interval,overdue,due,defect list,health and safety,export,csv,#inspection,#safety',

  'tool.inspection.list': 'Inspection list',
  'tool.inspection.add': 'Add entry',
  'tool.inspection.label': 'Item',
  'tool.inspection.interval': 'Interval (months)',
  'tool.inspection.lastChecked': 'Last inspection',
  'tool.inspection.note': 'Note (optional)',
  'tool.inspection.remove': 'Remove',
  'tool.inspection.empty': 'No entries yet. Enter a name, an interval and the last inspection — the list works out the next date.',
  'tool.inspection.count': 'entries',

  'tool.inspection.nextDue': 'Due on',
  'tool.inspection.daysLeft': 'Days left',
  'tool.inspection.dueToday': 'due today',
  'tool.inspection.daysOverdue': 'days overdue',
  'tool.inspection.state.overdue': 'Overdue',
  'tool.inspection.state.dueSoon': 'Due soon',
  'tool.inspection.state.ok': 'Fine',

  'tool.inspection.settings': 'Warning threshold',
  'tool.inspection.warnDays': 'Due soon from (days before)',

  'tool.inspection.export': 'Save list as a table',
  'tool.inspection.exportName': 'inspection-deadlines.csv',
  'tool.inspection.exportNote': 'Separated by semicolons, dates in the format of the chosen language, so spreadsheet programs open the file without asking.',

  'tool.inspection.header.label': 'Item',
  'tool.inspection.header.note': 'Note',
  'tool.inspection.header.interval': 'Interval (months)',
  'tool.inspection.header.lastChecked': 'Last inspection',
  'tool.inspection.header.nextDue': 'Due on',
  'tool.inspection.header.days': 'Days left',

  'tool.inspection.noReminder': 'Without a server this tool cannot remind you: it shows what is due when opened and keeps the list in this browser. For reminders, take the exported table into a calendar.',
  'tool.inspection.assumptions': 'Assumptions: the next date is the last inspection plus the interval in months; month ends are handled correctly (31 January + 1 month = 28/29 February). "Due today" counts as due soon, not as overdue. The list lives in this browser, not on a server — it is there when you open the tool again, but not on another device. **No suggested intervals:** inspection periods follow from the operator\u2019s risk assessment and from accident-prevention rules; this tool does not know them and does not guess. The grouping replaces neither an inspection nor an instruction.',
  'tool.inspection.sources': 'Method: date arithmetic via Temporal (PlainDate), the same basis as the "Time and date" tool, so month and year boundaries are right. No standard tables and no suggested periods: the tool only calculates what is entered.',

  'tool.inspection.error.empty': 'No entry yet. Enter a name, an interval and the last inspection first.',
  'tool.inspection.error.label': 'Every entry needs a name (80 characters at most).',
  'tool.inspection.error.interval': 'The interval must be a whole number between 1 and 120 months.',
  'tool.inspection.error.date': 'The date of the last inspection is missing or unusable (YYYY-MM-DD).',
  'tool.inspection.error.future': 'The last inspection cannot lie in the future.',
  'tool.inspection.error.tooMany': 'The list is full (200 entries at most). Remove what is done first.',
  'tool.inspection.error.warn': 'The warning threshold must be a whole number between 1 and 365 days.'
} as const
