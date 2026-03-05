export enum TypeContenu {
  VIDEO = "VIDEO",
  TEXTE = "TEXTE",
  PDF = "PDF",
  PRESENTATION = "PRESENTATION",
}

export interface CoursRequestDTO {
  titre: string;
  contenu?: string;
  typeContenu: TypeContenu;
  videoUrl?: string;
  documentUrl?: string;
  ordre?: number;
}

export interface CoursResponseDTO {
  id: number;
  titre: string;
  contenu: string;
  typeContenu: TypeContenu;
  videoUrl: string;
  documentUrl: string;
  ordre: number;
}
