# Catálogo de componentes

Cada pasta de componente possui o arquivo JSX e seu próprio `Nome.module.css`. A aparência local fica no CSS Module; cores e regras gerais vêm de `styles/global.css`.

| Componente       | Responsabilidade                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Layout           | Compartilhar Header/Footer, renderizar Outlet, oferecer salto ao conteúdo e ajustar o scroll |
| Header           | Navegação principal, menu mobile, conexão com a API e link ao Swagger                        |
| Footer           | Navegação secundária e identificação da aplicação                                            |
| Brand            | Marca com link para a landing                                                                |
| Button           | Padronizar ações, variantes, links e estado de carregamento                                  |
| Icon             | Centralizar os ícones Lucide usados pela interface                                           |
| PageHeading      | Exibir número, setor, título e descrição de uma tela                                         |
| ToolCard         | Apresentar uma ferramenta com link para sua rota                                             |
| HeroPreview      | Ilustrar um exemplo de conversão na landing, sem simular uma operação real                   |
| FileDropzone     | Capturar um arquivo por seleção ou arraste e delegar sua validação à página                  |
| FileBadge        | Representar visualmente o tipo/formato de um arquivo                                         |
| FormatPicker     | Exibir formatos compatíveis e informar a escolha por callback                                |
| SupportedFormats | Exibir formatos de imagem, áudio e vídeo e disponibilidade do FFmpeg                         |
| ProcessingState  | Informar processamento em andamento sem inventar porcentagens                                |
| TaskResult       | Apresentar o resultado, salvar o arquivo e permitir outro processamento                      |
| HistoryTable     | Renderizar registros e delegar ações de download/exclusão à página                           |
| ConfirmDialog    | Pedir confirmação antes de excluir dados pela interface                                      |
| Notice           | Exibir orientação ou erro dentro de um fluxo                                                 |
| Toast            | Exibir avisos globais temporários                                                            |

## Como escolher onde colocar uma mudança

- **Apresentação reutilizada:** componente.
- **Sequência da operação e estado do formulário:** página.
- **Pedido HTTP:** service, nunca chamada direta na página.
- **Informação compartilhada sobre conexão/avisos:** AppContext.
- **Transformação pequena e pura de dados:** utils.

Não extraia um componente apenas porque há uma `div`. Extraia quando existir uma responsabilidade clara, reutilização ou um bloco visual que dificultaria a leitura da página.

## Exemplo de uso

```jsx
<Button icon="convert" loading={busy} onClick={convert}>
  Converter arquivo
</Button>

<Button to="/historico" variant="secondary" iconRight="arrowUpRight">
  Ver histórico
</Button>
```

Os nomes públicos dos componentes e funções seguem inglês; textos mostrados ao usuário e documentação ficam em português. Handlers não precisam conhecer detalhes do Express ou do banco.
