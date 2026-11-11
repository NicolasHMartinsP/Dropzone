import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard/AuthCard.jsx';
import { FormField } from '../../components/FormField/FormField.jsx';
import { Button } from '../../components/Button/Button.jsx';
import { Notice } from '../../components/Notice/Notice.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { formatDate } from '../../utils/format.js';

export function ProfilePage() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { notify } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(''); // '' | 'profile' | 'password'
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // UPDATE: nome e e-mail
  async function saveProfile(event) {
    event.preventDefault();
    setSaving('profile');
    setError('');
    try {
      await updateProfile(profile);
      notify('Dados atualizados.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving('');
    }
  }

  // UPDATE: senha (exige a atual; derruba os outros aparelhos)
  async function savePassword(event) {
    event.preventDefault();
    setSaving('password');
    setError('');
    try {
      await updateProfile(passwords);
      setPasswords({ currentPassword: '', password: '' });
      notify('Senha alterada. Outros aparelhos foram desconectados.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving('');
    }
  }

  // DELETE: excluir a conta
  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      notify('Conta excluída.');
      navigate('/');
    } catch (deleteError) {
      setError(deleteError.message);
      setConfirmingDelete(false);
      setDeleting(false);
    }
  }

  async function leave() {
    await logout();
    navigate('/');
  }

  return (
    <AuthCard
      title={`Olá, ${user.name}`}
      description={`${user.email} · conta criada em ${formatDate(user.createdAt)}`}
    >
      {error && <Notice error>{error}</Notice>}

      <form onSubmit={saveProfile}>
        <h2>Seus dados</h2>
        <FormField
          label="Nome"
          required
          maxLength={20}
          value={profile.name}
          onChange={(event) => setProfile({ ...profile, name: event.target.value })}
        />
        <FormField
          label="E-mail"
          type="email"
          required
          maxLength={70}
          value={profile.email}
          onChange={(event) => setProfile({ ...profile, email: event.target.value })}
        />
        <Button type="submit" loading={saving === 'profile'}>
          Salvar dados
        </Button>
      </form>

      <hr />

      <form onSubmit={savePassword}>
        <h2>Trocar senha</h2>
        <FormField
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          required
          value={passwords.currentPassword}
          onChange={(event) =>
            setPasswords({ ...passwords, currentPassword: event.target.value })
          }
        />
        <FormField
          label="Nova senha (mínimo 8)"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={passwords.password}
          onChange={(event) =>
            setPasswords({ ...passwords, password: event.target.value })
          }
        />
        <Button type="submit" variant="secondary" loading={saving === 'password'}>
          Trocar senha
        </Button>
      </form>

      <hr />

      <Button variant="ghost" icon="close" onClick={leave}>
        Sair
      </Button>
      <Button variant="danger" icon="trash" onClick={() => setConfirmingDelete(true)}>
        Excluir conta
      </Button>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir sua conta?"
        loading={deleting}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={confirmDelete}
      >
        Seus dados e sessões serão apagados. Esta ação não pode ser desfeita.
      </ConfirmDialog>
    </AuthCard>
  );
}
