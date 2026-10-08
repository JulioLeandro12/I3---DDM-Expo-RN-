# FAQ - I3 App

## 1. Estrutura do projeto

### Quais são as principais partes do projeto e onde você pode encontrar:

- UI/telas: a tela principal e a lógica da aplicação ficam em src/app/index.tsx.
- modelos de dados: os tipos do domínio do jogo estão em src/app/types/Game.ts.
- código de banco de dados/SQLite: este projeto não usa SQLite. A persistência local é feita com AsyncStorage em src/services/storage.ts.
- navegação: este app é uma tela simples, então não há uma pilha de navegação complexa. O Expo Router está presente no projeto, mas a implementação atual não usa múltiplas telas para fluxos de tarefa.
- código de notificações: não existe funcionalidade de notificação neste projeto.

### Breve descrição da organização do projeto
O projeto está organizado em uma estrutura pequena de Expo/React Native:

- src/app: telas e código de nível de tela
- src/components: componentes reutilizáveis, quando existem no projeto
- src/constants: constantes compartilhadas, como valores de status
- src/services: lógica de persistência de dados
- src/app/types: modelos de domínio

Este app é focado em um gerenciador compacto, semelhante a uma lista de tarefas, para jogos, com estado local e dados persistidos.

---

## 2. Arquitetura e estado

### Como o estado da aplicação é gerenciado?
O estado é gerenciado com hooks do React, principalmente useState, useMemo e useEffect.

O app mantém estados locais da interface, como:

- lista de jogos
- texto digitado para nome do novo/edite jogo
- status selecionado
- filtro atual
- texto de busca
- estado de edição

### Como a interface é atualizada após uma operação?
Quando o usuário cria um jogo:

1. o novo objeto é criado no componente;
2. o array antigo é copiado e o novo item é adicionado;
3. setGames é chamado com o array atualizado;
4. saveGames é aguardado para persistir a lista localmente.

Quando o usuário edita um jogo:

1. o jogo selecionado é identificado pelo id;
2. o modo de edição é ativado e os valores atuais são carregados no formulário;
3. a ação de salvar atualiza o item correspondente no array de jogos;
4. setGames renderiza novamente a lista;
5. AsyncStorage é atualizado.

Quando se muda o status do jogo, o mesmo padrão vale: o item é atualizado no array, o estado é renderizado novamente e a nova lista é salva.

### Padrão de arquitetura
Não há um padrão complexo de arquitetura, como Redux, MobX ou clean architecture. O projeto usa um modelo simples de estado local no componente, comum em apps pequenos de Expo.

---

## 3. Persistência com SQLite

### Como o SQLite é usado na aplicação?
Este projeto não usa SQLite.

Em vez disso, ele usa AsyncStorage para persistência local, que é uma abordagem mais simples de chave-valor para aplicativos móveis.

#### Onde o banco é criado?
Não há criação de banco SQLite neste projeto. O armazenamento é criado por meio da API AsyncStorage em src/services/storage.ts.

#### Como tarefas e categorias são armazenadas?
Neste projeto, o modelo de dados é uma lista de objetos Game, e não tabelas de tarefas/categorias. Cada item contém:

- id
- name
- status

Os valores são armazenados como um array JSON em uma chave fixa do AsyncStorage, como @games.

#### Onde são implementadas as operações de criar, ler, atualizar e deletar?
Em src/services/storage.ts:

- getGames: lê e faz o parse dos dados salvos
- saveGames: grava a lista de volta no AsyncStorage

A lógica que realiza as atualizações da lista está em src/app/index.tsx, onde addGame, removeGame e o fluxo de edição manipulam o array antes de chamar saveGames.

---

## 4. Seguindo uma operação

### Trace o que acontece quando o usuário cria uma nova tarefa
Neste projeto, o equivalente é criar um novo jogo.

O fluxo é:

1. O usuário digita o nome do jogo e seleciona um status.
2. Pressiona o botão de adicionar.
3. A função addGame em src/app/index.tsx é executada.
4. Ela remove espaços em branco, verifica se o texto está vazio e impede nomes duplicados.
5. Cria um novo objeto Game com um id gerado e o status selecionado.
6. Cria um array atualizado com o novo jogo adicionado.
7. setGames atualiza o estado local do React.
8. saveGames é chamado, escrevendo o array atualizado no AsyncStorage.
9. A lista renderiza novamente e o novo item aparece.

### Principais funções/componentes envolvidos
- src/app/index.tsx
  - addGame
  - persistGames
  - resetForm
- src/services/storage.ts
  - saveGames
  - getGames
- src/app/types/Game.ts
  - definições dos tipos Game e GameStatus

Não há agendamento de notificações neste projeto, porque não existe nenhum sistema de lembrete/notification.

---

## 5. Navegação

### Como funciona a navegação entre telas?
A aplicação atual funciona como uma interface de uma única tela. Ela não implementa um fluxo de navegação entre múltiplas telas para edição de jogo ou detalhes.

O projeto inclui Expo Router, mas a implementação atual não roteia entre várias páginas para um editor de tarefas. Em vez disso, o app mantém o estado de edição no mesmo componente.

### Fluxo de edição
Quando o usuário pressiona Editar em um jogo, o app:

- encontra o item selecionado pelo id;
- preenche o formulário com o nome e o status atuais;
- ativa o modo de edição usando editingGameId;
- ao salvar, atualiza apenas aquele objeto no array e persiste a mudança.

Isso significa que a informação é passada pelo estado do componente, e não por params de navegação entre telas.

---

## 6. Notificações

### Como os lembretes de tarefas são implementados?
Este projeto não implementa lembretes ou notificações no momento.

Não há código para:

- agendar notificações locais
- associar lembretes a tarefas
- alterar o horário da notificação quando a data muda
- cancelar notificações quando a tarefa é deletada ou concluída

O app armazena apenas o nome e o status dos jogos localmente, e não possui data de vencimento, lembrete ou mecanismo de notificação.

---

## 7. Decisões do agente

### Importantes decisões tomadas pelo agente de codificação
Aqui estão pelo menos duas decisões que não foram explicitamente exigidas na tarefa, mas foram escolhidas durante a implementação:

1. Arquitetura orientada a estado local
   - O agente decidiu manter o estado em hooks do React em vez de usar uma solução mais pesada, como Redux ou Zustand.
   - Isso é adequado para um app pequeno e reduz a complexidade.

2. Persistência com AsyncStorage
   - O agente escolheu AsyncStorage em vez de SQLite.
   - Isso simplificou a persistência local e manteve o app leve e fácil de manter.

3. Organização em um único componente principal
   - O agente decidiu manter a lógica principal em src/app/index.tsx em vez de dividir em vários arquivos por funcionalidade.
   - Isso torna o projeto mais simples para um app pequeno, mas menos escalável para projetos maiores.

4. Filtro e busca dentro do app
   - O agente adicionou busca e filtro mesmo sem ser obrigatório na ideia inicial.
   - Isso melhorou a experiência de uso e mostrou uma decisão para tornar o app mais prático.

---

## 8. Análise do BUILD_LOG

### Um problema ou bug encontrado
Um problema importante foi o de caminhos de importação. O app originalmente tinha imports apontando para arquivos inexistentes ou caminhos relativos incorretos, o que causava falhas de resolução do TypeScript.

### Como o agente tentou resolver
O agente corrigiu os caminhos de importação para que eles correspondessem à estrutura real do projeto, por exemplo:

- src/app/index.tsx importando os locais corretos de src/services e src/constants
- imports de tipos apontando para src/app/types/Game.ts

### A primeira solução funcionou?
A correção inicial resolveu o problema estrutural e eliminou os erros de importação na validação do editor. A partir daí, a lógica ficou estável o suficiente para continuar melhorando a aplicação.

### O que foi feito no final
O projeto foi refinado com:

- correção dos caminhos reais dos arquivos
- melhoria da interface e do fluxo de adição/edição de jogos
- adição de busca e filtros
- manutenção de um modelo de persistência compacto e local com AsyncStorage

Isso está documentado em BUILD_LOG.md.

### O que o BUILD_LOG ajudou a entender que seria mais difícil de descobrir só olhando o código final?
O BUILD_LOG ajudou a entender a trajetória real do projeto, e isso seria bem mais difícil de descobrir apenas analisando o código final.

Ele mostrou:

- quais erros aconteceram de verdade, como os problemas de importação e de caminhos de arquivos;
- por que certas decisões foram tomadas, como usar AsyncStorage em vez de SQLite;
- como o app evoluiu de uma versão simples para uma versão com busca, filtros, edição e persistência;
- quais mudanças foram experimentais e depois removidas, como o tema escuro;
- o contexto de correção e refinamento, que não aparece claramente no código final porque o estado final já está “limpo”.

Em outras palavras, o build log funciona como a “história de desenvolvimento”: ele explica não só o que o app virou, mas também como e por quê ele chegou ali. Isso é valioso porque o código final costuma esconder erros, tentativas falhas e decisões de implementação que foram essenciais para o resultado final.

Em resumo: o build log revela a trajetória de depuração e evolução do projeto, enquanto o código final só mostra o resultado consolidado.
