import { useState } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function SignIn({ onSignIn, onSwitchToSignUp, onSwitchToForgotPassword }) {
  const [isStudent, setIsStudent] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: '', password: '' });

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSignIn({ ...formData, userType: isStudent ? 'student' : 'security' }); }
    finally { setLoading(false); }
  };

  const change = (field) => (e) => {
    setFormData(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const S = {
    wrap: { minHeight:'100dvh', width:'100%', backgroundColor:'var(--color-bg-primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(16px,5vw,32px)', overflowY:'auto' },
    grad: { position:'fixed', inset:0, background:'linear-gradient(135deg,rgba(251,191,36,0.08) 0%,transparent 50%,rgba(74,222,128,0.08) 100%)', pointerEvents:'none' },
    card: { position:'relative', zIndex:10, width:'100%', maxWidth:'440px' },
    label: { display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-secondary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.8px' },
    inputWrap: { position:'relative' },
    input: { width:'100%', height:'52px', backgroundColor:'var(--color-bg-secondary)', border:'1.5px solid var(--color-border)', borderRadius:'14px', padding:'0 16px 0 48px', color:'var(--color-text-primary)', fontSize:'16px', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
    inputErr: { borderColor:'#ef4444' },
    icon: { position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', width:'18px', height:'18px', color:'var(--color-text-muted)', pointerEvents:'none' },
    errMsg: { color:'#ef4444', fontSize:'11px', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' },
    btn: (active) => ({ width:'100%', height:'52px', borderRadius:'14px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor: active ? 'pointer' : 'not-allowed', color:'var(--color-bg-primary)', backgroundColor: active ? (isStudent ? 'var(--color-primary)' : 'var(--color-secondary)') : 'var(--color-text-muted)', transition:'all 0.2s', boxShadow: active ? '0 4px 20px rgba(251,191,36,0.25)' : 'none' }),
  };

  const focusStyle = (err) => (e) => { e.target.style.borderColor = err ? '#ef4444' : 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.12)'; };
  const blurStyle = (err) => (e) => { e.target.style.borderColor = err ? '#ef4444' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={S.wrap}>
      <div style={S.grad} />
      {/* Logo */}
      <div style={{ ...S.card, textAlign:'center', marginBottom:'32px' }}>
        <div style={{ width:'80px', height:'80px', margin:'0 auto 16px', backgroundColor:'var(--color-bg-secondary)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--color-border)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <img src="/knust-logo.png" alt="KNUST Logo" style={{ width:'56px', height:'56px', objectFit:'contain' }} />
        </div>
        <h1 style={{ fontSize:'26px', fontWeight:'800', color:'var(--color-text-primary)', marginBottom:'4px', letterSpacing:'-0.5px' }}>KNUST SafeTrack</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'14px' }}>Campus Safety & Security Platform</p>
      </div>

      {/* Toggle */}
      <div style={{ ...S.card, marginBottom:'24px' }}>
        <div style={{ backgroundColor:'var(--color-bg-secondary)', borderRadius:'14px', padding:'5px', display:'flex', gap:'4px', border:'1px solid var(--color-border)' }}>
          {[{label:'Student', Icon:User, val:true}, {label:'Security', Icon:Shield, val:false}].map(({label, Icon, val}) => (
            <button key={label} type="button" onClick={() => setIsStudent(val)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontWeight:'600', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', backgroundColor: isStudent===val ? (val?'var(--color-primary)':'var(--color-secondary)') : 'transparent', color: isStudent===val ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)', transition:'all 0.2s' }}>
              <Icon style={{ width:'16px', height:'16px' }} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={S.card}>
        {/* Email */}
        <div style={{ marginBottom:'16px' }}>
          <label style={S.label}>{isStudent ? 'Student Email' : 'Staff Email'}</label>
          <div style={S.inputWrap}>
            <Mail style={S.icon} />
            <input type="email" inputMode="email" autoComplete="email"
              placeholder={isStudent ? 'name@st.knust.edu.gh' : 'name@security.knust.edu.gh'}
              value={formData.email} onChange={change('email')}
              style={{ ...S.input, ...(errors.email ? S.inputErr : {}) }}
              onFocus={focusStyle(errors.email)} onBlur={blurStyle(errors.email)} />
          </div>
          {errors.email && <p style={S.errMsg}><AlertCircle style={{width:'11px',height:'11px'}} />{errors.email}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom:'12px' }}>
          <label style={S.label}>Password</label>
          <div style={S.inputWrap}>
            <Lock style={S.icon} />
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password"
              placeholder="Enter your password" value={formData.password} onChange={change('password')}
              style={{ ...S.input, paddingRight:'52px', ...(errors.password ? S.inputErr : {}) }}
              onFocus={focusStyle(errors.password)} onBlur={blurStyle(errors.password)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', padding:'4px' }}>
              {showPassword ? <EyeOff style={{width:'18px',height:'18px'}} /> : <Eye style={{width:'18px',height:'18px'}} />}
            </button>
          </div>
          {errors.password && <p style={S.errMsg}><AlertCircle style={{width:'11px',height:'11px'}} />{errors.password}</p>}
        </div>

        <div style={{ textAlign:'right', marginBottom:'24px' }}>
          <button type="button" onClick={onSwitchToForgotPassword} style={{ background:'none', border:'none', color:'var(--color-primary)', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Forgot password?</button>
        </div>

        <button type="submit" disabled={loading} style={S.btn(!loading)}>
          {loading
            ? <><span style={{ width:'18px', height:'18px', border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'rgba(0,0,0,0.7)', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />Signing in...</>
            : <><span>Sign In</span><ArrowRight style={{width:'18px',height:'18px'}} /></>}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </form>

      <p style={{ ...S.card, color:'var(--color-text-secondary)', fontSize:'14px', marginTop:'20px', textAlign:'center' }}>
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchToSignUp} style={{ background:'none', border:'none', color:'var(--color-primary)', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>Request Access</button>
      </p>

      {/* Demo credentials — clickable to autofill */}
      <div style={{ ...S.card, marginTop:'20px', padding:'16px', backgroundColor:'var(--color-bg-secondary)', borderRadius:'16px', border:'1px solid var(--color-border)' }}>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'11px', textAlign:'center', marginBottom:'12px', fontWeight:'700', letterSpacing:'0.8px', textTransform:'uppercase' }}>🔑 Demo Credentials — tap to fill</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {[
            { label:'🎓 Student', val:'kofi.mensah@st.knust.edu.gh', color:'var(--color-primary)', action: () => { setIsStudent(true); setFormData(p => ({...p, email:'kofi.mensah@st.knust.edu.gh'})); } },
            { label:'🛡️ Security', val:'admin@security.knust.edu.gh', color:'var(--color-secondary)', action: () => { setIsStudent(false); setFormData(p => ({...p, email:'admin@security.knust.edu.gh'})); } },
            { label:'🔑 Password', val:'password123', color:'var(--color-text-primary)', action: () => setFormData(p => ({...p, password:'password123'})) },
          ].map(({label, val, color, action}) => (
            <button key={label} type="button" onClick={action} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'var(--color-bg-primary)', borderRadius:'10px', padding:'10px 12px', border:'1px solid transparent', cursor:'pointer', transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--color-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
              <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{label}</span>
              <span style={{ fontSize:'11px', color, fontFamily:'monospace', fontWeight:'600' }}>{val}</span>
            </button>
          ))}
        </div>
      </div>
      <p style={{ color:'var(--color-text-muted)', fontSize:'11px', marginTop:'16px', textAlign:'center' }}>By signing in you agree to our Terms & Privacy Policy</p>
    </div>
  );
}
