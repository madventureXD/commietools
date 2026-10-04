export const plotterEn = {
  'tool.plotter.title': 'Function plotter',
  'tool.plotter.description': 'Plot several functions at once, with a value table and computed roots. Drawing uses our own renderer. All computation stays in the browser.',
  'tool.plotter.summary': 'Curves, value table and roots.',
  'tool.plotter.terms': 'function plotter,plotter,function,curve,graph,chart,plot,draw,root,zero,value table,parabola,sine,slope,intercept,maths,school,training,#calculate,#math',

  'tool.plotter.field.curves': 'Functions (one per line, variable x)',
  'tool.plotter.field.xMin': 'x from',
  'tool.plotter.field.xMax': 'x to',
  'tool.plotter.field.yMin': 'y from (optional)',
  'tool.plotter.field.yMax': 'y to (optional)',
  'tool.plotter.field.samples': 'Table sample points',
  'tool.plotter.out.plot': 'Plot',
  'tool.plotter.out.roots': 'Roots',
  'tool.plotter.out.table': 'Value table',
  'tool.plotter.out.noRoots': 'No root found in the range.',
  'tool.plotter.out.curve': 'Curve',
  'tool.plotter.out.x': 'x',
  'tool.plotter.out.notDefined': 'not defined',

  'tool.plotter.note.engine': 'Drawing uses our own renderer: it derives the curve points from the same core that computes the value table. No drawing library is loaded.',
  'tool.plotter.note.table': 'The value table and the roots are computed by the calculator core, not by the renderer. That keeps a single computation path for an expression.',
  'tool.plotter.note.roots': 'Roots are found by looking for sign changes and narrowing them down. A pole such as in 1/x is not a root and is never reported as one.',

  'tool.plotter.formulas': 'Drawing uses sample points across the given x range. The value table substitutes the requested number of x values into every function. Roots: the sign of the function value is compared between neighbouring sample points; on a change, the position is narrowed by repeated bisection to about 1e-15 and the value there is checked.',
  'tool.plotter.assumptions': 'Assumptions: the variable is named x. Ranges must satisfy x from < x to. y limits are optional; without them the renderer scales the view itself. Value table and roots compute in the calculator core\'s decimal model (64 digits). Undefined points (such as division by zero) are marked as such, never shown as 0.',
  'tool.plotter.sources': 'Drawing: own renderer (SVG geometry), no drawing library. Computation: our own calculator core (mathjs, Apache-2.0, ADR 0005). Root finding: own bisection with a pole check. As of 2026-10-03.'
} as const
