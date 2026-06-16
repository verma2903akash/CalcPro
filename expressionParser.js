const TOKEN_PATTERNS = {
  number: /^(?:\d+\.?\d*|\.\d+)/,
  identifier: /^(log10|sin|cos|tan|log|ln|sqrt|deg|rad|Math\.PI|Math\.E|pi|PI|e|π|√)/,
};

const CONSTANTS = {
  'π': Math.PI,
  pi: Math.PI,
  PI: Math.PI,
  'Math.PI': Math.PI,
  e: Math.E,
  'Math.E': Math.E,
};

const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'log', 'log10', 'ln', 'sqrt', '√']);

const normalizeExpression = (expression) =>
  expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/\s+/g, '');

const isImplicitMultiplicationLeft = (token) =>
  token?.type === 'number' ||
  token?.type === 'constant' ||
  token?.type === 'percent' ||
  token?.value === ')';

const isImplicitMultiplicationRight = (token) =>
  token?.type === 'number' ||
  token?.type === 'constant' ||
  token?.type === 'function' ||
  token?.value === '(';

const tokenize = (expression) => {
  const source = normalizeExpression(expression);
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const remaining = source.slice(index);
    const numberMatch = remaining.match(TOKEN_PATTERNS.number);

    if (numberMatch) {
      tokens.push({ type: 'number', value: Number(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = remaining.match(TOKEN_PATTERNS.identifier);

    if (identifierMatch) {
      const value = identifierMatch[0];
      const type = FUNCTIONS.has(value) ? 'function' : 'constant';
      tokens.push({ type, value });
      index += value.length;
      continue;
    }

    const char = source[index];

    if ('+-*/^()%'.includes(char)) {
      tokens.push({ type: char === '%' ? 'percent' : 'operator', value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unexpected token: ${char}`);
  }

  const expanded = [];

  tokens.forEach((token) => {
    const previous = expanded[expanded.length - 1];

    if (isImplicitMultiplicationLeft(previous) && isImplicitMultiplicationRight(token)) {
      expanded.push({ type: 'operator', value: '*' });
    }

    expanded.push(token);
  });

  return expanded;
};

class ExpressionParser {
  constructor(tokens, options = {}) {
    this.tokens = tokens;
    this.index = 0;
    this.angleMode = options.angleMode === 'deg' ? 'deg' : 'rad';
  }

  current() {
    return this.tokens[this.index];
  }

  match(value) {
    if (this.current()?.value !== value) return false;
    this.index += 1;
    return true;
  }

  consume(value) {
    if (!this.match(value)) {
      throw new Error(`Expected ${value}`);
    }
  }

  parse() {
    const value = this.parseAdditive();

    if (this.index < this.tokens.length) {
      throw new Error('Unexpected expression tail');
    }

    return value;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.current()?.value === '+' || this.current()?.value === '-') {
      const operator = this.current().value;
      this.index += 1;
      const right = this.parseMultiplicative(left);
      left = operator === '+' ? left + right : left - right;
    }

    return left;
  }

  parseMultiplicative(percentBase = null) {
    let left = this.parsePower(percentBase);

    while (this.current()?.value === '*' || this.current()?.value === '/') {
      const operator = this.current().value;
      this.index += 1;
      const right = this.parsePower();
      left = operator === '*' ? left * right : left / right;
    }

    return left;
  }

  parsePower(percentBase = null) {
    const left = this.parseUnary(percentBase);

    if (this.match('^')) {
      const right = this.parsePower();
      return Math.pow(left, right);
    }

    return left;
  }

  parseUnary(percentBase = null) {
    if (this.match('+')) return this.parseUnary(percentBase);
    if (this.match('-')) return -this.parseUnary(percentBase);
    return this.parsePostfix(percentBase);
  }

  parsePostfix(percentBase = null) {
    let value = this.parsePrimary();

    while (this.current()?.type === 'percent') {
      this.index += 1;
      value = percentBase === null ? value / 100 : (percentBase * value) / 100;
    }

    return value;
  }

  parsePrimary() {
    const token = this.current();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'number') {
      this.index += 1;
      return token.value;
    }

    if (token.type === 'constant') {
      this.index += 1;
      return CONSTANTS[token.value];
    }

    if (token.type === 'function') {
      return this.parseFunction(token.value);
    }

    if (this.match('(')) {
      const value = this.parseAdditive();
      this.consume(')');
      return value;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  parseFunction(functionName) {
    this.index += 1;
    this.consume('(');
    const argument = this.parseAdditive();
    this.consume(')');

    switch (functionName) {
      case 'sin':
        return Math.sin(this.toRadians(argument));
      case 'cos':
        return Math.cos(this.toRadians(argument));
      case 'tan':
        return Math.tan(this.toRadians(argument));
      case 'log':
      case 'log10':
        return Math.log10(argument);
      case 'ln':
        return Math.log(argument);
      case 'sqrt':
      case '√':
        return Math.sqrt(argument);
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }
  }

  toRadians(value) {
    return this.angleMode === 'deg' ? (value * Math.PI) / 180 : value;
  }
}

const closeOpenParentheses = (expression) => {
  const opens = (expression.match(/\(/g) || []).length;
  const closes = (expression.match(/\)/g) || []).length;
  return closes < opens ? expression + ')'.repeat(opens - closes) : expression;
};

const formatResult = (value) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number(value.toFixed(10));
  return Object.is(rounded, -0) ? '0' : String(rounded);
};

export const evaluateExpression = (expression, options = {}) => {
  try {
    if (!expression) return '0';

    const balancedExpression = closeOpenParentheses(expression);
    const parser = new ExpressionParser(tokenize(balancedExpression), options);

    return formatResult(parser.parse());
  } catch (error) {
    console.error('Expression parsing error:', error);
    return 'Error';
  }
};
