export function drawCertificateToCanvas(
  canvas: HTMLCanvasElement,
  studentName: string,
  courseTitle: string = 'Python 3 para Iniciantes (Mobile)',
  issueDate: string = new Date().toLocaleDateString('pt-BR')
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner Golden Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Corner decorations
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.lineTo(0, 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  drawCorner(42, 42, 0);
  drawCorner(width - 42, 42, Math.PI / 2);
  drawCorner(width - 42, height - 42, Math.PI);
  drawCorner(42, height - 42, -Math.PI / 2);

  // Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SMARTCURSOS  •  EDUCAÇÃO ACESSÍVEL', width / 2, 90);

  // Certificate Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CERTIFICADO DE CONCLUSÃO', width / 2, 150);

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Certificamos com mérito e honra que', width / 2, 195);

  // Student Name
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  const nameToDisplay = studentName.trim() || 'Estudante Dedicado';
  ctx.fillText(nameToDisplay, width / 2, 255);

  // Divider under name
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 220, 275);
  ctx.lineTo(width / 2 + 220, 275);
  ctx.stroke();

  // Course body text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `concluiu com êxito todas as videoaulas, exercícios práticos e avaliações do curso:`,
    width / 2,
    320
  );

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`"${courseTitle}"`, width / 2, 365);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    'Capacitação em lógica de programação, comandos fundamentais e prática direta no smartphone.',
    width / 2,
    400
  );

  // Stamp Badge (Left)
  ctx.save();
  ctx.translate(180, 480);
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.fillStyle = '#0284c7';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('100% GRÁTIS', 0, -8);
  ctx.fillText('SMART', 0, 8);
  ctx.fillText('CURSOS', 0, 22);
  ctx.restore();

  // Signature (Right)
  const sigX = width - 240;
  const sigY = 480;

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sigX - 110, sigY);
  ctx.lineTo(sigX + 110, sigY);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'italic bold 20px cursive, sans-serif';
  ctx.fillText('Leonan Brayan', sigX, sigY - 12);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Instrutor & Criador SmartCursos', sigX, sigY + 22);

  // Footer Metadata & Hash
  const hashId = `SC-${Math.abs(hashCode(nameToDisplay + courseTitle)).toString(16).toUpperCase()}-2026`;
  ctx.fillStyle = '#64748b';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(`Emissão: ${issueDate}  |  Código de Autenticidade: ${hashId}`, width / 2, 550);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
