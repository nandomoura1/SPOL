
import React, { useState } from 'react';
import { AppState, OcorrenciaData } from '../../types';
import { Search, Plus, ArrowRight, ArrowLeft, MapPin, ExternalLink, Loader2, Crosshair } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LOGO_URL } from '../../utils';

interface StepProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Helper component for headers
// Updated to align Logo and Title horizontally (Left aligned) as per screenshots
export const ScreenHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex items-center mb-8 mt-4 pl-1">
    <img 
      src={LOGO_URL}
      alt="Logo PCDF" 
      className="w-16 h-auto mr-4 drop-shadow-md"
      crossOrigin="anonymous"
    />
    <div className="flex flex-col">
      <h2 className="text-yellow-500 text-xl font-bold uppercase tracking-wide leading-tight text-left">{title}</h2>
      {subtitle && <p className="text-neutral-400 text-xs mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// Helper for Bottom Nav
export const BottomNav = ({ onBack, onNext, nextLabel = "Prosseguir" }: { onBack?: () => void, onNext?: () => void, nextLabel?: string }) => (
  <div className="flex justify-between items-center mt-auto pt-8 pb-4 px-2">
    {onBack ? (
      <button onClick={onBack} className="flex flex-col items-center group">
        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-active:scale-95 transition-transform">
          <ArrowLeft className="text-black w-6 h-6" />
        </div>
        <span className="text-[10px] text-yellow-500 font-bold uppercase mt-2 tracking-wider">Voltar</span>
      </button>
    ) : <div className="w-12"></div>}
    
    {onNext ? (
      <button onClick={onNext} className="flex flex-col items-center group">
        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-active:scale-95 transition-transform">
          <ArrowRight className="text-black w-6 h-6" />
        </div>
        <span className="text-[10px] text-yellow-500 font-bold uppercase mt-2 tracking-wider">{nextLabel}</span>
      </button>
    ) : <div className="w-12"></div>}
  </div>
);

// --- Step 1: Login ---
export const Step1Login: React.FC<StepProps> = ({ state, updateState, nextStep }) => {
  const [matricula, setMatricula] = useState(state.usuario || '');
  const [senha, setSenha] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (matricula) {
      updateState({ usuario: matricula, equipe: { ...state.equipe, perito: matricula } });
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <img 
          src={LOGO_URL}
          alt="Logo PCDF" 
          className="w-40 h-auto mb-10 drop-shadow-2xl"
          crossOrigin="anonymous"
        />
        
        <h1 className="text-4xl font-extrabold text-yellow-500 tracking-widest mb-1">SPLO</h1>
        <h2 className="text-yellow-500/80 text-center font-medium text-lg mb-12 max-w-[240px] leading-tight">
          Sistema de Perícia Papiloscópica de Local de Crime
        </h2>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Login</label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none placeholder-neutral-600"
              placeholder="Matrícula"
            />
          </div>
          
          <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none placeholder-neutral-600"
              placeholder="••••••"
            />
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl uppercase tracking-wider shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-transform"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Step 2: Occurrence (Tela Ocorrência) ---
export const Step2Occurrence: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [numOcorrencia, setNumOcorrencia] = useState(state.num_ocorrencia);
  const [localManual, setLocalManual] = useState(state.ocorrencia?.local || "");
  const [gpsData, setGpsData] = useState(state.ocorrencia?.gps || "");
  const [loadingGps, setLoadingGps] = useState(false);
  
  const handleSearch = async () => {
     // Simulate fetch or Create new
     if (numOcorrencia) {
        const mockData: OcorrenciaData = {
            data_hora: state.ocorrencia?.data_hora || new Date().toLocaleString('pt-BR'),
            local: localManual || "Local não informado",
            gps: gpsData,
            natureza: "Homicídio",
            equipe_padrao: ["Perito João (12345)", "Auxiliar Maria (67890)"]
        };
        updateState({ ocorrencia: mockData, num_ocorrencia: numOcorrencia });
        nextStep();
     }
  };

  const getGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setGpsData(coords);
        setLoadingGps(false);
      },
      (error) => {
        console.error(error);
        alert("Erro ao obter localização.");
        setLoadingGps(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Tela Ocorrência" />
      
      <div className="space-y-6 flex-1">
        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Número da Ocorrência Policial</label>
            <input
                type="text"
                value={numOcorrencia}
                onChange={(e) => setNumOcorrencia(e.target.value)}
                className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                placeholder="Ex: 12345"
            />
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Local do Fato</label>
            <input
                type="text"
                value={localManual}
                onChange={(e) => setLocalManual(e.target.value)}
                className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none mb-2"
                placeholder="Endereço exato"
            />
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={gpsData}
                        readOnly
                        className="w-full bg-neutral-900 border border-neutral-800 text-yellow-500 text-xs rounded-lg py-3 px-4 pl-9 focus:outline-none"
                        placeholder="Coordenadas GPS"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                </div>
                <button 
                    onClick={getGpsLocation}
                    disabled={loadingGps}
                    className="bg-neutral-800 text-yellow-500 px-4 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors border border-neutral-700"
                    title="Obter localização atual"
                >
                    {loadingGps ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                </button>
            </div>
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Ano</label>
            <input
                type="text"
                className="w-full bg-neutral-800 text-white rounded-lg py-4 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                placeholder="2024"
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8 mb-8">
          <button onClick={handleSearch} className="flex flex-col items-center justify-center space-y-2 group">
             <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center group-active:bg-yellow-500/20 transition-colors">
                <Search className="text-yellow-500 w-8 h-8" />
             </div>
             <span className="text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight">Pesquisar<br/>Perícias</span>
          </button>

          <button onClick={handleSearch} className="flex flex-col items-center justify-center space-y-2 group">
             <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center group-active:bg-yellow-500/20 transition-colors">
                <Plus className="text-yellow-500 w-8 h-8" />
             </div>
             <span className="text-yellow-500 text-[10px] font-bold uppercase text-center leading-tight">Nova<br/>Perícia</span>
          </button>
      </div>

      <BottomNav onBack={prevStep} onNext={numOcorrencia ? handleSearch : undefined} />
    </div>
  );
};

// --- Step 3: Millenium (Tela Millenium) ---
export const Step3Team: React.FC<StepProps> = ({ state, updateState, nextStep, prevStep }) => {
  const { ocorrencia } = state;
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [mapLinks, setMapLinks] = useState<any[]>([]);

  const handleAnalyzeLocation = async () => {
    if (!ocorrencia?.local) return;
    
    setAnalyzing(true);
    setAnalysisResult("");
    setMapLinks([]);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const locationContext = ocorrencia.gps ? `${ocorrencia.local} (GPS: ${ocorrencia.gps})` : ocorrencia.local;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please analyze the location "${locationContext}". Provide a brief summary of the area, nearby landmarks, and any relevant details for a police report context. Keep it concise.`,
            config: {
                tools: [{ googleMaps: {} }],
            },
        });
        
        setAnalysisResult(response.text || "Sem informações disponíveis.");
        
        // Extract grounding chunks
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            setMapLinks(chunks);
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        setAnalysisResult("Erro ao consultar serviço de inteligência de local.");
    } finally {
        setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Tela Millenium" />

      <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide pb-4">
        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Número da Ocorrência Policial</label>
            <input
                readOnly
                value={state.num_ocorrencia}
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg py-3 px-4 focus:outline-none"
            />
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Local do Fato</label>
            <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg py-3 px-4 min-h-[3rem] flex flex-col justify-center">
               <span>{ocorrencia?.local || "---"}</span>
               {ocorrencia?.gps && (
                 <span className="text-yellow-600/80 text-xs flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    GPS: {ocorrencia.gps}
                 </span>
               )}
            </div>
            {ocorrencia?.local && (
                <div className="mt-2">
                    <button 
                        onClick={handleAnalyzeLocation}
                        disabled={analyzing}
                        className="flex items-center space-x-2 text-[10px] text-yellow-500 font-bold uppercase bg-yellow-500/10 px-3 py-2 rounded hover:bg-yellow-500/20 transition-colors w-full justify-center"
                    >
                        {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                        <span>{analyzing ? "Analisando com Gemini..." : "Consultar Inteligência de Local (Gemini)"}</span>
                    </button>
                    
                    {analysisResult && (
                        <div className="mt-3 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                            <p className="text-xs text-neutral-300 leading-relaxed">{analysisResult}</p>
                            
                            {mapLinks.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-neutral-700">
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Referências de Mapa:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {mapLinks.map((chunk, i) => {
                                            if (chunk.web?.uri) {
                                                return (
                                                    <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs text-yellow-500 hover:underline bg-black/30 px-2 py-1 rounded">
                                                        <span>{chunk.web.title || "Ver no Mapa"}</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Data e Hora</label>
            <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg py-3 px-4">
               {ocorrencia?.data_hora || "---"}
            </div>
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Equipe Responsável</label>
            <textarea
                value={state.equipe.membros}
                onChange={(e) => updateState({ equipe: { ...state.equipe, membros: e.target.value } })}
                className="w-full bg-neutral-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                rows={2}
                placeholder="Digite os nomes..."
            />
        </div>

        <div>
            <label className="block text-neutral-400 text-sm mb-2 ml-1">Descrição do Objeto</label>
            <textarea
                value={state.equipe.objeto_geral}
                onChange={(e) => updateState({ equipe: { ...state.equipe, objeto_geral: e.target.value } })}
                className="w-full bg-neutral-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 border-none"
                rows={2}
                placeholder="VW Gol Placa XXXXXXX DF"
            />
        </div>
      </div>

      <BottomNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
};
