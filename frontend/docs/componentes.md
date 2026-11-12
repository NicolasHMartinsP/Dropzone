# Catálogo de componentes

Cada componente fica em `frontend/src/components/Nome/`, com o arquivo `Nome.jsx` e seu próprio `Nome.module.css`. A aparência local fica no CSS Module; cores, fontes e regras gerais vêm de `styles/global.css`.

Os nomes de componentes, props e funções seguem o inglês; os textos mostrados ao usuário e a documentação ficam em português. Todos os componentes usam export nomeado (`import { Button } from ...`).

## Estrutura e navegação

| Componente | Responsabilidade | Props |
| --- | --- | --- |
| `Layout` | Estrutura comum das rotas: link "Pular para o conteúdo", `Header`, `<main>` com `Outlet` e `Footer` (oculto nas telas de ferramenta). Volta o scroll ao topo ao trocar de rota | — |
| `Header` | Marca, menu suspenso de ferramentas (Entrar/Conta, Baixar, Converter, Histórico) que fecha ao clicar fora ou com Esc, e botão fixo de perfil | — |
| `Footer` | Ano, nome da aplicação e link para a documentação da API | — |
| `Brand` | Logotipo com link para o início | `inverse` |
| `RequireLogin` | Protege uma rota: mostra "Carregando…" enquanto confere a sessão e redireciona para `/login` sem usuário | `children` |
| `PageHeading` | Cabeçalho de página com número, setor, título, descrição e área de ações | `number`, `label`, `title`, `description`, `children` |

## Ações e formulários

| Componente | Responsabilidade | Props |
| --- | --- | --- |
| `Button` | Botão padrão. Vira `Link` com `to`, `<a>` com `href` ou `<button>` nos demais casos; mostra ícone de carregamento e fica desabilitado com `loading` | `children`, `to`, `href`, `variant` (`primary`, `secondary`, `ghost`, `danger`), `icon`, `iconRight`, `loading`, `disabled`, `className` e demais atributos |
| `FormField` | Campo com `label` ligado ao `input` por `useId` | `label` e todos os atributos de `input` |
| `AuthCard` | Cartão centralizado das telas de conta | `title`, `description`, `children`, `footer` |
| `ConfirmDialog` | Diálogo nativo (`<dialog>`) para confirmar exclusões; Esc cancela, exceto durante o carregamento | `open`, `title`, `children`, `onCancel`, `onConfirm`, `loading` |
| `FormatPicker` | Lista de formatos em botões, informando a escolha por callback | `formats`, `value`, `onChange`, `disabled` |

## Arquivos e mídia

| Componente | Responsabilidade | Props |
| --- | --- | --- |
| `FileDropzone` | Recebe um arquivo por seleção ou arraste e entrega a `FileList` para a página validar | `onSelect`, `disabled`, `maxSize` |
| `MediaStage` | Palco da mídia selecionada: nome, tamanho, prévia (imagem, vídeo ou áudio, com aviso se o navegador não reproduzir), resolução de origem, área de controles e linha de status | `src`, `kind`, `name`, `size`, `resolution`, `busy`, `status`, `active`, `children` |
| `FileBadge` | Ícone e formato de um arquivo por tipo | `kind` (`image`, `audio`, `video`), `format`, `size` (`normal`, `large`) |
| `HistoryTable` | Tabela do histórico com arquivo, operação, data, situação, tamanho e ações de baixar/excluir; delega as ações à página | `items`, `onDownload`, `onDelete`, `savingId` |

O arquivo `MediaStage/Workspace.module.css` guarda o layout compartilhado pelas telas de download e conversão (área central, seletor de formato, botões e barra de link).

## Feedback

| Componente | Responsabilidade | Props |
| --- | --- | --- |
| `Notice` | Orientação ou erro dentro de um fluxo (`role="alert"` quando é erro) | `children`, `error` |
| `Toast` | Aviso global temporário, controlado pelo `AppContext` | `toast` (`{ message, type }`), `onClose` |
| `ProcessingState` | Indicador de processamento em andamento, sem porcentagem inventada | `title`, `description` |
| `Icon` | Mapa único dos ícones Lucide usados na interface. Nome desconhecido cai no ícone de arquivo | `name`, `size`, `className` |

Ícones disponíveis em `Icon`: `download`, `cloudDownload`, `upload`, `convert`, `refresh`, `arrowRight`, `arrowUpRight`, `fileImage`, `fileAudio`, `fileVideo`, `file`, `check`, `success`, `alert`, `info`, `loader`, `link`, `close`, `menu`, `search`, `trash`, `clock`, `chevronDown`, `chevronLeft`, `chevronRight`, `folder`, `shield`, `sparkles`, `external`, `layers`, `copy`, `code`, `image`, `music`, `video`, `drive`, `clipboard`, `plus`, `user`, `login`, `logout`.

## Componentes ainda não utilizados

`Brand`, `FileBadge` (fora da `HistoryTable`), `FormatPicker` e `ProcessingState` existem na pasta, mas hoje não são importados por nenhuma página:

- `Brand` é usado apenas pelo `Header`.
- `FormatPicker` e `ProcessingState` foram substituídos pelo `<select>` e pela linha de status do `MediaStage`. O `FormatPicker` importa um `FormatPicker.module.css` que não existe na pasta; crie o arquivo antes de voltar a usá-lo.

## Páginas

Cada página fica em `frontend/src/pages/NomePage/`, com CSS Module próprio quando precisa de estilo específico.

| Página | Rota | O que faz | Componentes principais |
| --- | --- | --- | --- |
| `LandingPage` | `/`, `/downloads`, `/conversor` | Mantém as duas ferramentas montadas e mostra uma conforme a rota | `DownloadPage`, `ConvertPage` |
| `DownloadPage` | (dentro da Landing) | Analisa um link, mostra a prévia e os formatos, prepara e salva o arquivo | `MediaStage`, `Notice`, `Icon` |
| `ConvertPage` | (dentro da Landing) | Recebe um arquivo, valida tipo/tamanho/FFmpeg, converte e salva | `FileDropzone`, `MediaStage`, `Notice` |
| `HistoryPage` | `/historico` | Lista com filtros, busca com debounce, paginação, novo download e exclusão | `PageHeading`, `HistoryTable`, `ConfirmDialog`, `Button`, `Notice` |
| `LoginPage` | `/login` | Entra na conta e leva ao perfil | `AuthCard`, `FormField`, `Button`, `Notice` |
| `RegisterPage` | `/cadastro` | Cria a conta, entra automaticamente e leva ao perfil | `AuthCard`, `FormField`, `Button`, `Notice` |
| `ProfilePage` | `/perfil` | Mostra os dados, edita nome/e-mail, troca senha, sai e exclui a conta | `AuthCard`, `FormField`, `Button`, `ConfirmDialog`, `Notice` |
| `NotFoundPage` | `*` | Página 404 com retorno ao início | `Button` |

## Contexts, hooks e utils

| Arquivo | Exporta | Uso |
| --- | --- | --- |
| `contexts/AppContext.jsx` | `AppProvider`, `useApp` | `health`, `connection`, `notify` |
| `contexts/AuthContext.jsx` | `AuthProvider`, `useAuth` | `user`, `checking`, `login`, `register`, `logout`, `updateProfile`, `deleteAccount` |
| `hooks/useDebounce.js` | `useDebounce(value, delay = 300)` | Espera o usuário parar de digitar na busca do histórico |
| `utils/format.js` | `formatBytes`, `formatDate`, `fileKind` | Tamanho legível, data em pt-BR e tipo do arquivo (`image`, `audio`, `video` ou `null`) |

## Exemplos de uso

```jsx
<Button icon="convert" loading={busy} onClick={convert}>
  Converter arquivo
</Button>

<Button to="/historico" variant="secondary" iconRight="arrowUpRight">
  Ver histórico
</Button>
```

```jsx
<FormField
  label="E-mail"
  name="email"
  type="email"
  required
  value={form.email}
  onChange={updateField}
/>
```

```jsx
<ConfirmDialog
  open={confirming}
  title="Excluir este registro?"
  loading={deleting}
  onCancel={() => setConfirming(false)}
  onConfirm={confirmDelete}
>
  O registro e o arquivo gerado serão removidos.
</ConfirmDialog>
```

## Regras para novos componentes

- Extraia um componente quando houver uma responsabilidade clara, reutilização ou um bloco visual que dificultaria a leitura da página. Não extraia apenas porque existe uma `div`.
- Componentes não fazem pedidos HTTP; recebem dados e callbacks da página. As exceções são os contexts.
- Handlers não precisam conhecer detalhes do Express ou do banco.
- Use os tokens de `global.css` em vez de cores e fontes fixas.
- Mantenha acessibilidade: `label` em campos, `aria-label` em botões só com ícone e `role="status"`/`role="alert"` em mensagens.
