export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  level: number;
  capturedAt: Date;
  favorite: boolean;
  moves: string[];
  imageUrl: string;
}
