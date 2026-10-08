import AsyncStorage from '@react-native-async-storage/async-storage';

import { Game } from '../app/types/Game';

const GAMES_KEY = '@games';

export async function getGames(): Promise<Game[]> {
  const games = await AsyncStorage.getItem(GAMES_KEY);

  if (!games) {
    return [];
  }

  try {
    const parsedGames = JSON.parse(games) as Game[];
    return Array.isArray(parsedGames) ? parsedGames : [];
  } catch {
    return [];
  }
}

export async function saveGames(games: Game[]): Promise<void> {
  await AsyncStorage.setItem(
    GAMES_KEY,
    JSON.stringify(games)
  );
}