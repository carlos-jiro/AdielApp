import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AuthLayout from '../../components/AuthLayout';

const ResetPassword = () => {
  const [checkingSession, setCheckingSession] = useState(true);
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setCanUpdatePassword(Boolean(session));
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) setCanUpdatePassword(true);
      if (event === 'SIGNED_OUT') setCanUpdatePassword(false);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Tu contraseña se actualizó correctamente.' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Recuperación segura</p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Crea una nueva contraseña</h2>
        <p className="mt-2 mb-7 text-sm leading-relaxed text-cyan-50/60">
          {checkingSession
            ? 'Estamos verificando tu enlace…'
            : canUpdatePassword
              ? 'Elige una contraseña nueva para volver a tu espacio de música.'
              : 'Este enlace no es válido o ya venció. Solicita uno nuevo para continuar.'}
        </p>

        {checkingSession ? (
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="status" aria-label="Verificando enlace">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300" />
          </div>
        ) : canUpdatePassword ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-cyan-50/75">Nueva contraseña</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="new-password" type="password" autoComplete="new-password" minLength={6} required className="auth-input" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-cyan-50/75">Confirma la contraseña</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required className="auth-input" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Escríbela otra vez" />
              </div>
            </div>
            {message && <p role={message.type === 'error' ? 'alert' : 'status'} className={`auth-notice ${message.type === 'error' ? 'auth-notice-error' : 'auth-notice-success'}`}>{message.text}</p>}
            {message?.type === 'success' ? (
              <button type="button" onClick={() => navigate('/', { replace: true })} className="auth-submit">Continuar a Adiel</button>
            ) : (
              <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Actualizando…' : 'Guardar contraseña'}</button>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <Link to="/login?mode=recovery" className="auth-submit inline-flex items-center justify-center">Solicitar otro enlace</Link>
            <Link to="/login" className="block text-center text-sm font-semibold text-cyan-100/70 transition hover:text-white">Volver al inicio de sesión</Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
