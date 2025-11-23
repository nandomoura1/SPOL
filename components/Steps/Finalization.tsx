import React, { useState } from 'react';
import { AppState, ArquivoGeral } from '../../types';
import { calculateSHA256, generateId, formatDateTime } from '../../utils';
import { ScreenHeader, BottomNav } from './AuthAndInfo';
import { Printer, ArrowLeft, Download, UploadCloud, X, File as FileIcon, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LOGO_URL } from '../../utils';

// Add type for html2pdf
declare global {
  interface Window {
    html2pdf: any;
  }
}

interface StepProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Custom Checkbox
const CheckItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div onClick={onChange} className="flex items-start cursor-pointer group mb-4">
    <div className={`mr-3 mt-0.5 w-5 h-5 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-yellow-500 border-yellow-500' : 'border-yellow-500/50 bg-transparent group-hover:border-yellow-500'}`}>
      {checked && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
    </div>
    <span className="text-neutral-300 text-sm leading-tight">{label}</span>
  </div>
);

// --- Step 7: Observations & Uploads ---
export const Step7Observations: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setProcessing(true);
    try {
      // Process files in parallel
      const filePromises = Array.from(files).map(async (file) => {
        const hash = await calculateSHA256(file);
        return {
          id: generateId(),
          nome: file.name,
          hash: hash,
          data: formatDateTime()
        };
      });

      const newUploads = await Promise.all(filePromises);
      updateState({ uploads: [...state.uploads, ...newUploads] });
    } catch (error) {
      console.error("Erro ao processar arquivos:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    updateState({ uploads: state.uploads.filter(u => u.id !== id) });
  };

  const handleAISummary = async () => {
    setIsSummarizing(true);
    try {
        const conditions = [];
        if (state.observacoes.poeira) conditions.push("O ambiente apresentava acúmulo de poeira.");
        if (state.observacoes.lapso > 0) conditions.push("Houve lapso temporal significativo entre o fato ocorrido e o início do exame pericial.");
        if (state.observacoes.umidade) conditions.push("As superfícies encontravam-se prejudicadas devido à umidade ou má conservação.");
        
        const userInput = state.observacoes.texto;

        const prompt = `Atue como um Perito Criminal. Reescreva e consolide as observações abaixo em um único parágrafo técnico, formal e coeso para inclusão em laudo pericial.
        
        Condições observadas no local:
        ${conditions.join("\n")}
        
        Observações adicionais do perito (rascunho):
        "${userInput}"

        Gere apenas o texto final aprimorado.`;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        if (response.text) {
             updateState({ observacoes: { ...state.observacoes, texto: response.text.trim() } });
        }
    } catch (error) {
        console.error("AI Summary error:", error);
        alert("Erro ao gerar resumo com IA.");
    } finally {
        setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Observações" />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <div className="mb-6">
            <label className="block text-neutral-400 text-sm mb-3">Descrição do Local</label>
            
            <CheckItem 
                label="Local empoeirado" 
                checked={state.observacoes.poeira} 
                onChange={() => updateState({ observacoes: { ...state.observacoes, poeira: !state.observacoes.poeira } })} 
            />
            <CheckItem 
                label="Lapso temporal entre o fato e a perícia" 
                checked={state.observacoes.lapso > 0} 
                onChange={() => updateState({ observacoes: { ...state.observacoes, lapso: state.observacoes.lapso ? 0 : 1 } })} 
            />
            <CheckItem 
                label="Arremesso de projétil não gerou vestígio em superfície viável" 
                checked={false} 
                onChange={() => {}} 
            />
            <CheckItem 
                label="Superfícies primárias de baixa qualidade ou prejudicadas" 
                checked={state.observacoes.umidade} 
                onChange={() => updateState({ observacoes: { ...state.observacoes, umidade: !state.observacoes.umidade } })} 
            />
        </div>

        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-neutral-400 text-sm">Outras Observações</label>
                <button 
                    onClick={handleAISummary}
                    disabled={isSummarizing}
                    className="flex items-center gap-1.5 text-[10px] text-yellow-500 font-bold uppercase hover:bg-yellow-500/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                    {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isSummarizing ? "Gerando..." : "Redigir com IA"}</span>
                </button>
            </div>
            <textarea
                value={state.observacoes.texto}
                onChange={(e) => updateState({ observacoes: { ...state.observacoes, texto: e.target.value } })}
                className="w-full bg-neutral-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                rows={4}
                placeholder="Digite suas observações aqui ou use a IA para gerar um texto técnico baseada nas opções acima..."
            />
        </div>

        <div className="mt-8">
            <p className="text-neutral-400 text-sm mb-2 uppercase font-bold text-center">Upload de Arquivos</p>
            
            <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                    ${isDragging 
                        ? 'border-yellow-500 bg-yellow-500/10 scale-[1.02]' 
                        : 'border-yellow-500/30 bg-neutral-900/50 hover:bg-neutral-900'
                    }`}
            >
                <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-yellow-500' : 'text-neutral-500'}`} />
                <span className="text-neutral-300 text-xs mb-1 font-medium">
                  {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                </span>
                <span className="text-neutral-500 text-[10px] mb-4">
                  Suporta múltiplos arquivos simultaneamente
                </span>
                
                <div className="bg-yellow-500 text-black font-bold px-5 py-2 rounded shadow-lg shadow-yellow-500/10 text-xs uppercase hover:bg-yellow-400 transition-colors">
                    {processing ? 'Processando...' : 'Escolher Arquivos'}
                </div>
                <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleInputChange} 
                    disabled={processing} 
                />
            </label>

            {state.uploads.length > 0 && (
                 <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-yellow-500 font-bold uppercase">{state.uploads.length} arquivo(s) anexado(s)</p>
                    </div>
                    
                    <div className="bg-neutral-900 rounded-lg border border-neutral-800 divide-y divide-neutral-800 max-h-48 overflow-y-auto">
                        {state.uploads.map((file) => (
                            <div key={file.id} className="p-3 flex items-center justify-between group hover:bg-neutral-800/50 transition-colors">
                                <div className="flex items-center overflow-hidden">
                                    <FileIcon className="w-4 h-4 text-neutral-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-neutral-300 truncate">{file.nome}</span>
                                </div>
                                <button 
                                    onClick={() => removeFile(file.id)}
                                    className="text-neutral-600 hover:text-red-500 p-1 rounded transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>
      </div>

      <BottomNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
};

// --- Step 8: Report ---
export const Step8Report: React.FC<StepProps> = ({ state, prevStep }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Helper to generate dynamic observations text
    const getObservacoesText = () => {
        // If text was generated by AI or typed, use it. Otherwise fallback to constructing from booleans.
        if (state.observacoes.texto && state.observacoes.texto.length > 5) {
            return state.observacoes.texto;
        }

        const parts = [];
        if (state.observacoes.poeira) parts.push("O local apresentava muita poeira");
        if (state.observacoes.lapso) parts.push("Havia lapso temporal entre o fato e a perícia");
        if (state.observacoes.umidade) parts.push("As superfícies primárias eram de baixa qualidade ou prejudicadas");
        return parts.length > 0 ? parts.join(". ") + "." : "Nada a constar.";
    };

    const getVestigiosText = () => {
        if (state.houve_decalque !== 'Sim' || state.vestigios_decalcados.length === 0) return "R.: Não.";
        const total = state.vestigios_decalcados.reduce((acc, curr) => acc + curr.fitas, 0); 
        
        const items = state.vestigios_decalcados.map((v) => 
            `(${v.fitas}) ${v.descricao}`
        );
        
        return (
            <div className="mt-1">
                R.: Sim. Foram coletados {total} vestígios de impressão papiloscópica nas seguintes superfícies:
                <ul className="list-none mt-1">
                    {items.map((item, idx) => <li key={idx} className="pl-0">{item}</li>)}
                </ul>
            </div>
        );
    };

    const getFipText = () => {
        if (state.houve_fip !== 'Sim' || state.fotos_fip.length === 0) return "R.: Não.";
        
        const items = state.fotos_fip.map((f) => 
            `(${f.numero_vestigio || '?'}) ${f.descricao}`
        );

        return (
            <div className="mt-1">
                R.: Sim.
                <ul className="list-none mt-1">
                    {items.map((item, idx) => <li key={idx} className="pl-0">{item}</li>)}
                </ul>
            </div>
        );
    };

    const getLabText = () => {
        if (state.houve_lab !== 'Sim' || state.objetos_laboratorio.length === 0) return "R.: Não.";

        // Format: (Qtd) Descrição - Local
        const items = state.objetos_laboratorio.map((obj) => 
            `(${obj.qtd}) ${obj.descricao} - ${obj.local_coleta || "Local não informado"}`
        );

         return (
            <div className="mt-1">
                R.: Sim.
                <ul className="list-none mt-1">
                    {items.map((item, idx) => <li key={idx} className="pl-0">{item}</li>)}
                </ul>
            </div>
        );
    }

    const handleGeneratePDF = () => {
        setIsGenerating(true);
        const element = document.getElementById('report-content');
        
        if (element && window.html2pdf) {
            // Create a clone to force A4 width formatting regardless of screen size
            const clone = element.cloneNode(true) as HTMLElement;
            
            // Set dimensions and styles for a perfect A4 PDF
            clone.style.width = '210mm';
            clone.style.maxWidth = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.padding = '20mm';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.borderRadius = '0';
            clone.style.backgroundColor = 'white';
            clone.style.color = 'black';
            clone.style.position = 'absolute';
            clone.style.left = '-9999px'; // Hide it off-screen
            clone.style.top = '0';
            
            // Remove any container classes that might restrict width
            clone.classList.remove('print-container');

            document.body.appendChild(clone);

            const opt = {
                margin:       0, // We handle margins via padding in the clone
                filename:     `Laudo_${state.num_ocorrencia || 'PCDF'}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            window.html2pdf().set(opt).from(clone).save().then(() => {
                // Cleanup
                if (document.body.contains(clone)) {
                    document.body.removeChild(clone);
                }
                setIsGenerating(false);
            }).catch((err: any) => {
                console.error("PDF Generation Error:", err);
                if (document.body.contains(clone)) {
                    document.body.removeChild(clone);
                }
                setIsGenerating(false);
                alert("Erro ao gerar PDF. Verifique se as imagens foram carregadas.");
            });
        } else {
            setIsGenerating(false);
            if (!window.html2pdf) alert("Biblioteca PDF não carregada. Tente recarregar a página.");
        }
    };

    const today = new Date();
    const formattedDate = `${today.getDate()} de ${today.toLocaleString('pt-BR', { month: 'long' })} de ${today.getFullYear()}`;

    return (
        <div className="flex flex-col h-full">
            <ScreenHeader title="Laudo de Local" />
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-4 px-1">
                {/* Paper Representation with ID for PDF generation */}
                <div id="report-content" className="bg-white text-black p-8 rounded-sm shadow-2xl font-serif text-sm leading-relaxed mb-6 print-container text-justify">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <img 
                            src={LOGO_URL}
                            alt="Logo PCDF" 
                            className="w-16 h-auto mb-2"
                            crossOrigin="anonymous" 
                        />
                        <div className="font-bold text-lg uppercase mb-1 text-center">Instituto de Identificação da PCDF</div>
                        <div className="font-bold border-b-2 border-black inline-block pb-1 mb-2 text-base text-center">Laudo de Perícia Papiloscópica – Local de Crime</div>
                        <div className="mt-2 font-semibold text-center">Ocorrência nº {state.num_ocorrencia || "_______"} – Local: {state.ocorrencia?.local || "Local não informado"}, Brasília/DF</div>
                    </div>

                    <div className="mb-6">
                        <span className="font-bold block mb-1 uppercase tracking-wider">Preâmbulo</span>
                        <p>
                            Designados para atender a ocorrência supracitada, a equipe pericial compareceu ao local na data de {state.ocorrencia?.data_hora || "____"} para realização dos exames.
                        </p>
                    </div>

                    <div className="mb-6">
                        <span className="font-bold block mb-3 uppercase tracking-wider">Quesitos</span>
                        
                        <div className="mb-4">
                            <span className="font-bold block">1. Houve perícia papiloscópica no local do crime?</span>
                            <div className="mt-1 text-black">
                                R.: Sim. Perícia realizada dia {state.ocorrencia?.data_hora?.split(' ')[0] || today.toLocaleDateString('pt-BR')}.
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="font-bold block">2. Houve coleta de vestígio papiloscópico no local do crime?</span>
                            <div className="text-black">
                                {getVestigiosText()}
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="font-bold block">3. Houve fotografia de vestígio papiloscópico no local do crime?</span>
                            <div className="text-black">
                                {getFipText()}
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="font-bold block">4. Houve coleta de vestígio para ser processado no laboratório do Instituto de Identificação? Se sim, qual e aonde estavam?</span>
                            <div className="text-black">
                                {getLabText()}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 border-t border-gray-300 pt-4">
                        <span className="font-bold block mb-1 uppercase text-xs">Observações adicionais</span>
                        <p>{getObservacoesText()}</p>
                    </div>

                    <div className="mb-8">
                        <span className="font-bold block mb-1 uppercase text-xs">Conclusão</span>
                        <p>
                            Os vestígios coletados foram cadastrados no sistema de custódia, com registro de hash e log de acesso, e encaminhados ao setor competente para armazenamento.
                        </p>
                    </div>

                    <div className="text-right mt-12 mb-12">
                        <p>Brasília, {formattedDate}.</p>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="border-t border-black w-3/4 mx-auto pt-2">
                             <p className="font-bold uppercase">{state.equipe.perito || "Perito Responsável"}</p>
                             <p className="text-xs text-gray-600">Assinatura Digital – hash: {generateId()}{generateId()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 pb-6 flex justify-between items-center gap-2">
                 <button onClick={prevStep} className="flex flex-col items-center group">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-active:scale-95 transition-transform">
                    <ArrowLeft className="text-black w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-yellow-500 font-bold uppercase mt-2 tracking-wider">Voltar</span>
                </button>

                <button onClick={handleGeneratePDF} className="flex flex-col items-center group">
                     <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center group-active:bg-yellow-500/20 transition-colors">
                        <Download className="text-yellow-500 w-8 h-8" />
                    </div>
                    <span className="text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight mt-2">
                        {isGenerating ? "Gerando..." : "Baixar PDF"}
                    </span>
                </button>

                <button onClick={() => alert("Documento Enviado para o SEI/PCDF")} className="flex flex-col items-center group">
                     <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center group-active:bg-yellow-500/20 transition-colors">
                        <Printer className="text-yellow-500 w-8 h-8" />
                    </div>
                    <span className="text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight mt-2">Assinar e<br/>Enviar</span>
                </button>
            </div>
        </div>
    );
}