import type { ReactNode } from 'react';
import { Music2 } from 'lucide-react';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <main className="auth-page">
    <div className="auth-layout">
      <section className="auth-visual" aria-label="Música y comunidad">
        <img
          src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=82"
          alt="Cantante interpretando una canción en el escenario"
          fetchPriority="high"
        />
        <div className="auth-visual-shade" />
        <div className="auth-visual-content">
          <div className="auth-brand">
            <span className="auth-brand-icon"><Music2 size={22} /></span>
            <span>ADIEL</span>
          </div>
          <div className="auth-visual-message">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Una sola voz, una misma fe</p>
            <h1>La música nos une.<br />La fe nos inspira.</h1>
            <p>Tu comunidad, tus cantos y tus ensayos en un solo lugar.</p>
          </div>
          <a className="auth-photo-credit" href="https://unsplash.com/" target="_blank" rel="noreferrer">Fotografía de Unsplash</a>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">{children}</div>
        <p className="auth-footer">Adiel · Comunidad de cantantes cristianos</p>
      </section>
    </div>
  </main>
);

export default AuthLayout;
