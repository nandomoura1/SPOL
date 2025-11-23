
import React, { useState } from 'react';
import { AppState, VestigioDecalcado, FotoFIP } from '../../types';
import { calculateSHA256, generateId } from '../../utils';
import { ScreenHeader, BottomNav } from './AuthAndInfo';
import { Printer, UploadCloud, FileText, X, ShieldCheck, Copy, Check, Wand2, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LOGO_URL } from '../../utils';

interface StepProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Helper Toggle Component
const ToggleSimNao = ({ value, onChange }: { value: 'Sim' | 'Não', onChange: (v: 'Sim' | 'Não') => void }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <button
      onClick={() => onChange('Sim')}
      className={`py-3 rounded-lg font-bold uppercase tracking-wide transition-all ${
        value === 'Sim'
          ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
          : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
      }`}
    >
      Sim
    </button>
    <button
      onClick={() => onChange('Não')}
      className={`py-3 rounded-lg font-bold uppercase tracking-wide transition-all ${
        value === 'Não'
          ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
          : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
      }`}
    >
      Não
    </button>
  </div>
);

// --- Step 4: Vestígio Decalcado ---
export const Step4Decal: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [formData, setFormData] = useState({ descricao: '', numeracao_fitas: '', qtd: 1 });

  const addVestigio = () => {
    if (formData.descricao && formData.numeracao_fitas) {
      const newItem: VestigioDecalcado = {
        id: generateId(),
        descricao: formData.descricao,
        numeracao_fitas: formData.numeracao_fitas,
        suportes: 1, // Default
        quantidade: formData.qtd
      };
      updateState({ vestigios_decalcados: [...state.vestigios_decalcados, newItem] });
      setFormData({ descricao: '', numeracao_fitas: '', qtd: 1 });
    }
  };

  const removeVestigio = (id: string) => {
    updateState({ vestigios_decalcados: state.vestigios_decalcados.filter(v => v.id !== id) });
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Decalque de Vestígio" />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <ToggleSimNao value={state.houve_decalque} onChange={(v) => updateState({ houve_decalque: v })} />

        {state.houve_decalque === 'Sim' && (
            <div className="space-y-5 animate-fade-in">
                <div>
                    <label className="block text-neutral-400 text-sm mb-2 ml-1">Descrição do Vestígio (incluir local)</label>
                    <input
                        type="text"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                        placeholder="Ex: Impressão digital na janela da cozinha..."
                    />
                </div>

                {/* Local Field Removed as requested */}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-neutral-400 text-sm mb-2 ml-1">Quantidade</label>
                        <input 
                            type="number" 
                            min="1"
                            value={formData.qtd}
                            onChange={(e) => setFormData({ ...formData, qtd: parseInt(e.target.value) })}
                            className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-neutral-400 text-sm mb-2 ml-1">Numeração da Fita</label>
                        <input 
                            type="text" 
                            value={formData.numeracao_fitas}
                            onChange={(e) => setFormData({ ...formData, numeracao_fitas: e.target.value })}
                            className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none text-center"
                            placeholder="Ex: 1-5 ou 10, 12"
                        />
                    </div>
                </div>

                <button
                    onClick={addVestigio}
                    disabled={!formData.descricao || !formData.numeracao_fitas}
                    className="w-full bg-yellow-500 text-black font-bold py-4 rounded-lg uppercase tracking-wide shadow-lg shadow-yellow-500/20 mt-2 disabled:opacity-50"
                >
                    ADICIONAR + VESTÍGIOS
                </button>

                <div className="space-y-4 mt-6 pt-6 border-t border-neutral-800">
                    {/* List of items preview */}
                    {state.vestigios_decalcados.length > 0 && (
                      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                         <p className="text-xs text-neutral-500 uppercase mb-2">Itens Adicionados:</p>
                         {state.vestigios_decalcados.map((item, i) => (
                           <div key={item.id} className="text-sm text-neutral-300 border-b border-neutral-800 last:border-0 py-2 flex justify-between items-center group">
                             <div className="flex flex-col">
                                <span className="font-bold text-yellow-500">Fita(s): {item.numeracao_fitas}</span>
                                <span>{item.quantidade}x {item.descricao}</span>
                             </div>
                             <button onClick={() => removeVestigio(item.id)} className="text-neutral-600 hover:text-red-500 p-1">
                                <X size={14} />
                             </button>
                           </div>
                         ))}
                      </div>
                    )}
                </div>
            </div>
        )}
      </div>

      <BottomNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
};

// --- Step 5: FIP ---
export const Step5FIP: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [numVestigio, setNumVestigio] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProcessing(true);
      
      const newPhotos: FotoFIP[] = [];
      const files = Array.from(e.target.files) as File[];

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const hash = await calculateSHA256(file);
          const base64 = await readFileAsDataURL(file);
          
          // If auto-numbering, increment based on existing list + index in current batch
          const currentCount = state.fotos_fip.length + i + 1;
          
          newPhotos.push({
            id: generateId(),
            descricao: descricao || file.name,
            hash,
            nome_arquivo: file.name,
            numero_vestigio: numVestigio ? `${numVestigio}.${i+1}` : currentCount.toString(), // simple logic for numbering
            local: local,
            imageData: base64,
            mimeType: file.type
          });
      }
      
      updateState({ fotos_fip: [...state.fotos_fip, ...newPhotos] });
      setDescricao(''); // Reset inputs used for batch
      setNumVestigio('');
      setLocal('');
      setProcessing(false);
    }
  };

  const updatePhotoDescription = (id: string, newDesc: string) => {
    const updatedPhotos = state.fotos_fip.map(photo => 
        photo.id === id ? { ...photo, descricao: newDesc } : photo
    );
    updateState({ fotos_fip: updatedPhotos });
  };

  const updatePhotoLocal = (id: string, newLocal: string) => {
    const updatedPhotos = state.fotos_fip.map(photo => 
        photo.id === id ? { ...photo, local: newLocal } : photo
    );
    updateState({ fotos_fip: updatedPhotos });
  };

  const removePhoto = (id: string) => {
    updateState({ fotos_fip: state.fotos_fip.filter(p => p.id !== id) });
  };

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditImage = async (photoId: string) => {
    if (!editPrompt.trim()) return;
    const photo = state.fotos_fip.find(p => p.id === photoId);
    if (!photo || !photo.imageData) return;

    setIsEditing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = photo.imageData.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: photo.mimeType || "image/png"
                        }
                    },
                    { text: editPrompt }
                ]
            }
        });

        // Find the image part in the response
        let newImageData: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    newImageData = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (newImageData) {
            const updatedPhotos = state.fotos_fip.map(p => 
                p.id === photoId ? { ...p, imageData: newImageData } : p
            );
            updateState({ fotos_fip: updatedPhotos });
            setEditPrompt('');
            setEditingId(null);
        } else {
            console.error("No image generated");
            alert("Não foi possível gerar a edição da imagem.");
        }

    } catch (error) {
        console.error("Editing error:", error);
        alert("Erro ao editar imagem.");
    } finally {
        setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Fotografia de Vestígio" />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <ToggleSimNao value={state.houve_fip} onChange={(v) => updateState({ houve_fip: v })} />

        {state.houve_fip === 'Sim' && (
            <div className="space-y-5 animate-fade-in">
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <p className="text-xs text-yellow-500 font-bold mb-3 uppercase tracking-wider">Configuração do Lote de Upload</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-neutral-400 text-[10px] mb-1 uppercase font-bold ml-1">Descrição Padrão</label>
                            <input
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full bg-neutral-800 text-white text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 border-none"
                                placeholder="Ex: Pegada no gesso (aplicado a todas as fotos)"
                            />
                        </div>

                        <div>
                            <label className="block text-neutral-400 text-[10px] mb-1 uppercase font-bold ml-1">Local Padrão</label>
                            <input
                                type="text"
                                value={local}
                                onChange={(e) => setLocal(e.target.value)}
                                className="w-full bg-neutral-800 text-white text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 border-none"
                                placeholder="Local exato..."
                            />
                        </div>

                        <div>
                            <label className="block text-neutral-400 text-[10px] mb-1 uppercase font-bold ml-1">Prefixo Numérico (Opcional)</label>
                            <input
                                type="text"
                                value={numVestigio}
                                onChange={(e) => setNumVestigio(e.target.value)}
                                className="w-full bg-neutral-800 text-white text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-yellow-500 border-none"
                                placeholder="Ex: 1 (gera 1.1, 1.2...)"
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-2">
                        <label className="block w-full border border-dashed border-yellow-500/30 bg-neutral-800/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors">
                            <UploadCloud className="w-6 h-6 text-yellow-500 mb-2" />
                            <span className="text-yellow-500 font-bold text-xs uppercase">
                            {processing ? 'Processando...' : 'Selecionar Fotos'}
                            </span>
                            <input type="file" multiple className="hidden" onChange={handleFiles} disabled={processing} accept="image/*" />
                        </label>
                    </div>
                </div>

                <div className="flex justify-between items-center px-1">
                    <label className="text-neutral-400 text-xs">Total de Fotos</label>
                    <span className="text-yellow-500 font-bold">{state.fotos_fip.length}</span>
                </div>

                 {state.fotos_fip.length > 0 && (
                     <div className="space-y-4">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider ml-1">Editar Detalhes das Fotos:</p>
                        {state.fotos_fip.map((foto, idx) => (
                            <div key={foto.id} className="flex flex-col bg-neutral-900 p-4 rounded-lg border border-neutral-800 space-y-3 shadow-sm relative group">
                                <button 
                                    onClick={() => removePhoto(foto.id)}
                                    className="absolute top-2 right-2 text-neutral-600 hover:text-red-500 transition-colors p-2"
                                    title="Remover foto"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-center border-b border-neutral-800 pb-2 mr-8">
                                    <span className="text-yellow-500 font-bold text-sm mr-2">#{foto.numero_vestigio}</span>
                                    <span className="text-neutral-500 text-xs truncate max-w-[200px]" title={foto.nome_arquivo}>{foto.nome_arquivo}</span>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Image Preview & Edit Trigger */}
                                    {foto.imageData && (
                                        <div className="relative w-full h-32 bg-black/50 rounded-md overflow-hidden flex items-center justify-center border border-neutral-800 group/image">
                                            <img src={foto.imageData} alt="Preview" className="h-full w-auto object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    onClick={() => {
                                                        if (editingId === foto.id) {
                                                            setEditingId(null);
                                                        } else {
                                                            setEditingId(foto.id);
                                                            setEditPrompt("");
                                                        }
                                                    }}
                                                    className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"
                                                >
                                                    <Wand2 size={12} /> Editar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Editing Panel */}
                                    {editingId === foto.id && (
                                        <div className="bg-neutral-800/50 p-2 rounded border border-yellow-500/30 animate-fade-in">
                                            <label className="text-[10px] text-yellow-500 font-bold uppercase mb-1 block">IA Edição (Gemini Nano Banana)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={editPrompt}
                                                    onChange={(e) => setEditPrompt(e.target.value)}
                                                    placeholder="Ex: Clarear imagem, remover fundo..."
                                                    className="flex-1 bg-black text-white text-xs rounded border border-neutral-700 p-2 focus:border-yellow-500 outline-none"
                                                />
                                                <button 
                                                    onClick={() => handleEditImage(foto.id)}
                                                    disabled={isEditing || !editPrompt}
                                                    className="bg-yellow-500 text-black p-2 rounded hover:bg-yellow-400 disabled:opacity-50"
                                                >
                                                    {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] text-neutral-400 uppercase mb-1 font-bold">Descrição</label>
                                        <input 
                                            type="text"
                                            value={foto.descricao}
                                            onChange={(e) => updatePhotoDescription(foto.id, e.target.value)}
                                            className="w-full bg-black/40 text-white text-sm rounded-md border border-neutral-700 p-2.5 focus:border-yellow-500 focus:outline-none transition-colors"
                                            placeholder="Descreva este vestígio..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] text-neutral-400 uppercase mb-1 font-bold">Local Específico</label>
                                        <input 
                                            type="text"
                                            value={foto.local || ''}
                                            onChange={(e) => updatePhotoLocal(foto.id, e.target.value)}
                                            className="w-full bg-black/40 text-white text-sm rounded-md border border-neutral-700 p-2.5 focus:border-yellow-500 focus:outline-none transition-colors"
                                            placeholder="Local do vestígio..."
                                        />
                                    </div>

                                    {/* Hash / Integrity Display */}
                                    <div className="pt-2 border-t border-neutral-800/50 mt-1">
                                        <label className="flex items-center gap-1 text-[10px] text-green-500 uppercase font-bold mb-1">
                                            <ShieldCheck size={12} /> Integridade do Arquivo (SHA256)
                                        </label>
                                        <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-neutral-800 group/hash">
                                            <code className="text-[10px] text-neutral-400 font-mono break-all leading-tight flex-1">
                                                {foto.hash}
                                            </code>
                                            <button 
                                                onClick={() => copyHash(foto.hash, foto.id)}
                                                className="text-neutral-500 hover:text-yellow-500 transition-colors p-1"
                                                title="Copiar Hash"
                                            >
                                                {copiedId === foto.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        )}
      </div>

      <BottomNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
};

// --- Step 6: Lab ---
export const Step6Lab: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [form, setForm] = useState({ qtd: 1, descricao: '', local: '', involucro: '' });
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const addItem = () => {
      if (form.descricao) {
          updateState({ objetos_laboratorio: [...state.objetos_laboratorio, { 
              id: generateId(), 
              item: (state.objetos_laboratorio.length + 1).toString(),
              qtd: form.qtd,
              descricao: form.descricao,
              local_coleta: form.local,
              lacre: form.involucro
          }] });
          setForm({ qtd: 1, descricao: '', local: '', involucro: '' });
      }
  };

  const removeItem = (id: string) => {
    updateState({ objetos_laboratorio: state.objetos_laboratorio.filter(o => o.id !== id) });
  };

  const handleGenerateReceipt = () => {
    setIsGeneratingReceipt(true);
    const element = document.getElementById('receipt-content');
    
    if (element && window.html2pdf) {
        const opt = {
            margin:       10,
            filename:     `Recibo_Custodia_${state.num_ocorrencia || 'PCDF'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        window.html2pdf().set(opt).from(element).save().then(() => {
            setIsGeneratingReceipt(false);
        }).catch((err: any) => {
            console.error(err);
            setIsGeneratingReceipt(false);
            alert("Erro ao gerar Recibo.");
        });
    } else {
        setIsGeneratingReceipt(false);
        if (!window.html2pdf) alert("Biblioteca PDF não carregada.");
    }
  };

  const today = new Date();
  const formattedDate = `${today.getDate()} de ${today.toLocaleString('pt-BR', { month: 'long' })} de ${today.getFullYear()} às ${today.getHours()}:${today.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full relative">
      <ScreenHeader title="Objetos Laboratório" />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <ToggleSimNao value={state.houve_lab} onChange={(v) => updateState({ houve_lab: v })} />

        {state.houve_lab === 'Sim' && (
            <div className="space-y-5 animate-fade-in">
                <div>
                    <label className="block text-neutral-400 text-sm mb-2 ml-1">Descrição do Vestígio</label>
                    <input
                        type="text"
                        value={form.descricao}
                        onChange={(e) => setForm({...form, descricao: e.target.value})}
                        className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-neutral-400 text-sm mb-2 ml-1">Quantidade</label>
                        <input
                             type="number"
                             value={form.qtd}
                             onChange={(e) => setForm({...form, qtd: parseInt(e.target.value) })}
                             className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                        />
                    </div>
                    <div>
                        <label className="block text-neutral-400 text-sm mb-2 ml-1">Invólucro/Lacre</label>
                        <input
                             type="text"
                             value={form.involucro}
                             onChange={(e) => setForm({...form, involucro: e.target.value})}
                             className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-neutral-400 text-sm mb-2 ml-1">Local da Coleta</label>
                    <input
                        type="text"
                        value={form.local}
                        onChange={(e) => setForm({...form, local: e.target.value})}
                        className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                    />
                </div>

                <button onClick={addItem} className="w-full bg-yellow-500 text-black font-bold py-4 rounded-lg uppercase tracking-wide shadow-lg shadow-yellow-500/20">
                    ADICIONAR + VESTÍGIOS
                </button>

                <div className="flex justify-center gap-4 mt-8">
                     <button className="flex flex-col items-center justify-center space-y-2 group" onClick={() => alert("Imprimindo...")}>
                        <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center group-active:bg-yellow-500/20 transition-colors">
                            <Printer className="text-yellow-500 w-8 h-8" />
                        </div>
                        <span className="text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight">IMPRIMIR<br/>ETIQUETA</span>
                    </button>

                    <button 
                        className="flex flex-col items-center justify-center space-y-2 group" 
                        onClick={handleGenerateReceipt}
                        disabled={state.objetos_laboratorio.length === 0}
                    >
                        <div className={`w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center transition-colors ${state.objetos_laboratorio.length === 0 ? 'opacity-50 cursor-not-allowed' : 'group-active:bg-yellow-500/20'}`}>
                            <FileText className="text-yellow-500 w-8 h-8" />
                        </div>
                        <span className={`text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight ${state.objetos_laboratorio.length === 0 ? 'opacity-50' : ''}`}>
                            {isGeneratingReceipt ? 'GERANDO...' : <>GERAR<br/>RECIBO</>}
                        </span>
                    </button>
                </div>
                
                {state.objetos_laboratorio.length > 0 && (
                     <div className="mt-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                        <p className="text-xs text-neutral-500 uppercase mb-2">Itens Adicionados:</p>
                        {state.objetos_laboratorio.map(obj => (
                            <div key={obj.id} className="text-sm text-white border-b border-neutral-800 last:border-0 py-2 flex justify-between items-center group">
                                <div>
                                    <span className="block">{obj.qtd}x {obj.descricao}</span>
                                    <span className="text-neutral-500 text-xs italic">{obj.lacre || 'S/ Lacre'}</span>
                                </div>
                                <button onClick={() => removeItem(obj.id)} className="text-neutral-600 hover:text-red-500 p-1">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        )}
      </div>

      <BottomNav onBack={prevStep} onNext={nextStep} />

      {/* Hidden Receipt Template */}
      <div className="fixed left-[-9999px] top-0">
          <div id="receipt-content" className="w-[210mm] min-h-[297mm] bg-white text-black p-10 font-serif relative">
                <div className="flex items-center border-b-2 border-black pb-4 mb-6">
                    <img src={LOGO_URL} alt="PCDF" className="w-20 h-auto mr-4" crossOrigin="anonymous"/>
                    <div>
                        <h1 className="text-xl font-bold uppercase">Polícia Civil do Distrito Federal</h1>
                        <h2 className="text-lg font-semibold">Instituto de Identificação - Recibo de Coleta de Vestígios</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="border border-black p-2">
                        <span className="font-bold block text-xs uppercase text-gray-600">Ocorrência</span>
                        <span className="text-lg">{state.num_ocorrencia || "---"}</span>
                    </div>
                    <div className="border border-black p-2">
                         <span className="font-bold block text-xs uppercase text-gray-600">Data/Hora de Geração</span>
                         <span>{formattedDate}</span>
                    </div>
                    <div className="col-span-2 border border-black p-2">
                         <span className="font-bold block text-xs uppercase text-gray-600">Perito Responsável</span>
                         <span>{state.equipe.perito || "---"}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold uppercase border-b border-black mb-2 pb-1">Relação de Itens Coletados</h3>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 w-12">Item</th>
                                <th className="border border-black p-2">Descrição</th>
                                <th className="border border-black p-2 w-16 text-center">Qtd.</th>
                                <th className="border border-black p-2">Local de Coleta</th>
                                <th className="border border-black p-2">Lacre/Invólucro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.objetos_laboratorio.map((obj, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                                    <td className="border border-black p-2">{obj.descricao}</td>
                                    <td className="border border-black p-2 text-center">{obj.qtd}</td>
                                    <td className="border border-black p-2">{obj.local_coleta}</td>
                                    <td className="border border-black p-2">{obj.lacre}</td>
                                </tr>
                            ))}
                            {state.objetos_laboratorio.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="border border-black p-4 text-center italic text-gray-500">Nenhum item adicionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-20 grid grid-cols-2 gap-20">
                    <div className="border-t border-black pt-2 text-center">
                        <p className="font-bold">{state.equipe.perito || "Perito Criminal"}</p>
                        <p className="text-xs">Responsável pela Coleta</p>
                    </div>
                    <div className="border-t border-black pt-2 text-center">
                        <p className="font-bold">__________________________</p>
                        <p className="text-xs">Recebido no Laboratório por</p>
                    </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 text-center text-xs text-gray-500">
                    <p>Documento gerado eletronicamente pelo sistema SPLO - PCDF</p>
                </div>
          </div>
      </div>
    </div>
  );
};
