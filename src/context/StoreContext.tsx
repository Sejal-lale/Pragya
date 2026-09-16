import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Complaint, Language, Role, ComplaintStatus, EvidenceItem, AuthUser } from '../types';
import { initialComplaints } from '../data/mockData';
import { translations, Translations } from '../data/translations';
import { supabase } from '../lib/supabaseClient';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface StoreContextType {
  complaints: Complaint[];
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  currentEmployeeId: string;
  setCurrentEmployeeId: (id: string) => void;
  mobileFrame: boolean;
  setMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeComplaintId: string | null;
  setActiveComplaintId: (id: string | null) => void;
  currentUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'history'>) => Complaint;
  updateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    changedBy: string,
    comment?: string,
    evidence?: EvidenceItem
  ) => void;
  verifyComplaint: (id: string, approved: boolean, comment?: string) => void;
  addCitizenFeedback: (id: string, satisfied: boolean, comment?: string) => void;
  joinComplaint: (id: string) => void;
  resetToMockData: () => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'pragya_complaints_v1';
const LANG_STORAGE_KEY = 'pragya_lang_v1';
const AUTH_STORAGE_KEY = 'pragya_auth_user_v1';
const normalizeWardId = (raw?: string): string => {
  if (!raw) return 'ward-12';
  const c = raw.toLowerCase().trim();
  if (c.includes('12') || c.includes('dharampeth') || c.includes('laxmi')) return 'ward-12';
  if (c.includes('8') || c.includes('08') || c.includes('sitabuldi') || c.includes('ramdaspeth')) return 'ward-08';
  if (c.includes('15') || c.includes('khamla') || c.includes('pratap')) return 'ward-15';
  if (c.startsWith('ward-')) return c;
  return 'ward-12';
};

const normalizeDeptId = (raw?: string): string => {
  if (!raw) return 'roads';
  const c = raw.toLowerCase().trim();
  if (c === 'lighting' || c === 'electricity' || c.includes('elect')) return 'electrical';
  if (c.includes('sanitat') || c.includes('garbage') || c.includes('waste')) return 'sanitation';
  if (c.includes('water') || c.includes('drain')) return 'water';
  if (c.includes('infra')) return 'infrastructure';
  return 'roads';
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialComplaints;
  });

  const [currentRole, setCurrentRole] = useState<Role>('citizen');
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) return savedLang;
    } catch {
      // fallback
    }
    return 'hi'; // default to Hindi to show multilingual capability out of the box!
  });

  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('EMP-R042');
  const [mobileFrame, setMobileFrame] = useState<boolean>(false);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auth User State (null = Guest citizen with immediate complaint access)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sync role when user changes
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
      if (currentUser.role === 'employee' && currentUser.id) {
        setCurrentEmployeeId(currentUser.id);
      }
    } else {
      setCurrentRole('citizen');
    }
  }, [currentUser]);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'employee' && user.id) {
      setCurrentEmployeeId(user.id);
    }
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    addToast({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome, ${user.name} (${user.role.toUpperCase()})`,
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('citizen');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Switched back to public portal.',
    });
  };

  // Persist complaints locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch {
      // ignore
    }
  }, [complaints]);

  // Live Supabase Sync & Realtime Subscription
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const fetchLiveComplaints = async () => {
      try {
        const { data, error } = await client
          .from('complaints')
          .select(`
            *,
            evidence (*),
            timeline_events (*)
          `)
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          const mapped: Complaint[] = data.map((row: any) => {
            const problemPhotos = (row.evidence || [])
              .filter((e: any) => e.evidence_type === 'problem_photo')
              .map((e: any) => ({
                id: e.id,
                imageUrl: e.image_url,
                timestamp: e.created_at,
                uploadedBy: 'Citizen',
                role: 'citizen' as const,
                note: e.note,
              }));

            const selfie = (row.evidence || []).find((e: any) => e.evidence_type === 'citizen_verification_selfie');
            const resolutionPhotos = (row.evidence || [])
              .filter((e: any) => e.evidence_type === 'resolution_proof')
              .map((e: any) => ({
                id: e.id,
                imageUrl: e.image_url,
                timestamp: e.created_at,
                uploadedBy: 'Field Officer',
                role: 'employee' as const,
                note: e.note,
              }));

            const historyEntries = (row.timeline_events && row.timeline_events.length > 0)
              ? row.timeline_events.map((t: any) => ({
                  status: t.status as ComplaintStatus,
                  changedBy: t.actor_name,
                  timestamp: t.created_at,
                  comment: t.note,
                }))
              : [
                  {
                    status: (row.status as ComplaintStatus) || 'submitted',
                    changedBy: row.guest_citizen_name || 'Citizen',
                    timestamp: row.created_at,
                    comment: 'Registered via Pragya Voice Engine',
                  },
                ];

            return {
              id: row.id,
              title: row.title,
              description: row.description,
              originalLanguage: (row.original_language as Language) || 'hi',
              originalTranscript: row.original_transcript,
              translatedDescription: row.translated_description,
              category: row.category,
              subCategory: row.sub_category,
              departmentId: row.department_id,
              departmentName:
                row.department_id === 'sanitation'
                  ? 'Sanitation & Solid Waste'
                  : row.department_id === 'electrical' || row.department_id === 'lighting'
                  ? 'Street Lighting & Electrical'
                  : row.department_id === 'water'
                  ? 'Water Supply & Drainage'
                  : 'Roads & Infrastructure',
              status: row.status,
              priority: row.priority,
              slaHours: row.sla_hours,
              createdAt: row.created_at,
              deadline: row.deadline,
              location: {
                lat: Number(row.latitude) || 21.1458,
                lng: Number(row.longitude) || 79.0882,
                address: row.address,
                ward: row.ward_id || 'Ward 12, Nagpur',
              },
              assignedEmployeeId: row.assigned_employee_id,
              assignedEmployeeName: row.assigned_employee_id ? 'Rahul Sharma (EMP-R042)' : undefined,
              citizenEvidence: problemPhotos,
              resolutionEvidence: resolutionPhotos,
              citizenProfile: {
                name: row.guest_citizen_name || 'Verified Citizen',
                photoUrl: selfie?.image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                registrationAddress: row.address,
                registrationGeo: { lat: Number(row.latitude) || 21.1458, lng: Number(row.longitude) || 79.0882 },
                registeredAt: row.created_at,
                isVerified: true,
              },
              history: historyEntries,
              upvotesCount: row.upvotes_count || 1,
            };
          });

          setComplaints(mapped);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, continuing with local store:', err);
      }
    };

    fetchLiveComplaints();

    const channel = client
      .channel('public:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          fetchLiveComplaints();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addComplaint = (newComplaintData: Omit<Complaint, 'id' | 'createdAt' | 'history'>): Complaint => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id = `PRG-${randomNum}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      ...newComplaintData,
      id,
      createdAt: now,
      history: [
        {
          status: 'submitted',
          changedBy: 'Citizen',
          timestamp: now,
          comment: 'Submitted via Pragya voice/text engine',
        },
        {
          status: 'classified',
          changedBy: 'Pragya AI Core',
          timestamp: new Date(Date.now() + 2000).toISOString(),
          comment: `Identified category: ${newComplaintData.category}, SLA: ${newComplaintData.slaHours}h`,
        },
        {
          status: 'dept_assigned',
          changedBy: 'Municipal Dispatch',
          timestamp: new Date(Date.now() + 4000).toISOString(),
          comment: `Dispatched to ${newComplaintData.departmentName}`,
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Asynchronously insert into Supabase if configured
    const client = supabase;
    if (client) {
      const normalizedWard = normalizeWardId(newComplaintData.location.ward);
      const normalizedDept = normalizeDeptId(newComplaintData.departmentId);

      client
        .from('complaints')
        .insert({
          id,
          title: newComplaintData.title,
          description: newComplaintData.description,
          original_language: newComplaintData.originalLanguage,
          original_transcript: newComplaintData.originalTranscript,
          translated_description: newComplaintData.translatedDescription,
          category: newComplaintData.category,
          sub_category: newComplaintData.subCategory,
          department_id: normalizedDept,
          status: 'submitted',
          priority: newComplaintData.priority,
          sla_hours: newComplaintData.slaHours,
          deadline: newComplaintData.deadline,
          latitude: newComplaintData.location.lat,
          longitude: newComplaintData.location.lng,
          address: newComplaintData.location.address,
          ward_id: normalizedWard,
          guest_citizen_name: newComplaintData.citizenProfile?.name || 'Citizen',
        })
        .then(async ({ error }) => {
          if (error) {
            console.error('Supabase complaint insert failed:', error.message);
            addToast({
              type: 'error',
              title: 'Database Sync Warning',
              message: `Saved locally: ${error.message}`,
            });
            return;
          }

          // Insert citizen evidence photos into public.evidence
          if (newComplaintData.citizenEvidence && newComplaintData.citizenEvidence.length > 0) {
            const evRecords: any[] = newComplaintData.citizenEvidence.map((ev) => ({
              complaint_id: id,
              evidence_type: 'problem_photo',
              image_url: ev.imageUrl,
              uploaded_by_role: 'citizen',
              stamped_address: newComplaintData.location.address,
              note: ev.note || 'Problem photo captured during grievance filing',
            }));

            if (newComplaintData.citizenProfile?.photoUrl) {
              evRecords.push({
                complaint_id: id,
                evidence_type: 'citizen_verification_selfie',
                image_url: newComplaintData.citizenProfile.photoUrl,
                uploaded_by_role: 'citizen',
                stamped_address: `Geo-verified: ${newComplaintData.location.address}`,
                note: 'Citizen face verification selfie',
              });
            }

            await client.from('evidence').insert(evRecords);
          }

          // Insert timeline initial event
          await client.from('timeline_events').insert({
            complaint_id: id,
            status: 'submitted',
            actor_name: newComplaintData.citizenProfile?.name || 'Citizen',
            actor_role: 'citizen',
            note: 'Complaint registered with photo proof & GPS location',
          });
        });
    }

    addToast({
      type: 'success',
      title: 'Complaint Created',
      message: `${id} routed to ${newComplaintData.departmentName}`,
    });

    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    changedBy: string,
    comment?: string,
    evidence?: EvidenceItem
  ) => {
    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updatedHistory = [
          ...item.history,
          {
            status,
            changedBy,
            timestamp: new Date().toISOString(),
            comment,
          },
        ];

        const updatedResolutions = evidence
          ? [...(item.resolutionEvidence || []), evidence]
          : item.resolutionEvidence;

        return {
          ...item,
          status,
          history: updatedHistory,
          resolutionEvidence: updatedResolutions,
          ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}),
        };
      })
    );

    // Asynchronously update status in Supabase if configured
    const client = supabase;
    if (client) {
      client
        .from('complaints')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq('id', id)
        .then(async ({ error }) => {
          if (error) console.warn('Supabase update note:', error.message);

          if (evidence) {
            await client.from('evidence').insert({
              complaint_id: id,
              evidence_type: 'resolution_proof',
              image_url: evidence.imageUrl,
              uploaded_by_role: evidence.role || 'employee',
              note: evidence.note || comment || 'Work resolution photo proof',
            });
          }

          await client.from('timeline_events').insert({
            complaint_id: id,
            status,
            actor_name: changedBy,
            actor_role: currentRole === 'supervisor' ? 'supervisor' : currentRole === 'employee' ? 'employee' : 'citizen',
            note: comment || `Status changed to ${status}`,
          });
        });
    }

    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `${id} is now ${status.replace('_', ' ')}`,
    });
  };

  const verifyComplaint = (id: string, approved: boolean, comment?: string) => {
    if (approved) {
      updateComplaintStatus(
        id,
        'verified',
        'Supervisor Verification',
        comment || 'Work evidence reviewed and verified.'
      );
      setTimeout(() => {
        updateComplaintStatus(
          id,
          'resolved',
          'System Auto-Close',
          'Civic ticket closed and citizen notified.'
        );
      }, 500);
    } else {
      updateComplaintStatus(
        id,
        'reopened',
        'Supervisor Rejection',
        comment || 'Work insufficient. Reopened for field correction.'
      );
    }
  };

  const addCitizenFeedback = (id: string, satisfied: boolean, comment?: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          citizenFeedback: {
            satisfied,
            comment,
            timestamp: new Date().toISOString(),
          },
          ...(satisfied ? {} : { status: 'reopened' as ComplaintStatus }),
        };
      })
    );

    addToast({
      type: satisfied ? 'success' : 'warning',
      title: satisfied ? 'Feedback Recorded' : 'Issue Reopened',
      message: satisfied
        ? 'Thank you for rating municipal service!'
        : 'Feedback noted. Supervisor flagged for review.',
    });
  };

  const joinComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentCount = c.duplicateCount || 1;
        return {
          ...c,
          duplicateCount: currentCount + 1,
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Joined Complaint',
      message: `You upvoted ${id}. You will receive progress notifications.`,
    });
  };

  const resetToMockData = () => {
    setComplaints(initialComplaints);
    localStorage.removeItem(STORAGE_KEY);
    addToast({
      type: 'info',
      title: 'Data Reset',
      message: 'Initial civic demonstration data restored.',
    });
  };

  const t = translations[language];

  return (
    <StoreContext.Provider
      value={{
        complaints,
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        t,
        currentEmployeeId,
        setCurrentEmployeeId,
        mobileFrame,
        setMobileFrame,
        activeComplaintId,
        setActiveComplaintId,
        currentUser,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        toasts,
        addToast,
        removeToast,
        addComplaint,
        updateComplaintStatus,
        verifyComplaint,
        addCitizenFeedback,
        joinComplaint,
        resetToMockData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export { useStore } from './useStore';


