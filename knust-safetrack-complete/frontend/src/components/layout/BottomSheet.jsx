import { useEffect, useState } from 'react';
import { ChevronUp, Shield, AlertTriangle, Lightbulb, Phone } from 'lucide-react';

const SAFETY_TIPS = [
    { id: 1, tip: 'Stick to well-lit paths when walking at night', icon: 'light' },
    { id: 2, tip: 'Share your live location with a trusted friend', icon: 'shield' },
    { id: 3, tip: 'Walk in groups — use Walk With Me to find companions', icon: 'shield' },
    { id: 4, tip: 'Save the security hotline: 0322-060-331', icon: 'phone' },
    { id: 5, tip: 'If you feel unsafe, press the SOS button immediately', icon: 'alert' },
];

export default function BottomSheet() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTip, setActiveTip] = useState(0);

    // Rotate tips every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTip((prev) => (prev + 1) % SAFETY_TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentTip = SAFETY_TIPS[activeTip];

    const getTipIcon = (iconType) => {
        switch (iconType) {
            case 'light': return <Lightbulb className="w-5 h-5 text-primary" />;
            case 'shield': return <Shield className="w-5 h-5 text-secondary" />;
            case 'phone': return <Phone className="w-5 h-5 text-accent" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-danger" />;
            default: return <Lightbulb className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div
            className={`absolute left-0 right-0 z-[1000] bg-bg-secondary rounded-t-2xl border-t border-border bottom-sheet ${isExpanded ? 'h-[50vh]' : 'h-auto'
                }`}
            style={{ bottom: '64px' }}
        >
            {/* Drag Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-center py-2 cursor-pointer"
                aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            >
                <div className="w-10 h-1 bg-bg-tertiary rounded-full" />
            </button>

            {/* Collapsed Content — Current Safety Tip */}
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            {getTipIcon(currentTip.icon)}
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary">Safety Tip</p>
                            <p className="font-medium text-text-primary text-sm">{currentTip.tip}</p>
                        </div>
                    </div>
                </div>

                {/* Tip progress dots */}
                <div className="flex items-center justify-center gap-1.5 mt-1">
                    {SAFETY_TIPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === activeTip ? 'w-6 bg-primary' : 'w-1.5 bg-bg-tertiary'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 overflow-y-auto max-h-[calc(50vh-100px)] hide-scrollbar">
                    {/* Section Header */}
                    <div className="flex items-center justify-between py-3 border-t border-border">
                        <h3 className="font-semibold text-text-primary">All Safety Tips</h3>
                        <ChevronUp
                            className="w-5 h-5 text-text-secondary cursor-pointer"
                            onClick={() => setIsExpanded(false)}
                        />
                    </div>

                    {/* Tips List */}
                    <div className="space-y-2">
                        {SAFETY_TIPS.map((tip) => (
                            <div
                                key={tip.id}
                                className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl"
                            >
                                <div className="w-8 h-8 bg-bg-tertiary rounded-lg flex items-center justify-center shrink-0">
                                    {getTipIcon(tip.icon)}
                                </div>
                                <p className="text-sm text-text-primary">{tip.tip}</p>
                            </div>
                        ))}
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="mt-4 p-4 bg-danger/10 rounded-xl border border-danger/20">
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-danger" />
                            <div>
                                <p className="font-semibold text-text-primary text-sm">Campus Security Hotline</p>
                                <p className="text-danger font-bold">0322-060-331</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
