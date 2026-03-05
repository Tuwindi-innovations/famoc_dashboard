export interface User {
  id?: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  password?: string;
  role?: string;
  active?: boolean;
  dateCreation?: string;
}

export interface UserResponseDTO {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  active?: boolean;
}
