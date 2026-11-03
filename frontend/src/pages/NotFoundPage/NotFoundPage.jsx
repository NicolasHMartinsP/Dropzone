import { Button } from '../../components/Button/Button.jsx';
import styles from './NotFoundPage.module.css';
export function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <span>404 / FORA DA ZONA</span>
      <h1>Esse caminho não tem arquivo.</h1>
      <p>Mas tem muita coisa para transformar por aqui.</p>
      <Button to="/" iconRight="arrowUpRight">
        Voltar para o início
      </Button>
    </div>
  );
}
