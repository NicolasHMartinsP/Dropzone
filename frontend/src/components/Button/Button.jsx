import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Button.module.css';

export function Button({
  children,
  to,
  href,
  variant = 'primary',
  icon,
  iconRight,
  loading,
  className = '',
  disabled,
  ...props
}) {
  const Component = to ? Link : href ? 'a' : 'button';
  return (
    <Component
      {...(to
        ? { to }
        : href
          ? { href }
          : { type: 'button', disabled: disabled || loading })}
      {...props}
      className={`${styles.button} ${styles[variant]} ${className}`}
      aria-busy={loading || undefined}
    >
      {(loading || icon) && (
        <Icon
          name={loading ? 'loader' : icon}
          size={18}
          className={loading ? 'spin' : ''}
        />
      )}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </Component>
  );
}
