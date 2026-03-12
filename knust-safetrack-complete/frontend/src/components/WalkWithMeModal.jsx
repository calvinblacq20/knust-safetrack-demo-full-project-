import { useRef, useState } from 'react';
import { X, Users, Shield, MapPin, Navigation, ChevronRight, UserPlus, Clock, ChevronLeft, Check, Phone, PhoneCall } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import Portal from './layout/Portal.jsx';
import { NEARBY_STUDENTS, ACTIVE_GROUPS, DESTINATIONS } from '../data/mockGroupData';

export default function WalkWithMeModal({ isOpen, onClose, onStartWalk }) {
    const [step, setStep] = useState(1); // 1: Choose mode, 2: Group/Security, 3: Destination, 4: Confirm
    const [mode, setMode] = useState(null); // 'group' or 'security'
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [destination, setDestination] = useState(null);
    const panelRef = useRef(null);
    const closeBtnRef = useRef(null);

    const [callingContact, setCallingContact] = useState(null);

    // Get user profile and emergency contacts from localStorage
    const userProfile = JSON.parse(localStorage.getItem('safetrack_profile') || '{}');
    const savedUser = (() => { try { return JSON.parse(localStorage.getItem('safetrack_user') || 'null'); } catch { return null; } })();
    const emergencyContacts = savedUser?.emergencyContacts || userProfile?.emergencyContacts || [
        { name: 'Mom', phone: '+233 20 987 6543' },
        { name: 'Dad', phone: '+233 24 555 1234' },
    ];

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: closeBtnRef });
    if (!isOpen) return null;

    const handleClose = () => {
        setStep(1);
        setMode(null);
        setSelectedGroup(null);
        setSelectedStudents([]);
        setDestination(null);
        setCallingContact(null);
        onClose();
    };

    const handleModeSelect = (selectedMode) => {
        setMode(selectedMode);
        setStep(2);
    };

    const handleJoinGroup = (group) => {
        setSelectedGroup(group);
        setDestination({ id: group.destination, name: group.destination });
        setStep(4);
    };

    const toggleStudent = (student) => {
        setSelectedStudents((prev) =>
            prev.find((s) => s.id === student.id)
                ? prev.filter((s) => s.id !== student.id)
                : [...prev, student]
        );
    };

    const handleProceedToDestination = () => {
        setStep(3);
    };

    const handleDestinationSelect = (dest) => {
        setDestination(dest);
        setStep(4);
    };

    const handleStartWalk = () => {
        if (onStartWalk) {
            onStartWalk({
                mode,
                group: selectedGroup,
                students: selectedStudents,
                destination,
            });
        }
        handleClose();
    };

    // Filter nearby students by same hostel/town
    const matchedStudents = NEARBY_STUDENTS.filter(
        (s) => s.hostel === userProfile.hostel || s.town === userProfile.town
    );
    const otherStudents = NEARBY_STUDENTS.filter(
        (s) => s.hostel !== userProfile.hostel && s.town !== userProfile.town
    );

    return (
        <Portal>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} role="dialog" aria-modal="true" aria-label="Walk With Me">
                <div ref={panelRef} style={{ width: '100%', maxWidth: '448px', maxHeight: '85vh', overflow: 'hidden', borderRadius: '24px 24px 0 0' }} className="bg-bg-secondary animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-border transition-colors"
                                    type="button"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-4 h-4 text-text-secondary" />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <h2 className="font-bold text-text-primary">Walk With Me</h2>
                                <p className="text-xs text-text-secondary">
                                    {step === 1 && 'Choose how to walk safely'}
                                    {step === 2 && (mode === 'group' ? 'Find or join a group' : 'Select your destination')}
                                    {step === 3 && 'Where are you going?'}
                                    {step === 4 && 'Confirm your walk'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-border transition-colors"
                            type="button"
                            aria-label="Close"
                            ref={closeBtnRef}
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                        {/* Step 1: Choose Mode */}
                        {step === 1 && (
                            <div className="p-4 space-y-3">
                                <p className="text-sm text-text-secondary mb-4">
                                    Your live location will be shared until you arrive safely.
                                </p>

                                {/* Walk with Group */}
                                <button
                                    onClick={() => handleModeSelect('group')}
                                    className="w-full p-4 bg-bg-primary rounded-xl flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors text-left"
                                    type="button"
                                >
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary">Walk with Group</h3>
                                        <p className="text-sm text-text-secondary">Join or create a group with nearby students</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted" />
                                </button>

                                {/* Campus Security */}
                                <button
                                    onClick={() => handleModeSelect('security')}
                                    className="w-full p-4 bg-bg-primary rounded-xl flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors text-left"
                                    type="button"
                                >
                                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary">Campus Security</h3>
                                        <p className="text-sm text-text-secondary">A security officer monitors your journey</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted" />
                                </button>

                                {/* Call a Friend */}
                                <button
                                    onClick={() => handleModeSelect('friend')}
                                    className="w-full p-4 bg-bg-primary rounded-xl flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors text-left"
                                    type="button"
                                >
                                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                                        <PhoneCall className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary">Call a Friend</h3>
                                        <p className="text-sm text-text-secondary">Call an emergency contact to walk with you</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Group Mode — nearby students & active groups */}
                        {step === 2 && mode === 'group' && (
                            <div className="p-4">
                                {/* Active groups to join */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-text-primary text-sm">Active Groups</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {ACTIVE_GROUPS.map((group) => (
                                            <button
                                                key={group.id}
                                                onClick={() => handleJoinGroup(group)}
                                                className="w-full p-3 bg-bg-primary rounded-xl flex items-center gap-3 hover:bg-bg-tertiary/50 transition-colors text-left"
                                                type="button"
                                            >
                                                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-secondary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-text-primary text-sm">{group.name}</p>
                                                    <p className="text-xs text-text-secondary">
                                                        {group.members}/{group.maxMembers} members • Departs {group.departureTime}
                                                    </p>
                                                    <p className="text-xs text-text-muted">Led by {group.leader}</p>
                                                </div>
                                                <div className="px-3 py-1.5 bg-secondary/20 rounded-full">
                                                    <span className="text-xs font-medium text-secondary">Join</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Nearby students from same area */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <UserPlus className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-text-primary text-sm">
                                            {matchedStudents.length > 0 ? 'Students in Your Area' : 'Nearby Students'}
                                        </h3>
                                    </div>
                                    {matchedStudents.length > 0 && (
                                        <p className="text-xs text-text-muted mb-2">
                                            Matched based on your hostel ({userProfile.hostel || 'N/A'}) and town ({userProfile.town || 'N/A'})
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {(matchedStudents.length > 0 ? matchedStudents : NEARBY_STUDENTS).map((student) => {
                                            const isSelected = selectedStudents.find((s) => s.id === student.id);
                                            return (
                                                <button
                                                    key={student.id}
                                                    onClick={() => toggleStudent(student)}
                                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${isSelected ? 'bg-primary/10 border border-primary' : 'bg-bg-primary hover:bg-bg-tertiary/50'}`}
                                                    type="button"
                                                >
                                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                                                        {student.avatar}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-text-primary text-sm">{student.name}</p>
                                                        <p className="text-xs text-text-secondary">
                                                            {student.hostel} • {student.distance}
                                                        </p>
                                                        <p className="text-xs text-text-muted">
                                                            Heading to {student.heading}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-bg-primary" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {matchedStudents.length > 0 && otherStudents.length > 0 && (
                                            <>
                                                <p className="text-xs text-text-muted mt-4 mb-2">Other nearby students</p>
                                                {otherStudents.map((student) => {
                                                    const isSelected = selectedStudents.find((s) => s.id === student.id);
                                                    return (
                                                        <button
                                                            key={student.id}
                                                            onClick={() => toggleStudent(student)}
                                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${isSelected ? 'bg-primary/10 border border-primary' : 'bg-bg-primary hover:bg-bg-tertiary/50'}`}
                                                            type="button"
                                                        >
                                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                                                                {student.avatar}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-text-primary text-sm">{student.name}</p>
                                                                <p className="text-xs text-text-secondary">
                                                                    {student.hostel} • {student.distance}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-bg-primary" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Create Group Button */}
                                <button
                                    onClick={handleProceedToDestination}
                                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${selectedStudents.length > 0
                                        ? 'bg-primary text-bg-primary hover:bg-primary-dark'
                                        : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                                        }`}
                                    type="button"
                                    disabled={selectedStudents.length === 0}
                                >
                                    <Users className="w-5 h-5" />
                                    {selectedStudents.length > 0
                                        ? `Create Group (${selectedStudents.length + 1} people)`
                                        : 'Select students to form a group'}
                                </button>
                            </div>
                        )}

                        {/* Step 2 for Security mode — go straight to destination */}
                        {step === 2 && mode === 'security' && (
                            <div className="p-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full mb-4">
                                    <Shield className="w-4 h-4 text-secondary" />
                                    <span className="text-sm font-medium text-text-primary">Campus Security</span>
                                </div>
                                <p className="text-sm text-text-secondary mb-3">Where are you going?</p>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto hide-scrollbar">
                                    {DESTINATIONS.map((dest) => (
                                        <button
                                            key={dest.id}
                                            onClick={() => handleDestinationSelect(dest)}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${destination?.id === dest.id
                                                ? 'bg-primary/20 border border-primary'
                                                : 'bg-bg-primary hover:bg-bg-tertiary/50'
                                                }`}
                                            type="button"
                                        >
                                            <MapPin className={`w-5 h-5 ${destination?.id === dest.id ? 'text-primary' : 'text-text-muted'}`} />
                                            <div className="flex-1">
                                                <p className="font-medium text-text-primary">{dest.name}</p>
                                                <p className="text-xs text-text-secondary">{dest.distance} away</p>
                                            </div>
                                            {destination?.id === dest.id && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <Navigation className="w-3 h-3 text-bg-primary" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Step 2 for Friend mode — pick from emergency contacts */}
                        {step === 2 && mode === 'friend' && (
                            <div className="p-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full mb-4">
                                    <PhoneCall className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium text-text-primary">Emergency Contacts</span>
                                </div>
                                <p className="text-sm text-text-secondary mb-4">Select a contact to call and coordinate your walk.</p>
                                {emergencyContacts.length === 0 ? (
                                    <div className="bg-bg-primary rounded-xl p-6 text-center border border-border">
                                        <Phone className="w-8 h-8 text-text-muted mx-auto mb-2" />
                                        <p className="text-sm text-text-secondary">No emergency contacts saved.</p>
                                        <p className="text-xs text-text-muted mt-1">Add contacts in your Profile settings.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {emergencyContacts.map((contact, idx) => {
                                            const isSelected = callingContact?.idx === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCallingContact(isSelected ? null : { ...contact, idx })}
                                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${isSelected ? 'bg-accent/10 border border-accent' : 'bg-bg-primary hover:bg-bg-tertiary/50 border border-transparent'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                                                        {contact.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-text-primary text-sm">{contact.name}</p>
                                                        <p className="text-xs text-text-secondary">{contact.phone}</p>
                                                    </div>
                                                    {isSelected ? (
                                                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    ) : (
                                                        <Phone className="w-4 h-4 text-text-muted" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {callingContact && (
                                    <div className="mt-4 space-y-2">
                                        <a
                                            href={`tel:${callingContact.phone.replace(/\s/g, '')}`}
                                            className="w-full py-3 bg-accent text-bg-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call {callingContact.name}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => { setDestination({ id: 'friend-walk', name: 'Walking with ' + callingContact.name }); setStep(4); }}
                                            className="w-full py-3 bg-bg-tertiary text-text-primary rounded-xl font-medium text-sm hover:bg-border transition-colors"
                                        >
                                            Continue to Destination →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Destination (for group mode) */
                        {step === 3 && (
                            <div className="p-4">
                                {/* Selected members badge */}
                                <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar">
                                    {selectedStudents.map((s) => (
                                        <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 rounded-full shrink-0">
                                            <span className="text-xs font-medium text-primary">{s.name.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm text-text-secondary mb-3">Where is your group going?</p>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto hide-scrollbar">
                                    {DESTINATIONS.map((dest) => (
                                        <button
                                            key={dest.id}
                                            onClick={() => handleDestinationSelect(dest)}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${destination?.id === dest.id
                                                ? 'bg-primary/20 border border-primary'
                                                : 'bg-bg-primary hover:bg-bg-tertiary/50'
                                                }`}
                                            type="button"
                                        >
                                            <MapPin className={`w-5 h-5 ${destination?.id === dest.id ? 'text-primary' : 'text-text-muted'}`} />
                                            <div className="flex-1">
                                                <p className="font-medium text-text-primary">{dest.name}</p>
                                                <p className="text-xs text-text-secondary">{dest.distance} away</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirm */}
                        {step === 4 && (
                            <div className="p-4">
                                <div className="bg-bg-primary rounded-xl p-4 border border-border mb-4">
                                    <h3 className="font-semibold text-text-primary mb-3">Walk Summary</h3>

                                    {/* Mode */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'group' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                            {mode === 'group' ? <Users className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-secondary" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                {mode === 'group' ? (selectedGroup ? 'Joining Group' : 'New Group Walk') : 'Security Escort'}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {mode === 'group'
                                                    ? (selectedGroup ? `${selectedGroup.members + 1} members` : `${selectedStudents.length + 1} people`)
                                                    : 'Security monitors your journey'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Group members */}
                                    {mode === 'group' && !selectedGroup && selectedStudents.length > 0 && (
                                        <div className="mb-3 pl-11">
                                            <p className="text-xs text-text-muted mb-1">Walking with:</p>
                                            {selectedStudents.map((s) => (
                                                <p key={s.id} className="text-xs text-text-secondary">• {s.name} ({s.hostel})</p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Destination */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{destination?.name}</p>
                                            <p className="text-xs text-text-secondary">Destination</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Safety notice */}
                                <div className="bg-secondary/10 rounded-xl p-3 mb-4 border border-secondary/20">
                                    <p className="text-xs text-secondary">
                                        🔒 Your location will be shared with {mode === 'group' ? 'group members and' : ''} campus security until you arrive safely.
                                    </p>
                                </div>

                                {/* Start Button */}
                                <button
                                    onClick={handleStartWalk}
                                    className="w-full py-4 bg-secondary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-secondary-light transition-colors"
                                    type="button"
                                >
                                    <Navigation className="w-5 h-5" />
                                    {selectedGroup ? 'Join Group & Start Walking' : 'Start Walking'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
