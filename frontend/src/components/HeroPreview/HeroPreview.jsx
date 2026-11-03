import { Icon } from '../Icon/Icon.jsx';
import styles from './HeroPreview.module.css';

export function HeroPreview() {
  return (
    <div
      className={styles.scene}
      aria-label="Ilustração: um arquivo PNG transformado em WebP"
    >
      <div className={styles.orbit} />
      <span className={styles.coordinate}>FORMATO NOVO. MESMA IDEIA.</span>
      <div className={styles.source}>
        <span className={styles.sourceIcon}>
          <Icon name="fileImage" size={27} />
        </span>
        <div>
          <strong>minha-foto.png</strong>
          <span>Pronta para transformar</span>
        </div>
        <span className={styles.sourceTag}>PNG</span>
      </div>
      <div className={styles.connector}>
        <span />
        <Icon name="convert" size={25} />
        <span />
      </div>
      <div className={styles.output}>
        <div className={styles.windowBar}>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>dropzone / conversor</span>
          <Icon name="arrowUpRight" size={13} />
        </div>
        <div className={styles.artwork}>
          <div className={styles.sun} />
          <div className={styles.landscapeBack} />
          <div className={styles.landscapeFront} />
          <span className={styles.artworkLabel}>
            CREATE.
            <br />
            CONVERT.
            <br />
            <em>REPEAT.</em>
          </span>
          <span className={styles.artworkIndex}>DZ—001</span>
        </div>
        <div className={styles.outputFooter}>
          <div>
            <span>UM NOVO FORMATO</span>
            <strong>minha-foto.webp</strong>
          </div>
          <span className={styles.fileTag}>
            WEBP <Icon name="check" size={12} />
          </span>
        </div>
      </div>
      <span className={styles.sticker}>
        <Icon name="sparkles" size={17} />
        Novas possibilidades.
      </span>
      <span className={styles.previewLabel}>PRÉVIA DO FLUXO · PNG → WEBP</span>
    </div>
  );
}
