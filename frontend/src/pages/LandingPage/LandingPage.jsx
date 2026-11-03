import { Button } from '../../components/Button/Button.jsx';
import { Icon } from '../../components/Icon/Icon.jsx';
import { HeroPreview } from '../../components/HeroPreview/HeroPreview.jsx';
import { ToolCard } from '../../components/ToolCard/ToolCard.jsx';
import styles from './LandingPage.module.css';

const tools = [
  {
    number: '01',
    icon: 'link',
    title: 'Do link para você.',
    description:
      'Cole um link direto, escolha um formato disponível e leve o arquivo com você.',
    to: '/downloads',
    label: 'Abrir downloads',
  },
  {
    number: '02',
    icon: 'convert',
    title: 'Mude o formato.',
    description:
      'Imagens, áudios e vídeos. Transforme seu arquivo para o que vem a seguir.',
    to: '/conversor',
    label: 'Abrir conversor',
    featured: true,
  },
  {
    number: '03',
    icon: 'clock',
    title: 'Tudo no seu tempo.',
    description:
      'Reencontre suas conversões e downloads. Seu próximo passo fica mais fácil.',
    to: '/historico',
    label: 'Ver histórico',
  },
];
const steps = [
  {
    title: 'Traga seu arquivo.',
    text: 'Cole um link direto ou selecione um arquivo do seu dispositivo.',
  },
  {
    title: 'Escolha o próximo formato.',
    text: 'Veja as opções compatíveis e deixe o DropZone cuidar da conversão.',
  },
  {
    title: 'Pronto para seguir.',
    text: 'Salve o resultado. Ele também fica disponível no seu histórico.',
  },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>
            <span /> SEUS ARQUIVOS, SEM COMPLICAÇÃO
          </span>
          <h1>
            Seu arquivo.
            <br />
            Novas
            <br />
            <em>possibilidades.</em>
          </h1>
          <p>
            Baixe por link, transforme formatos e encontre tudo de novo. Uma caixa de
            ferramentas para fazer suas ideias seguirem em frente.
          </p>
          <div className={styles.heroActions}>
            <Button to="/conversor" iconRight="arrowUpRight">
              Converter um arquivo
            </Button>
            <Button to="/downloads" variant="secondary" icon="link">
              Baixar por link
            </Button>
          </div>
          <div className={styles.microcopy}>
            <Icon name="check" size={13} /> Sem cadastro <span /> Arquivos de até 50 MB{' '}
            <span /> Feito para facilitar
          </div>
        </div>
        <HeroPreview />
      </section>
      <div className={styles.formatBand}>
        <div className={`container ${styles.formatBandInner}`}>
          <span>
            UM ARQUIVO.
            <br />
            <strong>VÁRIOS CAMINHOS.</strong>
          </span>
          <div>
            {['PNG', 'JPG', 'WEBP', 'AVIF', 'MP3', 'WAV', 'MP4', 'WEBM'].map((format) => (
              <span key={format}>
                {format}
                <i>↗</i>
              </span>
            ))}
          </div>
          <Icon name="convert" size={23} />
        </div>
      </div>
      <section className={`container ${styles.tools}`}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionLabel}>O QUE VAMOS FAZER HOJE?</span>
            <h2>
              Menos etapas.
              <br />
              <span>Mais possibilidades.</span>
            </h2>
          </div>
          <p>
            Do primeiro link ao último download.
            <br />
            Escolha sua ferramenta e comece.
          </p>
        </div>
        <div className={styles.toolGrid}>
          {tools.map((tool) => (
            <ToolCard key={tool.number} {...tool} />
          ))}
        </div>
      </section>
      <section className={`container ${styles.steps}`}>
        <div className={styles.stepsIntro}>
          <span className={styles.sectionLabel}>SIMPLES ASSIM</span>
          <h2>
            Três passos.
            <br />E segue o arquivo.
          </h2>
          <span className={styles.bigArrow}>
            <Icon name="arrowUpRight" size={50} />
          </span>
        </div>
        <div className={styles.stepsList}>
          {steps.map((step, index) => (
            <div className={styles.step} key={step.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <Icon name="arrowUpRight" size={16} />
            </div>
          ))}
        </div>
      </section>
      <section className={`container ${styles.faq}`}>
        <div>
          <span className={styles.sectionLabel}>ANTES DO PRIMEIRO CLIQUE</span>
          <h2>O que você precisa saber.</h2>
        </div>
        <div>
          <details>
            <summary>
              Quais links posso baixar?
              <Icon name="plus" size={17} />
            </summary>
            <p>
              Links públicos que apontem diretamente para uma imagem, um áudio ou um
              vídeo. Páginas do YouTube, Instagram e sites com login não são suportadas
              neste MVP.
            </p>
          </details>
          <details>
            <summary>
              Quais arquivos posso converter?
              <Icon name="plus" size={17} />
            </summary>
            <p>
              Imagens estáticas PNG, JPG, WebP e AVIF. Com FFmpeg instalado no servidor,
              também áudio e vídeo de até 10 minutos. PDFs, documentos Office e imagens
              animadas ficam fora desta versão.
            </p>
          </details>
          <details>
            <summary>
              Por quanto tempo o arquivo fica disponível?
              <Icon name="plus" size={17} />
            </summary>
            <p>
              Por padrão, os resultados ficam disponíveis por 24 horas. O histórico das
              operações permanece até você excluir. O sistema foi feito para uso local e
              individual, sem contas de usuário.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
