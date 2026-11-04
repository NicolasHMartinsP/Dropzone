# Interface minimalista

A página inicial oferece as ferramentas diretamente. A paleta cyberpunk foi preservada: verde neon #1EFD4A para ações, verde escuro #0A3D14, azul-marinho #041447, azul #3E43B8 e lilás #8488F6. Tons de apoio garantem leitura no fundo escuro.

## Organização para manutenção

- LandingPage compõe o título, a navegação e a ferramenta ativa. As URLs / e /downloads abrem download; /conversor abre conversão.
- DownloadPage e ConvertPage preservam os serviços, validações, resultados e estados de processamento existentes. Formatos aparecem depois da análise ou seleção de arquivo.
- Header contém marca e histórico. Footer mantém a documentação técnica como acesso secundário.
- HistoryPage mantém busca, filtros, paginação, download e confirmação de exclusão; os indicadores e a requisição de estatísticas foram removidos.
- global.css concentra a paleta. CSS Modules mantêm os estilos de cada componente isolados; as transições respeitam prefers-reduced-motion.

HeroPreview, ToolCard e SupportedFormats foram removidos após verificar a ausência de consumidores. O Git preserva suas versões anteriores.

## Limites preservados

Downloads continuam aceitando links diretos de mídia. Esta alteração visual não implementa extração de links de compartilhamento. Conversões dependem das capacidades informadas pela API; áudio e vídeo precisam de FFmpeg. Os arquivos são processados no servidor, não offline no navegador.

## Validação

Build: npm run build na pasta frontend. Conferir /, /downloads, /conversor, /historico e uma URL inexistente. Com o backend local ativo, testar análise de link, conversão de imagem, download do resultado e histórico. Conferir também largura de 360px, foco por teclado e mensagens de erro. Testes de processamento reais não foram executados nesta revisão visual.
