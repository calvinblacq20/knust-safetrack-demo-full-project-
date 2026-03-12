import { useState } from 'react';
import { Shield, User, Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword({ onBackToSignIn }) {
  const [isStudent, setIsStudent] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate API
    setLoading(false);
    setSubmitted(true);
  };

  const S = {
    wrap: { minHeight:'100dvh', width:'100%', backgroundColor:'var(--color-bg-primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(16px,5vw,32px)', overflowY:'auto' },
    grad: { position:'fixed', inset:0, background:'linear-gradient(135deg,rgba(251,191,36,0.08),transparent,rgba(74,222,128,0.08))', pointerEvents:'none' },
    card: { position:'relative', zIndex:10, width:'100%', maxWidth:'440px' },
    input: { width:'100%', height:'52px', backgroundColor:'var(--color-bg-secondary)', border:'1.5px solid var(--color-border)', borderRadius:'14px', padding:'0 16px 0 48px', color:'var(--color-text-primary)', fontSize:'16px', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  };

  if (submitted) return (
    <div style={S.wrap}>
      <div style={S.grad} />
      <div style={{ ...S.card, textAlign:'center' }}>
        <div style={{ width:'88px', height:'88px', margin:'0 auto 24px', backgroundColor:'rgba(34,197,94,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle style={{ width:'44px', height:'44px', color:'var(--color-secondary)' }} />
        </div>
        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--color-text-primary)', marginBottom:'12px' }}>Check Your Email</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'14px', lineHeight:'1.7', marginBottom:'8px' }}>We sent a password reset link to</p>
        <p style={{ color:'var(--color-primary)', fontSize:'15px', fontWeight:'700', marginBottom:'8px', wordBreak:'break-all' }}>{email}</p>
        <p style={{ color:'var(--color-text-muted)', fontSize:'13px', marginBottom:'32px', lineHeight:'1.6' }}>Link expires in 15 minutes. Check spam if you don&apos;t see it.</p>
        <button type="button" onClick={onBackToSignIn} style={{ width:'100%', height:'52px', borderRadius:'14px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', color:'var(--color-bg-primary)', backgroundColor:'var(--color-primary)', boxShadow:'0 4px 20px rgba(251,191,36,0.25)' }}>
          <ArrowLeft style={{width:'18px',height:'18px'}} />Back to Sign In
        </button>
        <button type="button" onClick={() => setSubmitted(false)} style={{ background:'none', border:'none', color:'var(--color-text-secondary)', fontSize:'14px', cursor:'pointer', marginTop:'16px' }}>
          Didn&apos;t receive it? <span style={{ color:'var(--color-primary)', fontWeight:'600' }}>Resend</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.grad} />
      {/* Back */}
      <div style={{ ...S.card, marginBottom:'20px' }}>
        <button type="button" onClick={onBackToSignIn} style={{ background:'none', border:'none', color:'var(--color-text-secondary)', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', padding:'8px 0', fontWeight:'500' }}>
          <ArrowLeft style={{width:'18px',height:'18px'}} />Back to Sign In
        </button>
      </div>

      {/* Logo */}
      <div style={{ ...S.card, textAlign:'center', marginBottom:'32px' }}>
        <div style={{ width:'80px', height:'80px', margin:'0 auto 16px', backgroundColor:'var(--color-bg-secondary)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--color-border)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <img src="/knust-logo.png" alt="KNUST" style={{ width:'56px', height:'56px', objectFit:'contain' }} />
        </div>
        <h1 style={{ fontSize:'26px', fontWeight:'800', color:'var(--color-text-primary)', marginBottom:'4px' }}>Reset Password</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'14px' }}>Enter your email to receive a reset link</p>
      </div>

      {/* Toggle */}
      <div style={{ ...S.card, marginBottom:'24px' }}>
        <div style={{ backgroundColor:'var(--color-bg-secondary)', borderRadius:'14px', padding:'5px', display:'flex', gap:'4px', border:'1px solid var(--color-border)' }}>
          {[{label:'Student', Icon:User, val:true},{label:'Security', Icon:Shield, val:false}].map(({label,Icon,val}) => (
            <button key={label} type="button" onClick={() => setIsStudent(val)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontWeight:'600', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', backgroundColor: isStudent===val ? (val?'var(--color-primary)':'var(--color-secondary)') : 'transparent', color: isStudent===val ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)', transition:'all 0.2s' }}>
              <Icon style={{width:'16px',height:'16px'}} />{label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={S.card}>
        <div style={{ marginBottom:'24px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-secondary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.8px' }}>
            {isStudent ? 'Student Email' : 'Staff Email'}
          </label>
          <div style={{ position:'relative' }}>
            <Mail style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', width:'18px', height:'18px', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input type="email" inputMode="email" autoComplete="email"
              placeholder={isStudent ? 'name@st.knust.edu.gh' : 'name@knust.edu.gh'}
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={{ ...S.input, ...(error ? { borderColor:'#ef4444' } : {}) }}
              onFocus={e => { e.target.style.borderColor='var(--color-primary)'; e.target.style.boxShadow='0 0 0 3px rgba(251,191,36,0.1)'; }}
              onBlur={e => { e.target.style.borderColor=error?'#ef4444':'var(--color-border)'; e.target.style.boxShadow='none'; }}
              required />
          </div>
          {error && <p style={{ color:'#ef4444', fontSize:'11px', marginTop:'4px', display:'flex', alignItems:'center', gap:'3px' }}><AlertCircle style={{width:'11px',height:'11px'}} />{error}</p>}
        </div>

        <button type="submit" disabled={loading} style={{ width:'100%', height:'52px', borderRadius:'14px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor: loading?'not-allowed':'pointer', color:'var(--color-bg-primary)', backgroundColor: loading?'var(--color-text-muted)': isStudent?'var(--color-primary)':'var(--color-secondary)', transition:'all 0.2s', boxShadow: loading?'none':'0 4px 20px rgba(251,191,36,0.25)' }}>
          {loading
            ? <><span style={{ width:'18px', height:'18px', border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'rgba(0,0,0,0.7)', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />Sending...</>
            : <><span>Send Reset Link</span><ArrowRight style={{width:'18px',height:'18px'}} /></>}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </form>

      <p style={{ ...S.card, color:'var(--color-text-muted)', fontSize:'13px', marginTop:'20px', textAlign:'center' }}>
        Remember your password?{' '}
        <button type="button" onClick={onBackToSignIn} style={{ background:'none', border:'none', color:'var(--color-primary)', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>Sign In</button>
      </p>
    </div>
  );
}
