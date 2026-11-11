import styles from './AuthCard.module.css';

export function AuthCard({ title, description, children, footer }) {
  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.card}>
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </section>
    </div>
  );
}
