import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GAME_STATUSES } from '../constants/statuses';
import { getGames, saveGames } from '../services/storage';
import { Game, GameStatus } from './types/Game';

const FILTERS = ['Todos', ...GAME_STATUSES] as const;
type FilterStatus = (typeof FILTERS)[number];

const STATUS_COLORS: Record<GameStatus, string> = {
  'Não jogado': '#7b7f89',
  Jogando: '#3b82f6',
  Zerado: '#22c55e',
  Platinado: '#f59e0b',
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<GameStatus>('Não jogado');
  const [filter, setFilter] = useState<FilterStatus>('Todos');
  const [search, setSearch] = useState('');
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  const palette = {
    background: '#f3f4f6',
    surface: '#ffffff',
    panel: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    border: '#d1d5db',
    input: '#f9fafb',
    accent: '#4f46e5',
  };

  useEffect(() => {
    loadGames();
  }, []);

  const visibleGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredByStatus = filter === 'Todos'
      ? games
      : games.filter((game) => game.status === filter);

    if (!normalizedSearch) {
      return filteredByStatus;
    }

    return filteredByStatus.filter((game) =>
      game.name.toLowerCase().includes(normalizedSearch)
    );
  }, [filter, games, search]);

  const summary = useMemo(
    () =>
      GAME_STATUSES.reduce(
        (acc, gameStatus) => {
          acc[gameStatus] = games.filter((game) => game.status === gameStatus).length;
          return acc;
        },
        {} as Record<GameStatus, number>
      ),
    [games]
  );

  async function loadGames(): Promise<void> {
    const storedGames = await getGames();
    setGames(storedGames);
  }

  async function persistGames(nextGames: Game[]): Promise<void> {
    setGames(nextGames);
    await saveGames(nextGames);
  }

  function resetForm(): void {
    setName('');
    setStatus('Não jogado');
    setEditingGameId(null);
  }

  async function addGame(): Promise<void> {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const alreadyExists = games.some(
      (game) =>
        game.name.toLowerCase() === trimmedName.toLowerCase() &&
        game.id !== editingGameId
    );

    if (alreadyExists) {
      return;
    }

    if (editingGameId) {
      const updatedGames = games.map((game) =>
        game.id === editingGameId
          ? { ...game, name: trimmedName, status }
          : game
      );

      await persistGames(updatedGames);
      resetForm();
      return;
    }

    const newGame: Game = {
      id: Date.now().toString(),
      name: trimmedName,
      status,
    };

    const updatedGames = [...games, newGame];

    await persistGames(updatedGames);
    resetForm();
  }

  async function removeGame(gameId: string): Promise<void> {
    const updatedGames = games.filter((game) => game.id !== gameId);
    await persistGames(updatedGames);
  }

  function startEditingGame(game: Game): void {
    setEditingGameId(game.id);
    setName(game.name);
    setStatus(game.status);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: palette.accent }]}>Minha biblioteca</Text>
            <Text style={[styles.title, { color: palette.text }]}>Meus Jogos</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{games.length}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Jogando</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{summary.Jogando}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Zerados</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{summary.Zerado}</Text>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Adicionar jogo</Text>

          <TextInput
            style={[styles.input, { backgroundColor: palette.input, borderColor: palette.border, color: palette.text }]}
            placeholder="Nome do jogo"
            placeholderTextColor={palette.muted}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: palette.muted }]}>Status</Text>

          <View style={styles.statusContainer}>
            {GAME_STATUSES.map((gameStatus) => {
              const isSelected = gameStatus === status;

              return (
                <Pressable
                  key={gameStatus}
                  onPress={() => setStatus(gameStatus)}
                  style={[
                    styles.statusOption,
                    isSelected && styles.statusOptionSelected,
                    {
                      backgroundColor: isSelected ? '#eef2ff' : palette.surface,
                      borderColor: isSelected ? STATUS_COLORS[gameStatus] : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: isSelected ? STATUS_COLORS[gameStatus] : palette.text,
                      },
                    ]}
                  >
                    {gameStatus}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={addGame}>
              <Text style={styles.primaryButtonText}>
                {editingGameId ? 'Salvar alterações' : 'Adicionar jogo'}
              </Text>
            </Pressable>

            {editingGameId ? (
              <Pressable
                style={[styles.secondaryButton, { borderColor: palette.border }]}
                onPress={resetForm}
              >
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Cancelar</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Buscar jogo</Text>

          <TextInput
            style={[styles.input, { backgroundColor: palette.input, borderColor: palette.border, color: palette.text }]}
            placeholder="Pesquisar por nome"
            placeholderTextColor={palette.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Filtrar por status</Text>

          <View style={styles.filterRow}>
            {FILTERS.map((filterOption) => {
              const selected = filterOption === filter;

              return (
                <Pressable
                  key={filterOption}
                  onPress={() => setFilter(filterOption)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    { backgroundColor: selected ? palette.accent : palette.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selected && styles.filterChipTextSelected,
                      { color: selected ? '#ffffff' : palette.text },
                    ]}
                  >
                    {filterOption}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Minha lista</Text>
          <Text style={[styles.countText, { color: palette.muted }]}>{visibleGames.length} jogo(s)</Text>
        </View>

        <View style={styles.list}>
          {visibleGames.length === 0 ? (
            <Text style={[styles.emptyState, { backgroundColor: palette.panel, color: palette.muted }]}>
              Nenhum jogo encontrado.
            </Text>
          ) : (
            visibleGames.map((game) => (
              <View key={game.id} style={[styles.gameCard, { backgroundColor: palette.panel, borderColor: palette.border }]}>
                <View style={styles.gameHeader}>
                  <Text style={[styles.gameName, { color: palette.text }]}>{game.name}</Text>

                  <View style={styles.gameActions}>
                    <Pressable
                      onPress={() => startEditingGame(game)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => removeGame(game.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[game.status] },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{game.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  header: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 12,
    marginBottom: 6,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
  },

  panel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  statusOption: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  statusOptionSelected: {
    backgroundColor: '#eef2ff',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterChipSelected: {
    backgroundColor: '#111827',
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  filterChipTextSelected: {
    color: '#ffffff',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  countText: {
    fontSize: 12,
    fontWeight: '600',
  },

  list: {
    gap: 10,
  },

  gameCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  gameName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },

  gameActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  editButtonText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },

  deleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyState: {
    borderRadius: 16,
    padding: 18,
    textAlign: 'center',
    fontSize: 14,
  },
});