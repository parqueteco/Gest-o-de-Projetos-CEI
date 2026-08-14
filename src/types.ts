export interface Acao {
  IDAcao: string;
  Pilar: string;
  NomeAcao: string;
  Atividade: string;
  MetaFinep: string;
  RubricaOrcamentaria: string;
  ValorEstimado: string;
  _rowIndex?: number;
}

export interface Atividade {
  IDAtividade: string;
  Acoes: string;
  Ordem: string;
  Atividade: string;
  Descricao: string;
  IndicadorFisico: string;
  DataInicio: string;
  DataFim: string;
  Responsavel: string;
  Status: string;
  Observacao: string;
  LinkEvidencia: string;
  _rowIndex?: number;
}

export interface Subatividade {
  IDSubatividade: string;
  IDAtividade: string;
  OrdemSub: string;
  Subatividade: string;
  Descricao: string;
  DataInicio: string;
  DataFim: string;
  Responsavel: string;
  Status: string;
  Observacao: string;
  LinkEvidencia: string;
  IndicadorFisico: string;
  _rowIndex?: number;
}
