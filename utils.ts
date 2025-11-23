export async function calculateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString('pt-BR');
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Logo oficial da PCDF com fundo transparente (PNG)
export const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bras%C3%A3o_Pol%C3%ADcia_Civil_do_Distrito_Federal.png/200px-Bras%C3%A3o_Pol%C3%ADcia_Civil_do_Distrito_Federal.png";