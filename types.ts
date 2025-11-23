
export interface VestigioDecalcado {
  id: string;
  descricao: string;
  numeracao_fitas: string;
  suportes: number;
  quantidade?: number;
}

export interface FotoFIP {
  id: string;
  descricao: string;
  hash: string;
  nome_arquivo: string;
  numero_vestigio?: string;
  local?: string;
  imageData?: string;
  mimeType?: string;
}

export interface ObjetoLaboratorio {
  id: string;
  item: string;
  qtd: number;
  descricao: string;
  local_coleta: string;
  lacre: string;
}

export interface ArquivoGeral {
  id: string;
  nome: string;
  hash: string;
  data: string;
}

export interface OcorrenciaData {
  data_hora: string;
  local: string;
  gps?: string;
  natureza: string;
  equipe_padrao: string[];
}

export interface ObservacoesData {
  poeira: boolean;
  umidade: boolean;
  lapso: number;
  texto: string;
}

export interface AppState {
  step: number;
  usuario: string | null;
  num_ocorrencia: string;
  ocorrencia: OcorrenciaData | null;
  equipe: {
    perito: string;
    membros: string;
    inicio: string;
    termino: string;
    objeto_geral: string;
  };
  houve_decalque: 'Sim' | 'Não';
  vestigios_decalcados: VestigioDecalcado[];
  houve_fip: 'Sim' | 'Não';
  fotos_fip: FotoFIP[];
  houve_lab: 'Sim' | 'Não';
  objetos_laboratorio: ObjetoLaboratorio[];
  observacoes: ObservacoesData;
  uploads: ArquivoGeral[];
}

export const INITIAL_STATE: AppState = {
  step: 1,
  usuario: null,
  num_ocorrencia: '',
  ocorrencia: null,
  equipe: {
    perito: '',
    membros: '',
    inicio: '',
    termino: '',
    objeto_geral: ''
  },
  houve_decalque: 'Não',
  vestigios_decalcados: [],
  houve_fip: 'Não',
  fotos_fip: [],
  houve_lab: 'Não',
  objetos_laboratorio: [],
  observacoes: {
    poeira: false,
    umidade: false,
    lapso: 0,
    texto: ''
  },
  uploads: []
};
