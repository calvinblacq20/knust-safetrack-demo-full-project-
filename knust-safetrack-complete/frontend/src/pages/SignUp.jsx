import { useState } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, Phone, IdCard, Home, MapPin, Camera, X, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import useToast from '../hooks/useToast.js';

const HOSTELS = ['Unity Hall','University Hall (Katanga)','Independence Hall (Conti)','Queens Hall','Republic Hall (Repub)','Africa Hall','Hall 7 (Brunei)','Gaza Hostel','Ayeduase Hostel','Private Hostel (Off-campus)'];
const GENDERS = ['Male','Female','Prefer not to say'];
const PROGRAMS = ['BSc Computer Science','BSc Electrical Engineering','BSc Civil Engineering','BSc Mechanical Engineering','BSc Architecture','BA Communication Studies','BSc Business Administration','BSc Nursing','BSc Pharmacy','Other'];

export default function SignUp({ onSignUp, onSwitchToSignIn }) {
  const toast = useToast();
  const [isStudent, setIsStudent] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName:'', email:'', phone:'', studentId:'', password:'', confirmPassword:'', hostel:'', town:'', landmark:'', gender:'', program:''
  });

  const change = (field) => (e) => {
    const val = e.target.value;
    setFormData(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  // Only allow letters + spaces for name
  const onNameKey = (e) => { if (!/[a-zA-Z\s\-']/.test(e.key) && e.key.length === 1) e.preventDefault(); };
  // Only allow digits + spaces + + for phone
  const onPhoneKey = (e) => { if (!/[\d\s\+\-\(\)]/.test(e.key) && e.key.length === 1) e.preventDefault(); };
  // Only allow alphanumeric for student ID
  const onIdKey = (e) => { if (!/[\w\-]/.test(e.key) && e.key.length === 1) e.preventDefault(); };

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    else if (!/^[a-zA-Z\s\-']+$/.test(formData.fullName)) e.fullName = 'Name must contain letters only';
    if (!formData.studentId.trim()) e.studentId = isStudent ? 'Student ID is required' : 'Staff ID is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) e.phone = 'Enter a valid phone number';
    if (!formData.gender) e.gender = 'Please select gender';
    if (isStudent && !formData.hostel) e.hostel = 'Please select your hostel';
    if (isStudent && !formData.town.trim()) e.town = 'Town is required';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    localStorage.setItem('safetrack_profile', JSON.stringify({ fullName:formData.fullName, hostel:formData.hostel, town:formData.town, landmark:formData.landmark, gender:formData.gender, studentId:formData.studentId }));
    setShowPhotoPrompt(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const finishSignUp = () => {
    if (onSignUp) onSignUp({ ...formData, userType: isStudent ? 'student' : 'security' });
    setShowPhotoPrompt(false);
  };

  const S = {
    label: { display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-secondary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.8px' },
    input: { width:'100%', height:'52px', backgroundColor:'var(--color-bg-secondary)', border:'1.5px solid var(--color-border)', borderRadius:'14px', padding:'0 16px 0 48px', color:'var(--color-text-primary)', fontSize:'16px', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
    inputErr: { borderColor:'#ef4444' },
    icon: { position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', width:'18px', height:'18px', color:'var(--color-text-muted)', pointerEvents:'none' },
    err: { color:'#ef4444', fontSize:'11px', marginTop:'4px', display:'flex', alignItems:'center', gap:'3px' },
    field: { marginBottom:'14px' },
  };

  const focusIn = (err) => (e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.1)'; };
  const focusOut = (err) => (e) => { e.target.style.borderColor = err ? '#ef4444' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; };

  const Field = ({ label, error, children }) => (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <div style={{ position:'relative' }}>{children}</div>
      {error && <p style={S.err}><AlertCircle style={{width:'11px',height:'11px'}} />{error}</p>}
    </div>
  );

  // Photo prompt screen
  if (showPhotoPrompt) return (
    <div style={{ minHeight:'100dvh', width:'100%', backgroundColor:'var(--color-bg-primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
      <div style={{ position:'fixed', inset:0, background:'linear-gradient(135deg,rgba(251,191,36,0.08),transparent,rgba(74,222,128,0.08))', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:10, textAlign:'center', width:'100%', maxWidth:'400px' }}>
        <div style={{ width:'120px', height:'120px', margin:'0 auto 24px', borderRadius:'50%', backgroundColor:'var(--color-bg-secondary)', border:'3px dashed var(--color-border)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
          {photoPreview
            ? <><img src={photoPreview} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} /><button type="button" onClick={() => setPhotoPreview(null)} style={{ position:'absolute', top:'4px', right:'4px', width:'24px', height:'24px', borderRadius:'50%', backgroundColor:'rgba(0,0,0,0.7)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X style={{width:'14px',height:'14px',color:'white'}} /></button></>
            : <Camera style={{width:'36px',height:'36px',color:'var(--color-text-muted)'}} />}
        </div>
        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'var(--color-text-primary)', marginBottom:'8px' }}>Verify Your Identity</h2>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'14px', marginBottom:'28px', lineHeight:'1.6' }}>Upload a clear photo to verify your account and help keep campus safe.</p>
        <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', height:'52px', borderRadius:'14px', fontWeight:'600', border:'1.5px solid var(--color-primary)', cursor:'pointer', color:'var(--color-primary)', backgroundColor:'transparent', marginBottom:'12px', fontSize:'15px' }}>
          <Camera style={{width:'20px',height:'20px'}} />
          {photoPreview ? 'Change Photo' : 'Upload Photo'}
          <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} style={{ display:'none' }} />
        </label>
        <button type="button" onClick={finishSignUp} style={{ width:'100%', height:'52px', borderRadius:'14px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', color:'var(--color-bg-primary)', backgroundColor: photoPreview ? 'var(--color-secondary)' : 'var(--color-bg-tertiary)', marginBottom:'12px', fontSize:'15px' }}>
          {photoPreview ? <><CheckCircle2 style={{width:'20px',height:'20px'}} />Submit & Continue</> : <><ArrowRight style={{width:'20px',height:'20px'}} />Continue without Photo</>}
        </button>
        <button type="button" onClick={finishSignUp} style={{ background:'none', border:'none', color:'var(--color-text-muted)', fontSize:'13px', cursor:'pointer' }}>I&apos;ll do this later</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100dvh', width:'100%', backgroundColor:'var(--color-bg-primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'48px clamp(16px,5vw,32px) 32px', overflowY:'auto' }}>
      <div style={{ position:'fixed', inset:0, background:'linear-gradient(135deg,rgba(251,191,36,0.08),transparent,rgba(74,222,128,0.08))', pointerEvents:'none' }} />

      {/* Header */}
      <div style={{ position:'relative', zIndex:10, textAlign:'center', marginBottom:'24px' }}>
        <div style={{ width:'64px', height:'64px', margin:'0 auto 12px', backgroundColor:'var(--color-bg-secondary)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--color-border)', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          <img src="/knust-logo.png" alt="KNUST Logo" style={{ width:'44px', height:'44px', objectFit:'contain' }} />
        </div>
        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--color-text-primary)', marginBottom:'4px' }}>Request Access</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'13px' }}>Join KNUST SafeTrack</p>
      </div>

      {/* Toggle */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'480px', marginBottom:'24px' }}>
        <div style={{ backgroundColor:'var(--color-bg-secondary)', borderRadius:'14px', padding:'5px', display:'flex', gap:'4px', border:'1px solid var(--color-border)' }}>
          {[{label:'Student', Icon:User, val:true},{label:'Security', Icon:Shield, val:false}].map(({label,Icon,val}) => (
            <button key={label} type="button" onClick={() => setIsStudent(val)} style={{ flex:1, padding:'12px', borderRadius:'10px', fontWeight:'600', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', backgroundColor: isStudent===val ? (val?'var(--color-primary)':'var(--color-secondary)') : 'transparent', color: isStudent===val ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)', transition:'all 0.2s' }}>
              <Icon style={{width:'16px',height:'16px'}} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'480px' }}>

        {/* Section: Personal */}
        <p style={{ fontSize:'11px', fontWeight:'700', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' }}>Personal Information</p>

        <Field label="Full Name" error={errors.fullName}>
          <User style={S.icon} />
          <input type="text" inputMode="text" autoComplete="name" placeholder="e.g. Kofi Mensah"
            value={formData.fullName} onChange={change('fullName')} onKeyDown={onNameKey}
            style={{...S.input,...(errors.fullName?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.fullName)} required />
        </Field>

        <Field label={isStudent ? 'Student ID' : 'Staff ID'} error={errors.studentId}>
          <IdCard style={S.icon} />
          <input type="text" inputMode="text" placeholder={isStudent ? 'e.g. 20012345' : 'e.g. SEC-001'}
            value={formData.studentId} onChange={change('studentId')} onKeyDown={onIdKey}
            style={{...S.input,...(errors.studentId?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.studentId)} required />
        </Field>

        <Field label={isStudent ? 'Student Email' : 'Work Email'} error={errors.email}>
          <Mail style={S.icon} />
          <input type="email" inputMode="email" autoComplete="email"
            placeholder={isStudent ? 'name@st.knust.edu.gh' : 'name@knust.edu.gh'}
            value={formData.email} onChange={change('email')}
            style={{...S.input,...(errors.email?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.email)} required />
        </Field>

        <Field label="Phone Number" error={errors.phone}>
          <Phone style={S.icon} />
          <input type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 024 123 4567"
            value={formData.phone} onChange={change('phone')} onKeyDown={onPhoneKey}
            maxLength={15} style={{...S.input,...(errors.phone?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.phone)} required />
        </Field>

        {/* Gender */}
        <Field label="Gender" error={errors.gender}>
          <User style={S.icon} />
          <select value={formData.gender} onChange={change('gender')} required
            style={{...S.input, paddingRight:'48px', appearance:'none', WebkitAppearance:'none', cursor:'pointer', ...(errors.gender?S.inputErr:{}), color: formData.gender?'var(--color-text-primary)':'var(--color-text-muted)' }}
            onFocus={focusIn()} onBlur={focusOut(errors.gender)}>
            <option value="" disabled>Select gender</option>
            {GENDERS.map(g => <option key={g} value={g} style={{backgroundColor:'var(--color-bg-secondary)',color:'var(--color-text-primary)'}}>{g}</option>)}
          </select>
          <ChevronDown style={{...S.icon, left:'auto', right:'16px'}} />
        </Field>

        {/* Student-only fields */}
        {isStudent && <>
          <p style={{ fontSize:'11px', fontWeight:'700', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px', marginTop:'8px' }}>Location & Hostel</p>

          <Field label="Hostel" error={errors.hostel}>
            <Home style={S.icon} />
            <select value={formData.hostel} onChange={change('hostel')} required
              style={{...S.input, paddingRight:'48px', appearance:'none', WebkitAppearance:'none', cursor:'pointer', ...(errors.hostel?S.inputErr:{}), color: formData.hostel?'var(--color-text-primary)':'var(--color-text-muted)' }}
              onFocus={focusIn()} onBlur={focusOut(errors.hostel)}>
              <option value="" disabled>Select your hostel</option>
              {HOSTELS.map(h => <option key={h} value={h} style={{backgroundColor:'var(--color-bg-secondary)',color:'var(--color-text-primary)'}}>{h}</option>)}
            </select>
            <ChevronDown style={{...S.icon, left:'auto', right:'16px'}} />
          </Field>

          <Field label="Town" error={errors.town}>
            <MapPin style={S.icon} />
            <input type="text" inputMode="text" placeholder="e.g. Ayeduase, Bomso, Kotei"
              value={formData.town} onChange={change('town')} onKeyDown={onNameKey}
              style={{...S.input,...(errors.town?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.town)} required />
          </Field>

          <Field label={<>Landmark <span style={{fontWeight:'400',color:'var(--color-text-muted)',textTransform:'none',letterSpacing:'0'}}>— optional</span></>}>
            <MapPin style={S.icon} />
            <input type="text" inputMode="text" placeholder="e.g. Near Pharmacy, Opposite KFC"
              value={formData.landmark} onChange={change('landmark')}
              style={S.input} onFocus={focusIn()} onBlur={focusOut(false)} />
          </Field>
        </>}

        {/* Password */}
        <p style={{ fontSize:'11px', fontWeight:'700', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px', marginTop:'8px' }}>Security</p>

        <Field label="Password" error={errors.password}>
          <Lock style={S.icon} />
          <input type={showPassword ? 'text' : 'password'} autoComplete="new-password"
            placeholder="Min. 8 characters" value={formData.password} onChange={change('password')}
            style={{...S.input, paddingRight:'52px', ...(errors.password?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.password)} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', padding:'4px' }}>
            {showPassword ? <EyeOff style={{width:'18px',height:'18px'}} /> : <Eye style={{width:'18px',height:'18px'}} />}
          </button>
          {formData.password && (
            <div style={{ position:'absolute', right:'50px', top:'50%', transform:'translateY(-50%)', display:'flex', gap:'3px' }}>
              {[1,2,3,4].map(n => <div key={n} style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor: formData.password.length >= n*2 ? (n<=2?'#ef4444':n===3?'#f59e0b':'#22c55e') : 'var(--color-border)' }} />)}
            </div>
          )}
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword}>
          <Lock style={S.icon} />
          <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
            placeholder="Re-enter your password" value={formData.confirmPassword} onChange={change('confirmPassword')}
            style={{...S.input, paddingRight:'52px', ...(errors.confirmPassword?S.inputErr:{})}} onFocus={focusIn()} onBlur={focusOut(errors.confirmPassword)} required />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', padding:'4px' }}>
            {showConfirm ? <EyeOff style={{width:'18px',height:'18px'}} /> : <Eye style={{width:'18px',height:'18px'}} />}
          </button>
        </Field>

        <button type="submit" style={{ width:'100%', height:'52px', borderRadius:'14px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:'pointer', color:'var(--color-bg-primary)', backgroundColor: isStudent?'var(--color-primary)':'var(--color-secondary)', boxShadow:'0 4px 20px rgba(251,191,36,0.2)', marginTop:'8px' }}>
          <span>Request Access</span><ArrowRight style={{width:'18px',height:'18px'}} />
        </button>
      </form>

      <p style={{ position:'relative', zIndex:10, color:'var(--color-text-secondary)', fontSize:'14px', marginTop:'24px', textAlign:'center' }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToSignIn} style={{ background:'none', border:'none', color:'var(--color-primary)', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>Sign In</button>
      </p>
      <p style={{ position:'relative', zIndex:10, color:'var(--color-text-muted)', fontSize:'11px', marginTop:'12px', textAlign:'center', paddingBottom:'32px' }}>Your request will be reviewed by campus security</p>
    </div>
  );
}
