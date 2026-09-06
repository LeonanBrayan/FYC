import { Course, Testimonial } from '../types';

export const COURSES_DATA: Course[] = [
  {
    id: 'python-basico-mobile',
    slug: 'python-basico',
    title: 'Curso de Python',
    cardTitle: 'CURSO DE PYTHON',
    logoType: 'python',
    tagline: 'Aprenda programação do absoluto zero praticando direto pelo smartphone',
    description: 'Curso didático e 100% gratuito criado especialmente para quem não tem computador ou notebook e quer dominar os fundamentos de Python 3 utilizando o app Pydroid 3 ou qualquer smartphone.',
    category: 'python',
    level: 'Iniciante',
    isAvailable: true,
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
    accentColor: '#38bdf8',
    totalDuration: '2h 20m',
    targetAudience: 'Iniciantes em programação, estudantes sem PC ou que preferem praticar em qualquer lugar pelo celular.',
    requirements: ['Smartphone Android ou iOS com app Pydroid 3 instalado (ou navegador)', 'Vontade de aprender'],
    toolsRecommended: [
      { name: 'Pydroid 3', platform: 'Android (Google Play)', link: 'https://play.google.com/store/apps/details?id=ru.iiec.pydroid3' },
      { name: 'Pythonista / Carnets', platform: 'iOS (App Store)' },
      { name: 'SmartCursos Web Playground', platform: 'Navegador (Nativo)' }
    ],
    lessons: [
      {
        id: 'py-aula-1',
        number: 1,
        title: 'Aula 1: Primeiros Comandos e a Função print()',
        description: 'Conheça o ambiente de desenvolvimento mobile (Pydroid 3), entenda a estrutura básica de um script Python e aprenda a exibir mensagens formatadas na tela com a função print().',
        durationMinutes: 12,
        youtubeId: 'B_6muiTSBvc',
        thumbnailUrl: 'https://img.youtube.com/vi/B_6muiTSBvc/hqdefault.jpg',
        summary: [
          'Instalação e visão geral do aplicativo Pydroid 3 no celular.',
          'Estrutura do primeiro comando: print("Olá, Mundo!").',
          'Diferença entre texto (strings com aspas) e números.',
          'Execução do script e visualização no terminal integrado.'
        ],
        keyConcepts: ['Função print()', 'Strings e Aspas', 'Terminal e Console', 'Execução no Pydroid 3'],
        codeSnippet: `# Seu primeiro código em Python pelo celular!
print("Olá, Mundo!")
print("Estou aprendendo Python pelo SmartCursos no meu smartphone!")
print(2026)`,
        quiz: {
          question: 'Qual comando em Python é utilizado para exibir uma mensagem ou valor na tela do terminal?',
          options: [
            'echo "Olá Mundo"',
            'print("Olá Mundo")',
            'display("Olá Mundo")',
            'console.log("Olá Mundo")'
          ],
          correctIndex: 1,
          explanation: 'Em Python 3, a função nativa `print()` recebe argumentos entre parênteses e os exibe no console de saída.'
        }
      },
      {
        id: 'py-aula-2',
        number: 2,
        title: 'Aula 2: Função input() e Variáveis',
        description: 'Aprenda a interagir com o usuário solicitando dados através do teclado do celular com input() e armazene essas informações na memória usando variáveis.',
        durationMinutes: 15,
        youtubeId: 'y39uAo9-iWg',
        thumbnailUrl: 'https://img.youtube.com/vi/y39uAo9-iWg/hqdefault.jpg',
        summary: [
          'Conceito de variáveis como caixas na memória do dispositivo.',
          'Como capturar dados digitados pelo usuário com a função input().',
          'Concatenação e exibição de variáveis em conjunto com strings no print().',
          'Boas práticas de nomenclatura de variáveis (sem espaços, snake_case).'
        ],
        keyConcepts: ['Função input()', 'Variáveis', 'Atribuição (=)', 'Interatividade'],
        codeSnippet: `# Interagindo com o usuário
nome = input("Qual é o seu nome? ")
curso = input("Qual tecnologia você quer aprender? ")

print(f"Muito prazer, {nome}! Bem-vindo ao curso de {curso}!")`,
        quiz: {
          question: 'Quando usamos `idade = input("Digite sua idade: ")`, que tipo de dado a função input() retorna por padrão?',
          options: [
            'Sempre um número inteiro (int)',
            'Sempre um texto/string (str)',
            'Um número decimal (float)',
            'Um valor booleano (bool)'
          ],
          correctIndex: 1,
          explanation: 'A função `input()` em Python sempre retorna o que o usuário digitou no formato de texto (string). Se precisar de cálculos numéricos, é necessário fazer a conversão de tipo (type casting).'
        }
      },
      {
        id: 'py-aula-3',
        number: 3,
        title: 'Aula 3: Tipos Primitivos (int, float, str, bool)',
        description: 'Descubra os tipos de dados fundamentais da linguagem Python, como converter textos em números e como checar o tipo de qualquer variável usando type().',
        durationMinutes: 16,
        youtubeId: '3OGKq7SM61I',
        thumbnailUrl: 'https://img.youtube.com/vi/3OGKq7SM61I/hqdefault.jpg',
        summary: [
          'Os quatro tipos primitivos essenciais: str (texto), int (inteiro), float (real/decimal), bool (booleano).',
          'Conversão de tipos (type casting): int(input()), float(input()).',
          'A função type() para diagnosticar o tipo de uma variável.',
          'Resolução do desafio prático proposto em aula.'
        ],
        keyConcepts: ['str', 'int', 'float', 'bool', 'Conversão com int() e float()', 'type()'],
        codeSnippet: `# Trabalhando com tipos primitivos
ano_nascimento = int(input("Ano que você nasceu: "))
ano_atual = 2026
idade = ano_atual - ano_nascimento

print(f"Você tem ou fará {idade} anos!")
print("Tipo da variável idade:", type(idade))`,
        quiz: {
          question: 'Se você deseja ler um número com casas decimais (ex: altura ou preço), qual função de conversão deve utilizar?',
          options: [
            'int(input())',
            'float(input())',
            'str(input())',
            'decimal(input())'
          ],
          correctIndex: 1,
          explanation: 'A função `float()` converte o texto fornecido pelo usuário em um número de ponto flutuante (com casas decimais).'
        }
      },
      {
        id: 'py-aula-4',
        number: 4,
        title: 'Aula 4: Operadores Aritméticos e Precedência',
        description: 'Domine todos os operadores matemáticos em Python (+, -, *, /, //, %, **) e entenda a regra de precedência para nunca errar a ordem dos cálculos.',
        durationMinutes: 18,
        youtubeId: 'CbXCARprhRk',
        thumbnailUrl: 'https://img.youtube.com/vi/CbXCARprhRk/hqdefault.jpg',
        summary: [
          'Operadores básicos: soma (+), subtração (-), multiplicação (*), divisão (/).',
          'Operadores avançados: divisão inteira (//), resto da divisão / módulo (%), exponenciação (**).',
          'Ordem de precedência: Parênteses () -> Potência ** -> Mult/Div * / // % -> Soma/Sub + -.',
          'Exercícios de fixação para praticar no Pydroid 3.'
        ],
        keyConcepts: ['Operadores Matemáticos', 'Divisão Inteira (//)', 'Módulo (%)', 'Potência (**)', 'Ordem de Precedência'],
        codeSnippet: `# Operações matemáticas em Python
n1 = 10
n2 = 3

print("Soma:", n1 + n2)
print("Divisão real:", n1 / n2)
print("Divisão inteira:", n1 // n2)
print("Resto da divisão (módulo):", n1 % n2)
print("Potência (10 elevado a 3):", n1 ** n2)`,
        quiz: {
          question: 'Qual é o resultado da expressão Python: 2 + 3 * 4?',
          options: [
            '20 (pois calcula da esquerda para a direita)',
            '14 (pois a multiplicação tem precedência sobre a soma)',
            '24 (pois 2+3=5 e 5*4=20 somado com 4)',
            'Erro de sintaxe'
          ],
          correctIndex: 1,
          explanation: 'A multiplicação (*) possui maior precedência que a adição (+), logo 3 * 4 = 12, e 12 + 2 = 14.'
        }
      },
      {
        id: 'py-aula-5',
        number: 5,
        title: 'Aula 5: Importação de Módulos (import math, random)',
        description: 'Aprenda a expandir o poder do Python no celular importando bibliotecas nativas como math (para cálculos avançados como raiz quadrada e arredondamento) e random (para sorteios e números aleatórios).',
        durationMinutes: 16,
        youtubeId: 'mg6ffhMHZ3M',
        thumbnailUrl: 'https://img.youtube.com/vi/mg6ffhMHZ3M/hqdefault.jpg',
        summary: [
          'Como funciona o comando import e from ... import ...',
          'Utilização do módulo math (math.sqrt, math.ceil, math.floor, math.trunc).',
          'Utilização do módulo random para sortear valores aleatórios (randint, choice).',
          'Diferença entre importar a biblioteca inteira ou funções específicas.'
        ],
        keyConcepts: ['import', 'from ... import', 'Módulo math', 'Módulo random', 'Modularização'],
        codeSnippet: `# Utilizando módulos em Python
import math
import random

# Sorteando um número de 1 a 100
numero_sorteado = random.randint(1, 100)
raiz = math.sqrt(numero_sorteado)

print(f"Número sorteado: {numero_sorteado}")
print(f"Raiz quadrada: {raiz:.2f}")
print(f"Raiz arredondada para cima: {math.ceil(raiz)}")`,
        quiz: {
          question: 'Qual comando importa apenas a função sqrt da biblioteca math, sem carregar o módulo inteiro na memória?',
          options: [
            'import math.sqrt',
            'from math import sqrt',
            'load sqrt from math',
            'using math::sqrt'
          ],
          correctIndex: 1,
          explanation: 'A sintaxe `from math import sqrt` permite importar e utilizar diretamente a função `sqrt()` sem precisar do prefixo `math.`.'
        }
      },
      {
        id: 'py-aula-6',
        number: 6,
        title: 'Aula 6: Manipulação de Textos (Strings & Fatiamento)',
        description: 'Descubra como fatiar e transformar textos em Python pelo celular: contagem de caracteres com len(), fatiamento [inicio:fim:passo], busca com find(), substituição com replace() e métodos de maiúsculas/minúsculas.',
        durationMinutes: 18,
        youtubeId: 'cCyz196NL8o',
        thumbnailUrl: 'https://img.youtube.com/vi/cCyz196NL8o/hqdefault.jpg',
        summary: [
          'Fatiamento de strings no padrão texto[início:fim:passo].',
          'Análise de strings com len(), count() e find().',
          'Transformação de texto com replace(), upper(), lower(), capitalize() e title().',
          'Divisão e junção de strings com split() e join().'
        ],
        keyConcepts: ['Fatiamento [::]', 'len()', 'replace()', 'upper() e lower()', 'split()'],
        codeSnippet: `# Manipulando textos (strings) no celular
frase = "Curso de Python no Celular"

print("Frase original:", frase)
print("Tamanho (caracteres):", len(frase))
print("Primeiras 5 letras:", frase[:5])
print("Em MAIÚSCULAS:", frase.upper())
print("Substituindo texto:", frase.replace("Celular", "Smartphone"))
print("A palavra 'Python' está na posição:", frase.find("Python"))`,
        quiz: {
          question: 'O que a expressão `frase[0:5]` faz em Python com a variável `frase = "Python"`?',
          options: [
            'Retorna os caracteres do índice 0 ao 4 ("Pytho")',
            'Retorna a palavra inteira invertida',
            'Gera um erro de sintaxe',
            'Apaga os primeiros 5 caracteres'
          ],
          correctIndex: 0,
          explanation: 'No fatiamento `[início:fim]`, o índice final é exclusivo (não incluído), então `0:5` pega os índices 0, 1, 2, 3 e 4.'
        }
      },
      {
        id: 'py-aula-7',
        number: 7,
        title: 'Aula 7: Estruturas Condicionais (if, elif, else)',
        description: 'Dê inteligência aos seus programas no smartphone permitindo que o código tome decisões com base em condições lógicas, operadores de comparação e indentação correta.',
        durationMinutes: 20,
        youtubeId: 'XTU42x7Nbgg',
        thumbnailUrl: 'https://img.youtube.com/vi/XTU42x7Nbgg/hqdefault.jpg',
        summary: [
          'Conceito de desvio condicional: se algo for verdadeiro faça A, senão faça B.',
          'Operadores de comparação: ==, !=, >, <, >=, <= e operadores lógicos (and, or, not).',
          'Indentação obrigatória em Python (4 espaços).',
          'Condições aninhadas com if, elif e else.'
        ],
        keyConcepts: ['if', 'elif', 'else', 'Operadores de Comparação', 'Indentação em blocos'],
        codeSnippet: `# Tomada de decisão com if, elif e else
velocidade = float(input("Qual é a velocidade do carro (Km/h)? "))

if velocidade > 80:
    multa = (velocidade - 80) * 7
    print(f"MULTADO! Você excedeu o limite de 80 Km/h!")
    print(f"Valor da multa: R$ {multa:.2f}")
elif velocidade >= 75:
    print("Atenção! Você está no limite da via, reduza com cuidado.")
else:
    print("Tenha um bom dia! Dirija sempre com segurança.")`,
        quiz: {
          question: 'Qual operador de comparação verifica se dois valores são estritamente iguais em Python?',
          options: [
            '=',
            '==',
            '===',
            'equals'
          ],
          correctIndex: 1,
          explanation: 'O operador `==` é utilizado para comparação de igualdade, enquanto o sinal simples `=` é reservado para atribuição de variáveis.'
        }
      },
      {
        id: 'py-aula-8',
        number: 8,
        title: 'Aula 8: Estrutura de Repetição for (Laços & range)',
        description: 'Aprenda a automatizar tarefas repetitivas com o laço for em Python. Utilize a função range() para criar contagens regressivas, somatórios, tabuadas e iterações completas no smartphone.',
        durationMinutes: 22,
        youtubeId: 'pha7TeS5Az0',
        thumbnailUrl: 'https://img.youtube.com/vi/pha7TeS5Az0/hqdefault.jpg',
        summary: [
          'Conceito de laços de repetição (loops) e iterações controladas.',
          'Uso da função range(início, fim, passo).',
          'Construção de uma Tabuada completa com poucas linhas de código.',
          'Contagens progressivas e regressivas automáticas.'
        ],
        keyConcepts: ['for ... in', 'range()', 'Iteração', 'Acumuladores e Contadores'],
        codeSnippet: `# Tabuada automática com laço for no celular!
numero = int(input("Deseja ver a tabuada de qual número? "))

print(f"--- TABUADA DO {numero} ---")
for i in range(1, 11):
    resultado = numero * i
    print(f"{numero} x {i:2} = {resultado}")

print("--- FIM DA TABUADA ---")`,
        quiz: {
          question: 'Qual será a sequência de números gerada por `range(1, 6)` em um laço `for`?',
          options: [
            '1, 2, 3, 4, 5, 6',
            '1, 2, 3, 4, 5',
            '0, 1, 2, 3, 4, 5',
            '1, 6'
          ],
          correctIndex: 1,
          explanation: 'Em Python, o segundo argumento do `range()` é o limite superior exclusivo, logo `range(1, 6)` gera os números 1, 2, 3, 4 e 5.'
        }
      }
    ]
  },
  {
    id: 'html5-essencial',
    slug: 'html5-essencial',
    title: 'Curso de HTML5',
    cardTitle: 'CURSO DE HTML5',
    logoType: 'html5',
    tagline: 'A base sólida de qualquer página ou aplicativo na Web moderna',
    description: 'Aprenda a estruturar páginas da web de forma acessível, semântica e profissional, usando as tags modernas do HTML5.',
    category: 'web',
    level: 'Iniciante',
    isAvailable: false,
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    accentColor: '#f97316',
    totalDuration: '1h 15m',
    targetAudience: 'Iniciantes que querem criar sites, landing pages e portfólios para a Web.',
    requirements: ['Qualquer navegador moderno', 'Editor de texto simples (ou VS Code / Acode no celular)'],
    toolsRecommended: [
      { name: 'Acode', platform: 'Android (Editor de Código Mobile)' },
      { name: 'VS Code Web', platform: 'Navegador (vscode.dev)' }
    ],
    lessons: []
  },
  {
    id: 'css3-responsivo',
    slug: 'css3-responsivo',
    title: 'Curso de CSS3',
    cardTitle: 'CURSO DE CSS3',
    logoType: 'css3',
    tagline: 'Estilize páginas incríveis que se adaptam a qualquer tamanho de tela',
    description: 'Transforme estruturas HTML em layouts elegantes com Flexbox, CSS Grid, variáveis CSS e conceitos de design responsivo.',
    category: 'web',
    level: 'Iniciante',
    isAvailable: false,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    accentColor: '#3b82f6',
    totalDuration: '1h 45m',
    targetAudience: 'Quem já sabe HTML e quer aprender a estilizar profissionalmente.',
    requirements: ['Conhecimento básico de HTML5'],
    toolsRecommended: [
      { name: 'CSS Flexbox Guide', platform: 'Documentação' },
      { name: 'Tailwind CSS', platform: 'Framework Utilitário' }
    ],
    lessons: []
  },
  {
    id: 'php-basico',
    slug: 'php-basico',
    title: 'Curso de PHP',
    cardTitle: 'CURSO DE PHP',
    logoType: 'php',
    tagline: 'Construa sites dinâmicos e sistemas web com a linguagem que move a internet',
    description: 'Aprenda os fundamentos de PHP moderno: tags <?php ?>, variáveis com $, estruturas de controle, processamento de formulários e lógica backend.',
    category: 'web',
    level: 'Iniciante',
    isAvailable: false,
    coverImage: 'https://images.unsplash.com/photo-1599507593499-a3f7f7d97667?w=800&auto=format&fit=crop&q=80',
    accentColor: '#8892be',
    totalDuration: '1h 35m',
    targetAudience: 'Estudantes que querem aprender desenvolvimento web backend e criação de sites dinâmicos.',
    requirements: ['Básico de HTML e noções de lógica'],
    toolsRecommended: [
      { name: 'XAMPP / Laragon', platform: 'Servidor Local' },
      { name: 'Acode / Termux', platform: 'Android' }
    ],
    lessons: []
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    name: 'Miranda da Silva Pimenta',
    role: 'Aluna SmartCursos',
    avatarText: 'MP',
    content: '"Seus vídeos ajudam muito! A didática clara me fez entender o que parecia impossível no início."',
    highlight: true
  },
  {
    id: 't2',
    name: 'Alex Soares',
    role: 'Estudante de Ciência da Computação',
    avatarText: 'AS',
    content: '"Muito obrigado! Iniciei Ciências da Computação, e ontem foi passado Python. Mas como não tenho um PC ainda, vou fazer pelo celular com seus tutoriais!"',
    highlight: true
  },
  {
    id: 't3',
    name: 'Diego',
    role: 'Iniciante em Programação',
    avatarText: 'D',
    content: '"Muito obrigado! Não tenho um PC em casa, e o fato de você ensinar focado no smartphone ajudou muito a não desistir."',
    highlight: true
  },
  {
    id: 't4',
    name: 'Janiele Cristina',
    role: 'Desenvolvedora em Formação',
    avatarText: 'JC',
    content: '"Você é incrível! Iniciativas como essa democratizam o acesso à programação de verdade."',
    highlight: false
  }
];
