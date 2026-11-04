# Interface centrada na mídia

A ferramenta ocupa a tela: menu no canto superior direito, mídia ao centro e barra compacta de link na parte inferior. O conversor usa o mesmo palco de mídia. O fundo combina azul-escuro e degradês verdes com grão de filme estático.

## Organização

- Layout cria o fundo compartilhado e omite o rodapé nas ferramentas. Header usa details/summary com links, fechamento por Escape e clique externo.
- LandingPage mantém DownloadPage e ConvertPage montados ao alternar entre /, /downloads e /conversor. O arquivo selecionado e o formato permanecem; os players ocultos são pausados. Sair para o histórico ou recarregar encerra esse estado temporário.
- MediaStage exibe imagem, vídeo ou áudio reais, nome, tamanho, controles e status. Arquivos sem codec suportado pelo navegador exibem uma mensagem e continuam disponíveis para processamento.
- Workspace.module.css concentra os controles compactos, a barra inferior e os espaçamentos comuns. Os formatos são apresentados em um select nativo.
- Conversão local usa URL.createObjectURL para prévia e revoga a URL ao trocar ou remover o arquivo. Vídeo/áudio usam preload=metadata e não iniciam automaticamente.
- O grão é uma pequena textura SVG repetida. Não há loop JavaScript, animação de fundo, canvas ou filtros de blur em tela cheia. Transições curtas respeitam prefers-reduced-motion. Não foi feito benchmark de GPU/FPS.

## Prévia de downloads

POST /api/downloads/inspect retorna previewUrl. GET /api/downloads/:id/preview serve somente o arquivo previamente recebido e identificado, com MIME conhecido, Range e Cache-Control: no-store. A rota não recebe URL remota ou caminho de disco. IDs inexistentes/expirados retornam 410; arquivo em processamento retorna 409. A prévia expira em até 15 minutos e é consumida ao preparar o download. Após o processamento, o palco usa downloadUrl do resultado.

A resolução exibida é a da origem, não uma promessa de qualidade de saída. O backend ainda não aceita qualidade/bitrate selecionáveis; por isso não existem opções fictícias. Downloads continuam limitados a links diretos de mídia. Imagem, áudio e vídeo são processados no servidor; FFmpeg é necessário para áudio/vídeo.

## Verificação

- Build: npm run build na pasta frontend.
- Teste independente do banco: node --test backend/tests/source-preview.test.js, a partir da raiz. Cobre bytes de imagem, Content-Type, Range, cache, ID inválido, caminho arbitrário e expiração.
- Navegador: seleção de imagem, prévia, alteração de formato e preservação do arquivo/formato ao alternar ferramentas.
- Ainda validar com PostgreSQL local: conversão completa, salvar resultado, histórico e links remotos reais. A suíte antiga de integração usa o banco configurado; não foi executada nesta revisão. Layout mobile possui regras responsivas, mas não foi validado em viewport mobile nesta sessão.
