import { create, all } from 'mathjs';

const math = create(all, {
  number: 'BigNumber',
  precision: 64,
});

export const evaluateExpression = (expression: string): string => {
  try {
    // Replace visual operators with mathjs operators
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√\(/g, 'sqrt(');
    
    // Auto-close parentheses if needed
    const openParens = (sanitized.match(/\(/g) || []).length;
    const closeParens = (sanitized.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      sanitized += ')'.repeat(openParens - closeParens);
    }

    const result = math.evaluate(sanitized);
    
    if (result === undefined || result === null) return '';

    // Format output
    return math.format(result, { precision: 14, lowerExp: -9, upperExp: 9 });
  } catch (error) {
    throw new Error("Invalid Expression");
  }
};
