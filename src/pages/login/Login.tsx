import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AuthLayout from '../../components/AuthLayout';

type LoginMode = 'login' | 'register' | 'recover';
type Notice = { type: 'success' | 'error'; text: string } | null;

const Login = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LoginMode>(() => searchParams.get('mode') === 'recovery' ? 'recover' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      if (mode === 'recover') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;

        // Use the same response for known and unknown addresses to avoid exposing account membership.
        setNotice({
          type: 'success',
          text: 'Si el correo está registrado, recibirás un enlace para crear una nueva contraseña. Revisa también tu carpeta de spam.',
        });
        return;
      }

      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setNotice({
          type: 'success',
          text: 'Tu registro se procesó. Si se requiere confirmar el correo, te enviaremos un mensaje con los siguientes pasos.',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error. Intenta de nuevo.';
      setNotice({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setNotice(null);
  };

  const isRecovering = mode === 'recover';

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="mb-7">
          {isRecovering ? (
            <button
              type="button"
              onClick={() => changeMode('login')}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100/70 transition hover:text-white"
            >
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </button>
          ) : null}
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            {mode === 'register' ? 'Únete a la comunidad' : isRecovering ? 'Recupera tu acceso' : 'Qué alegría tenerte aquí'}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {mode === 'register' ? 'Crea tu cuenta' : isRecovering ? '¿Olvidaste tu contraseña?' : 'Bienvenido de nuevo'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-cyan-50/60">
            {mode === 'register'
              ? 'Crea tu acceso al espacio musical de Adiel.'
              : isRecovering
                ? 'Escribe el correo de tu cuenta y te enviaremos un enlace seguro para elegir una nueva contraseña.'
                : 'Inicia sesión para continuar compartiendo música y fe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-cyan-50/75">Correo electrónico</label>
            <div className="auth-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className="auth-input"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          {!isRecovering && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-cyan-50/75">Contraseña</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => changeMode('recover')} className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-100">
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  minLength={mode === 'register' ? 6 : undefined}
                  required
                  className="auth-input"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
          )}

          {notice && (
            <p role={notice.type === 'error' ? 'alert' : 'status'} className={`auth-notice ${notice.type === 'error' ? 'auth-notice-error' : 'auth-notice-success'}`}>
              {notice.text}
            </p>
          )}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Un momento…' : mode === 'register' ? 'Crear cuenta' : isRecovering ? 'Enviar enlace' : 'Iniciar sesión'}
          </button>
        </form>

        {!isRecovering ? (
          <div className="mt-6 border-t border-cyan-100/10 pt-5 text-center">
            <p className="text-sm text-cyan-50/55">
              {mode === 'register' ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() => changeMode(mode === 'register' ? 'login' : 'register')}
                className="font-bold text-cyan-300 transition hover:text-white"
              >
                {mode === 'register' ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default Login;
