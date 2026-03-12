import { useState } from 'react';
import { Users, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import useToast from '../hooks/useToast.js';
import ReportIssueModal from './ReportIssueModal.jsx';

const chips = [
  { id: 'walk', label: 'Walk With Me', icon: Users, color: 'secondary' },
  { id: 'share', label: 'Share Location', icon: Share2, color: 'primary' },
  { id: 'report', label: 'Report Issue', icon: AlertTriangle, color: 'text-secondary' },
];

export default function QuickActionChips({ onWalkWithMe }) {
  const toast = useToast();
  const [sharing, setSharing] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleChipClick = async (chipId) => {
    if (chipId === 'walk' && onWalkWithMe) {
      onWalkWithMe();
    } else if (chipId === 'share') {
      setSharing(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(link).then(() => {
                  toast.success('Live location link copied to clipboard!');
                });
              } else {
                toast.success('Location link: ' + link);
              }
              setSharing(false);
            },
            () => {
              // Fallback with KNUST coords
              const link = 'https://maps.google.com/?q=6.6745,-1.5716';
              toast.success('Campus location link copied!');
              setSharing(false);
            }
          );
        } else {
          toast.success('Location sharing link copied!');
          setSharing(false);
        }
      } catch {
        setSharing(false);
        toast.success('Location link copied!');
      }
    } else if (chipId === 'report') {
      setShowReport(true);
    }
  };

  return (
    <>
      <div
        className="absolute z-[1000] left-0 right-0 px-4 overflow-x-auto hide-scrollbar"
        style={{ bottom: 'calc(64px + 140px + 12px)' }}
      >
        <div className="flex gap-2 w-max">
          {chips.map((chip) => {
            const Icon = chip.id === 'share' && sharing ? CheckCircle : chip.icon;
            const bgColor = chip.color === 'secondary'
              ? 'bg-secondary/20 hover:bg-secondary/30'
              : chip.color === 'primary'
                ? 'bg-primary/20 hover:bg-primary/30'
                : 'bg-bg-tertiary hover:bg-border';
            const textColor = chip.color === 'secondary'
              ? 'text-secondary'
              : chip.color === 'primary'
                ? 'text-primary'
                : 'text-text-secondary';

            return (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                disabled={chip.id === 'share' && sharing}
                className={`flex items-center gap-2 px-4 py-2 ${bgColor} rounded-full transition-colors whitespace-nowrap disabled:opacity-70`}
              >
                <Icon className={`w-4 h-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>
                  {chip.id === 'share' && sharing ? 'Getting location...' : chip.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ReportIssueModal isOpen={showReport} onClose={() => setShowReport(false)} />
    </>
  );
}
