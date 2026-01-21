export type UserProfile = 'DIRETORIA' | 'CONSELHEIRO' | 'DESBRAVADOR';

export interface UserContext {
  profile: UserProfile;
  unitId?: string;
  displayName: string;
}
