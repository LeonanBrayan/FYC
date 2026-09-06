export interface ExecutionResult {
  output: string[];
  error?: string;
  executionTimeMs: number;
}

/**
 * Lightweight safe in-browser Python interpreter for beginner tutorials
 * Supports: print, arithmetic, variables, basic f-strings, comments, type conversion, basic if/elif/else
 */
export function executeMiniPython(code: string, simulatedInputs: string[] = []): ExecutionResult {
  const startTime = performance.now();
  const outputs: string[] = [];
  const inputQueue = [...simulatedInputs];
  const env: Record<string, any> = {
    math: {
      sqrt: Math.sqrt,
      ceil: Math.ceil,
      floor: Math.floor,
      trunc: Math.trunc,
      pi: Math.PI
    },
    random: {
      randint: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      choice: (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
    }
  };

  const executeLineOrBlock = (lines: string[], currentEnv: Record<string, any>) => {
    let i = 0;
    while (i < lines.length) {
      let line = lines[i].trim();

      if (!line || line.startsWith('#')) {
        i++;
        continue;
      }

      // Handle imports (e.g. import math, import random, from math import sqrt)
      if (line.startsWith('import ') || line.startsWith('from ')) {
        i++;
        continue;
      }

      // Handle print()
      if (line.startsWith('print(') && line.endsWith(')')) {
        const inner = line.slice(6, -1);
        const evaluated = evaluatePrintArgs(inner, currentEnv);
        outputs.push(evaluated);
        i++;
        continue;
      }

      // Handle for loop: for i in range(1, 11):
      if (line.startsWith('for ') && line.includes(' in ') && line.endsWith(':')) {
        const forMatch = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/);
        if (forMatch) {
          const iterVar = forMatch[1];
          const iterExpr = forMatch[2].trim();

          i++;
          const loopBlock: string[] = [];
          while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || !lines[i].trim())) {
            if (lines[i].trim()) loopBlock.push(lines[i].replace(/^ {4}|\t/, ''));
            i++;
          }

          let items: any[] = [];
          if (iterExpr.startsWith('range(') && iterExpr.endsWith(')')) {
            const rangeArgs = iterExpr.slice(6, -1).split(',').map((s) => evaluateExpression(s.trim(), currentEnv));
            let start = 0, stop = 0, step = 1;
            if (rangeArgs.length === 1) {
              stop = Number(rangeArgs[0]);
            } else if (rangeArgs.length === 2) {
              start = Number(rangeArgs[0]);
              stop = Number(rangeArgs[1]);
            } else if (rangeArgs.length >= 3) {
              start = Number(rangeArgs[0]);
              stop = Number(rangeArgs[1]);
              step = Number(rangeArgs[2]) || 1;
            }
            if (step > 0) {
              for (let v = start; v < stop; v += step) items.push(v);
            } else if (step < 0) {
              for (let v = start; v > stop; v += step) items.push(v);
            }
          }

          for (const item of items) {
            currentEnv[iterVar] = item;
            executeLineOrBlock(loopBlock, currentEnv);
          }
          continue;
        }
      }

      // Handle if / elif / else
      if (line.startsWith('if ') && line.endsWith(':')) {
        const branches: { condition?: string; block: string[] }[] = [];
        const cond = line.slice(3, -1).trim();
        i++;
        const firstBlock: string[] = [];
        while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || !lines[i].trim())) {
          if (lines[i].trim()) firstBlock.push(lines[i].replace(/^ {4}|\t/, ''));
          i++;
        }
        branches.push({ condition: cond, block: firstBlock });

        while (i < lines.length && lines[i].trim().startsWith('elif ') && lines[i].trim().endsWith(':')) {
          const elifCond = lines[i].trim().slice(5, -1).trim();
          i++;
          const elifBlock: string[] = [];
          while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || !lines[i].trim())) {
            if (lines[i].trim()) elifBlock.push(lines[i].replace(/^ {4}|\t/, ''));
            i++;
          }
          branches.push({ condition: elifCond, block: elifBlock });
        }

        if (i < lines.length && lines[i].trim().startsWith('else:')) {
          i++;
          const elseBlock: string[] = [];
          while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || !lines[i].trim())) {
            if (lines[i].trim()) elseBlock.push(lines[i].replace(/^ {4}|\t/, ''));
            i++;
          }
          branches.push({ block: elseBlock });
        }

        for (const branch of branches) {
          if (!branch.condition || evaluateCondition(branch.condition, currentEnv)) {
            executeLineOrBlock(branch.block, currentEnv);
            break;
          }
        }
        continue;
      }

      // Handle variable assignment
      if (line.includes('=')) {
        const eqIdx = line.indexOf('=');
        const varName = line.slice(0, eqIdx).trim();
        let rightSide = line.slice(eqIdx + 1).trim();

        if (rightSide.includes('input(')) {
          const inputStart = rightSide.indexOf('input(') + 6;
          let pDepth = 1;
          let promptEnd = inputStart;
          let inQ = false;
          let qC = '';
          for (let idx = inputStart; idx < rightSide.length; idx++) {
            const ch = rightSide[idx];
            if ((ch === '"' || ch === "'") && (idx === 0 || rightSide[idx - 1] !== '\\')) {
              if (!inQ) { inQ = true; qC = ch; }
              else if (qC === ch) { inQ = false; }
            }
            if (!inQ) {
              if (ch === '(') pDepth++;
              else if (ch === ')') {
                pDepth--;
                if (pDepth === 0) {
                  promptEnd = idx;
                  break;
                }
              }
            }
          }
          const promptText = cleanStringLiteral(rightSide.slice(inputStart, promptEnd).trim());
          
          let inputValue = inputQueue.length > 0 ? inputQueue.shift()! : (
            varName === 'ano_nascimento' || varName === 'ano_nasc' ? '2004' :
            varName === 'nome' ? 'Leonan' :
            varName === 'curso' ? 'Python' :
            varName === 'numero' ? '7' :
            varName === 'velocidade' ? '85' : '10'
          );
          if (promptText) {
            outputs.push(`\x1b[36m[Input Solicitado]\x1b[0m ${promptText} => \x1b[33m${inputValue}\x1b[0m`);
          }

          if (rightSide.startsWith('int(')) {
            currentEnv[varName] = parseInt(inputValue, 10) || 0;
          } else if (rightSide.startsWith('float(')) {
            currentEnv[varName] = parseFloat(inputValue) || 0.0;
          } else {
            currentEnv[varName] = inputValue;
          }
          i++;
          continue;
        }

        try {
          currentEnv[varName] = evaluateExpression(rightSide, currentEnv);
        } catch {
          currentEnv[varName] = rightSide.replace(/['"]/g, '');
        }
        i++;
        continue;
      }

      i++;
    }
  };

  try {
    executeLineOrBlock(code.split('\n'), env);

    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      output: outputs.length > 0 ? outputs : ['[Execução finalizada sem saída no console]'],
      executionTimeMs
    };
  } catch (err: any) {
    return {
      output: outputs,
      error: `SyntaxError / RuntimeError: ${err.message || 'Erro ao processar linha de comando'}`,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

function cleanStringLiteral(str: string): string {
  str = str.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}

function evaluateExpression(expr: string, env: Record<string, any>): any {
  expr = expr.trim();
  
  // String literal
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }

  // Pure number
  if (!isNaN(Number(expr))) {
    return Number(expr);
  }

  // Direct variable
  if (expr in env) {
    return env[expr];
  }

  // Handle len(str)
  if (expr.startsWith('len(') && expr.endsWith(')')) {
    const inside = expr.slice(4, -1).trim();
    const val = evaluateExpression(inside, env);
    return typeof val === 'string' || Array.isArray(val) ? val.length : 0;
  }

  // Handle slicing e.g. frase[:5] or frase[0:5]
  const sliceMatch = expr.match(/^([a-zA-Z_]\w*)\[(-?\d*):(-?\d*)\]$/);
  if (sliceMatch) {
    const target = env[sliceMatch[1]];
    if (typeof target === 'string') {
      const s = sliceMatch[2] ? parseInt(sliceMatch[2], 10) : 0;
      const e = sliceMatch[3] ? parseInt(sliceMatch[3], 10) : target.length;
      return target.slice(s, e);
    }
  }

  // Handle math.sqrt, math.ceil, etc. or random.randint
  if (expr.startsWith('math.') || expr.startsWith('random.')) {
    const fnMatch = expr.match(/^(math|random)\.([a-zA-Z_]\w*)\((.*)\)$/);
    if (fnMatch) {
      const mod = fnMatch[1];
      const fnName = fnMatch[2];
      const args = fnMatch[3] ? fnMatch[3].split(',').map(s => evaluateExpression(s.trim(), env)) : [];
      if (env[mod] && typeof env[mod][fnName] === 'function') {
        return env[mod][fnName](...args);
      }
    }
  }

  // Handle string methods: .upper(), .lower(), .replace(), .find()
  const methodMatch = expr.match(/^([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\((.*)\)$/);
  if (methodMatch) {
    const target = env[methodMatch[1]];
    const method = methodMatch[2];
    const argsStr = methodMatch[3];
    if (typeof target === 'string') {
      if (method === 'upper') return target.toUpperCase();
      if (method === 'lower') return target.toLowerCase();
      if (method === 'capitalize') return target.charAt(0).toUpperCase() + target.slice(1);
      if (method === 'find') {
        const query = cleanStringLiteral(argsStr);
        return target.indexOf(query);
      }
      if (method === 'replace') {
        const parts = splitTopLevelCommas(argsStr).map(s => cleanStringLiteral(s.trim()));
        if (parts.length >= 2) {
          return target.replaceAll(parts[0], parts[1]);
        }
      }
    }
  }

  // Math expression (substitute variables)
  let mathExpr = expr;
  for (const [key, val] of Object.entries(env)) {
    if (typeof val === 'number' || typeof val === 'string') {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      mathExpr = mathExpr.replace(regex, typeof val === 'number' ? `${val}` : JSON.stringify(val));
    }
  }

  // Replace Python integer division // with Math.floor((a)/(b))
  mathExpr = mathExpr.replace(/([0-9a-zA-Z_.]+)\s*\/\/\s*([0-9a-zA-Z_.]+)/g, 'Math.floor(($1) / ($2))');
  // Exponentiation **
  if (mathExpr.includes('**')) {
    mathExpr = mathExpr.replace(/([0-9a-zA-Z_.]+)\s*\*\*\s*([0-9a-zA-Z_.]+)/g, 'Math.pow($1, $2)');
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${mathExpr})`);
    return fn();
  } catch {
    return expr;
  }
}

function evaluatePrintArgs(inner: string, env: Record<string, any>): string {
  // Support f-strings e.g. f"Olá {nome}!"
  if (inner.startsWith('f"') || inner.startsWith("f'")) {
    let template = inner.slice(2, -1);
    template = template.replace(/\{([^}]+)\}/g, (_, expr) => {
      const trimmed = expr.trim();
      if (trimmed.includes(':')) {
        // e.g. {media:.1f}
        const [varPart, formatPart] = trimmed.split(':');
        const val = evaluateExpression(varPart, env);
        if (typeof val === 'number' && formatPart.includes('f')) {
          const decimals = parseInt(formatPart.replace(/[^\d]/g, ''), 10) || 1;
          return val.toFixed(decimals);
        }
        return `${val}`;
      }
      return `${evaluateExpression(trimmed, env)}`;
    });
    return template;
  }

  // Check if comma separated
  const parts = splitTopLevelCommas(inner);
  const evaluatedParts = parts.map((part) => {
    part = part.trim();
    if (part.startsWith('type(') && part.endsWith(')')) {
      const inside = part.slice(5, -1).trim();
      const val = env[inside];
      if (typeof val === 'number') {
        return Number.isInteger(val) ? "<class 'int'>" : "<class 'float'>";
      }
      if (typeof val === 'boolean') return "<class 'bool'>";
      return "<class 'str'>";
    }
    return `${evaluateExpression(part, env)}`;
  });

  return evaluatedParts.join(' ');
}

function splitTopLevelCommas(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let depth = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch === '"' || ch === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuotes = false;
      }
    }
    if (!inQuotes) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    }
    if (ch === ',' && !inQuotes && depth === 0) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) result.push(current);
  return result;
}

function evaluateCondition(cond: string, env: Record<string, any>): boolean {
  let jsCond = cond;
  for (const [key, val] of Object.entries(env)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    jsCond = jsCond.replace(regex, typeof val === 'number' ? `${val}` : `"${val}"`);
  }
  jsCond = jsCond.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!');
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${jsCond})`);
    return Boolean(fn());
  } catch {
    return false;
  }
}
