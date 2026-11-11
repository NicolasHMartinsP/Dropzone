import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard/AuthCard.jsx';
import { FormField } from '../../components/FormField/FormField.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await login(form);
      navigate('/perfil');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthCard
      title="Entrar"
      description="Acesse sua conta para salvar favoritos e ver seu histórico."
      footer={
        <>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </>
      }
    >
      <form onSubmit={submit}>
        <FormField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={70}
          value={form.email}
          onChange={updateField}
        />
        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={updateField}
        />
        {error && <Notice error>{error}</Notice>}
        <Button type="submit" loading={sending}>
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
}
