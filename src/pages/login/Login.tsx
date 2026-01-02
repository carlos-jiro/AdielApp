import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      // Lógica de Registro
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('¡Registro exitoso! Ya puedes iniciar sesión.');
    } else {
      // Lógica de Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-fixed" 
         style={{ background: 'linear-gradient(135deg, #e0f2f1 0%, #e1bee7 50%, #b2ebf2 100%)' }}>
      <div className="glass max-w-md w-full p-10 rounded-3xl space-y-6 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">CoroPro</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isRegistering ? 'Crea tu cuenta de integrante' : 'Bienvenido de nuevo'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 ml-1">CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/40 p-3 rounded-xl border border-white/20 outline-none focus:ring-2 focus:ring-[#2dd4bf] transition-all"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 ml-1">CONTRASEÑA</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/40 p-3 rounded-xl border border-white/20 outline-none focus:ring-2 focus:ring-[#2dd4bf] transition-all"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-[#2dd4bf] text-white font-bold py-4 rounded-2xl hover:bg-[#26bba8] transition-all shadow-lg shadow-[#2dd4bf]/20 active:scale-95">
            {loading ? 'Procesando...' : (isRegistering ? 'Registrarme' : 'Entrar')}
          </button>
        </form>

        <div className="text-center border-t border-white/20 pt-6">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-bold text-slate-600 hover:text-[#2dd4bf] transition-colors"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;