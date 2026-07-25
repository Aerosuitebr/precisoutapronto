export type ReferenciaTipo = 'site' | 'livro' | 'artigo';

export interface ReferenciaBase {
  id: string;
  tipo: ReferenciaTipo;
  autor: string; // "Sobrenome, Nome; Sobrenome2, Nome2" ou nome de organização
  titulo: string;
  ano: string;
}

export interface ReferenciaSite extends ReferenciaBase {
  tipo: 'site';
  nomeSite: string;
  url: string;
  dataAcesso: string; // yyyy-mm-dd
}

export interface ReferenciaLivro extends ReferenciaBase {
  tipo: 'livro';
  editora: string;
  cidade: string;
  edicao?: string;
}

export interface ReferenciaArtigo extends ReferenciaBase {
  tipo: 'artigo';
  revista: string;
  volume?: string;
  numero?: string;
  paginas?: string;
  cidade?: string;
}

export type Referencia = ReferenciaSite | ReferenciaLivro | ReferenciaArtigo;
