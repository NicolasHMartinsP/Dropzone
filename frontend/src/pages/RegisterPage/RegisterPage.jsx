import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard/AuthCard.jsx';
import { FormField } from '../../components/FormField/FormField.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await register(form);
      navigate('/perfil');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      description="Leva menos de um minuto."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={submit}>
        <FormField
          label="Nome"
          name="name"
          autoComplete="name"
          required
          maxLength={20}
          value={form.name}
          onChange={updateField}
        />
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
          label="Senha (mínimo 8 caracteres)"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={form.password}
          onChange={updateField}
        />
        {error && <Notice error>{error}</Notice>}
        <Button type="submit" loading={sending}>
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
}
