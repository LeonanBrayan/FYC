import React, { useState } from 'react';
import { executeMiniPython, ExecutionResult } from '../utils/pythonRunner';
import {
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  BookOpen,
  Info,
  Clock,
  Layers
} from 'lucide-react';

interface PythonPlaygroundProps {
  initialCode?: string;
}

const PRESET_EXAMPLES = [
  {
    name: 'Aula 1: print() Básico',
    code: `# Exemplo da Aula 1
print("Olá, Mundo!")
print("SmartCursos: Aprendendo Python pelo celular!")
print(10 + 25)`
  },
  {
    name: 'Aula 2: input() e Variáveis',
    code: `# Exemplo da Aula 2
nome = input("Digite seu nome: ")
cidade = input("Digite sua cidade: ")

print(f"Olá, {nome}! Que legal saber que você mora em {cidade}!")`
  },
  {
    name: 'Aula 3: Tipos Primitivos',
    code: `# Exemplo da Aula 3
ano_nasc = int(input("Ano em que nasceu: "))
ano_atual = 2026
idade = ano_atual - ano_nasc

print(f"Sua idade estimada é {idade} anos.")
print("Tipo da variável idade:", type(idade))`
  },
  {
    name: 'Aula 4: Operadores Matemáticos',
    code: `# Exemplo da Aula 4
a = 15
b = 4

print("Soma:", a + b)
print("Subtração:", a - b)
print("Multiplicação:", a * b)
print("Divisão real:", a / b)
print("Divisão inteira:", a // b)
print("Resto da divisão (módulo):", a % b)
print("Potência (15 elevado a 4):", a ** b)`
  },
  {
    name: 'Aula 5: Módulos (math e random)',
    code: `# Exemplo da Aula 5: Importação de Módulos
import math
import random

numero = random.randint(1, 100)
raiz = math.sqrt(numero)

print(f"Número sorteado: {numero}")
print(f"Raiz quadrada: {raiz:.2f}")
print(f"Arredondado para cima: {math.ceil(raiz)}")`
  },
  {
    name: 'Aula 6: Manipulação de Textos',
    code: `# Exemplo da Aula 6: Manipulação de Strings
frase = "Curso de Python pelo Celular"

print("Original:", frase)
print("Total de caracteres:", len(frase))
print("Primeiras 5 letras:", frase[:5])
print("Em MAIÚSCULAS:", frase.upper())
print("Substituído:", frase.replace("Celular", "Smartphone"))`
  },
  {
    name: 'Aula 7: Condicionais if/else',
    code: `# Exemplo da Aula 7: Estruturas Condicionais
velocidade = 85.0

print(f"Velocidade aferida: {velocidade} Km/h")

if velocidade > 80:
    multa = (velocidade - 80) * 7
    print(f"MULTADO! Excedeu o limite de 80 Km/h!")
    print(f"Valor da multa: R$ {multa:.2f}")
elif velocidade >= 75:
    print("Atenção! Próximo ao limite da via.")
else:
    print("Velocidade permitida. Boa viagem!")`
  },
  {
    name: 'Aula 8: Repetição for e range()',
    code: `# Exemplo da Aula 8: Laço for e range
numero = 7

print(f"--- TABUADA DO {numero} ---")
for i in range(1, 11):
    print(f"{numero} x {i:2} = {numero * i}")
print("--- FIM DA TABUADA ---")`
  }
];

export const PythonPlayground: React.FC<PythonPlaygroundProps> = ({ initialCode }) => {
  const [code, setCode] = useState(
    initialCode ||
      `# Bem-vindo ao Editor Python Web do SmartCursos!
# Digite seu código abaixo ou escolha um exemplo das aulas:

print("Olá, futuro programador!")
print("Praticando Python direto no navegador sem instalar nada.")
`
  );

  const [inputVal, setInputVal] = useState('Leonan');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update code if initialCode changes
  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const inputs = inputVal ? inputVal.split(',').map((s) => s.trim()) : [];
      const res = executeMiniPython(code, inputs);
      setResult(res);
      setIsRunning(false);
    }, 150);
  };

  const handleReset = () => {
    setCode(PRESET_EXAMPLES[0].code);
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Playground Interativo</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Ambiente de Prática
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Editor Python no Navegador
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Pratique os comandos das videoaulas instantaneamente antes de testar no seu celular (Pydroid 3).
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {PRESET_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCode(preset.code);
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
            >
              {preset.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Code Editor (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col">
          
          {/* Editor Topbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-300 ml-2">script.py</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Copiar código"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Resetar código"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea code editor */}
          <div className="relative p-2 bg-slate-950">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none p-3 resize-y leading-relaxed"
              placeholder="# Digite seu código Python aqui..."
            />
          </div>

          {/* Simulated input configuration */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-mono text-slate-700 dark:text-slate-300 shrink-0 font-medium">input() Simulado:</label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ex: Carlos, 2005"
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 cursor-pointer transition-all shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executando...' : 'Executar Código'}</span>
            </button>
          </div>

        </div>

        {/* Right: Output Console & Mobile PyDroid CheatSheet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Output Terminal */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">Terminal Output</span>
              </div>
              {result && (
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {result.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="p-4 font-mono text-xs min-h-[220px] max-h-[300px] overflow-y-auto space-y-1.5 bg-slate-950">
              {!result ? (
                <div className="text-slate-500 italic py-8 text-center">
                  Clique em "Executar Código" para ver o resultado do terminal aqui...
                </div>
              ) : result.error ? (
                <div className="text-red-400 whitespace-pre-wrap bg-red-950/30 p-3 rounded-xl border border-red-900/60">
                  {result.error}
                </div>
              ) : (
                result.output.map((out, idx) => (
                  <div key={idx} className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {out}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Cheatsheet for Mobile Students */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Dica para usar no Pydroid 3 (Celular)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Você pode copiar qualquer código daqui, abrir o app <strong>Pydroid 3</strong> no seu smartphone, colar e clicar no botão amarelo de Play.
              O comportamento será idêntico ao que você vê nesta tela!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
