export const equationsEn = {
  'tool.equations.title': 'Equation solver',
  'tool.equations.description': 'Linear, quadratic and cubic equations with the full working: discriminant, formula, substituted numbers and a check. All computation stays in the browser.',
  'tool.equations.summary': 'Linear to cubic equations with full working.',
  'tool.equations.terms': 'equation,equation solver,solve equations,linear equation,quadratic equation,cubic equation,polynomial,root,zero,discriminant,quadratic formula,Cardano,working,algebra,maths,school,training,exam,#calculate,#math',

  'tool.equations.degree': 'Degree of the equation',
  'tool.equations.degree.linear': 'Linear (ax + b = 0)',
  'tool.equations.degree.quadratic': 'Quadratic (ax² + bx + c = 0)',
  'tool.equations.degree.cubic': 'Cubic (ax³ + bx² + cx + d = 0)',

  'tool.equations.field.a': 'a',
  'tool.equations.field.b': 'b',
  'tool.equations.field.c': 'c',
  'tool.equations.field.d': 'd',

  'tool.equations.step.standard': 'Original equation',
  'tool.equations.step.isolate': 'Rearrange',
  'tool.equations.step.substitute': 'Substitute',
  'tool.equations.step.check': 'Check',
  'tool.equations.step.discriminant': 'Discriminant',
  'tool.equations.step.formula': 'Formula',
  'tool.equations.step.vertex': 'Vertex',
  'tool.equations.step.noReal': 'No real solutions',
  'tool.equations.step.normalize': 'Normalise',
  'tool.equations.step.reduced': 'Reduced form',
  'tool.equations.step.cardano': 'Cardano',
  'tool.equations.step.back': 'Back-substitution',
  'tool.equations.step.note': 'Special case',

  'tool.equations.out.roots': 'Solutions',
  'tool.equations.out.discriminant': 'Discriminant',
  'tool.equations.out.vertex': 'Vertex (x)',
  'tool.equations.out.check': 'Check',
  'tool.equations.out.steps': 'Working',
  'tool.equations.out.noRoots': 'No real solutions',

  'tool.equations.formulas': 'Linear: x = −b / a. Quadratic: D = b² − 4ac, then x = (−b ± √D) / (2a). Cubic: normalise to x³ + Bx² + Cx + D, substitute x = y − B/3 to reach y³ + py + q = 0 with p = C − B²/3 and q = 2B³/27 − BC/3 + D; Δ = (q/2)² + (p/3)³. For Δ > 0 one real solution via Cardano, for Δ = 0 a double root, for Δ < 0 three real solutions via the trigonometric form.',
  'tool.equations.assumptions': 'Assumptions: computation is floating point — roots are usually irrational, so an exact fraction is not possible. Every root is polished with Newton steps and then verified by substitution; the check appears in the working. A negative discriminant produces no real solutions (the complex values appear in the working as a note). A missing leading coefficient is refused instead of silently dividing.',
  'tool.equations.sources': 'Own formulas, no computer algebra system: Cardano and the trigonometric form for the casus irreducibilis are standard methods of algebra. Verified against known root sets and against the check, with no new dependency. As of 2026-10-03.'
} as const
