export type GameStatus =
  | 'Não jogado'
  | 'Jogando'
  | 'Zerado'
  | 'Platinado';

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
}