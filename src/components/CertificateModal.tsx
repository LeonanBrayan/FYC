import React, { useRef, useEffect, useState } from 'react';
import { drawCertificateToCanvas } from '../utils/generateCertificate';
import {
  Award,
  Download,
  Share2,
  X,
  Sparkles,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  courseTitle: string;
  completedCount: number;
  totalCount: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onUpdateStudentName,
  courseTitle,
  completedCount,
  totalCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nameInput, setNameInput] = useState(studentName || 'Leonan Brayan (Exemplo)');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawCertificateToCanvas(canvasRef.current, nameInput, courseTitle);
    }
  }, [isOpen, nameInput, courseTitle]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Certificado_SmartCursos_${nameInput.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleApplyName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudentName(nameInput);
    if (canvasRef.current) {
      drawCertificateToCanvas(canvasRef.current, nameInput, courseTitle);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Certificado Digital SmartCursos</h3>
              <p className="text-xs text-slate-400 font-mono">
                Progresso: {completedCount}/{totalCount} aulas • Emitido no seu navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Name Customizer */}
        <form onSubmit={handleApplyName} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome para exibição no Certificado:
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                onUpdateStudentName(e.target.value);
              }}
              placeholder="Digite seu nome completo..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="self-end sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer shadow-xs"
          >
            Atualizar Visualização
          </button>
        </form>

        {/* Certificate Canvas Preview */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 overflow-x-auto flex justify-center">
          <canvas
            ref={canvasRef}
            width={850}
            height={600}
            className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-800 bg-slate-900"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Certificado com assinatura do instrutor Leonan Brayan e código verificador</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Certificado (PNG)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

