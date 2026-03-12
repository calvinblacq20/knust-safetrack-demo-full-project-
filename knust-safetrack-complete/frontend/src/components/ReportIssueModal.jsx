import { useRef, useState } from 'react';
import { X, AlertTriangle, Lightbulb, MapPin, Shield, Send, CheckCircle } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import Portal from './layout/Portal.jsx';
import useToast from '../hooks/useToast.js';

const ISSUE_TYPES = [
  { id: 'lighting', label: 'Broken Street Light', icon: Lightbulb, color: 'text-primary' },
  { id: 'suspicious', label: 'Suspicious Activity', icon: AlertTriangle, color: 'text-danger' },
  { id: 'security', label: 'Security Concern', icon: Shield, color: 'text-secondary' },
  { id: 'location', label: 'Unsafe Location', icon: MapPin, color: 'text-accent' },
];

export default function ReportIssueModal({ isOpen, onClose }) {
  const toast = useToast();
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEscapeKey(isOpen, onClose);
  useFocusTrap({ enabled: isOpen, containerRef: modalRef, initialFocusRef: closeBtnRef });
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedType(null);
      setDescription('');
      setLocation('');
      onClose();
    }, 2000);
  };

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 2100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} role="dialog" aria-modal="true" aria-label="Report Issue">
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
        <div ref={modalRef} style={{ position: 'relative', width: '100%', maxWidth: '448px', borderRadius: '24px 24px 0 0', overflow: 'hidden' }} className="bg-bg-secondary animate-slide-up">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-bg-tertiary rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-text-primary">Report an Issue</h2>
            </div>
            <button ref={closeBtnRef} onClick={onClose} className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Report Submitted!</h3>
              <p className="text-text-secondary text-sm">Campus security has been notified. Thank you for helping keep KNUST safe.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Issue Type */}
              <div>
                <p className="text-sm font-medium text-text-secondary mb-3">What are you reporting?</p>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border transition-all text-left ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-bg-primary hover:bg-bg-tertiary'}`}
                      >
                        <Icon className={`w-5 h-5 ${type.color} mb-1.5`} />
                        <p className="text-xs font-medium text-text-primary">{type.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g., Near Tech Junction, Behind Hall 7..."
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full h-11 pl-9 pr-4 bg-bg-primary border border-border rounded-xl text-text-primary text-sm outline-none focus:border-primary"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1.5">Description <span className="text-text-muted font-normal">(optional)</span></label>
                <textarea
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary text-sm outline-none focus:border-primary resize-none"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedType || !location || submitting}
                className="w-full py-3 bg-primary text-bg-primary font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
}
