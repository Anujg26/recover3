import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Stethoscope, MapPin, Calendar, Clock, ChevronRight, MessageSquare, Phone, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

const DEMO_PATIENT_ID = 'de00dead-0000-4000-a000-000000000000';

const PractitionerScreen = () => {
  const [loading, setLoading] = useState(true);
  const [practitioner, setPractitioner] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Physician assigned to patient
      const { data: ppData, error: ppError } = await supabase
        .from('practitioner_patients')
        .select(`
          practitioner_id,
          practitioners (
            id,
            clinic_name,
            specialization,
            bio,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('patient_id', DEMO_PATIENT_ID)
        .single();

      if (ppData?.practitioners) {
        setPractitioner(ppData.practitioners);
        
        // 2. Fetch sessions for this patient/practitioner pair
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*')
          .eq('patient_id', DEMO_PATIENT_ID)
          .eq('practitioner_id', ppData.practitioner_id)
          .order('scheduled_at', { ascending: false });

        setSessions(sessionData || []);
      }
    } catch (err) {
      console.error('Error fetching practitioner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!practitioner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Stethoscope size={64} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>No Specialist Assigned</Text>
          <Text style={styles.emptySub}>Connect with a practitioner to start your personalized recovery track.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={fetchData}>
            <Text style={styles.emptyBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Care Team</Text>

        {/* Practitioner Profile Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {practitioner.profiles?.avatar_url ? (
                <Image source={{ uri: practitioner.profiles.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{practitioner.profiles?.full_name?.charAt(0)}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.practitionerName}>{practitioner.profiles?.full_name}</Text>
              <Text style={styles.specialization}>{practitioner.specialization}</Text>
              <View style={styles.clinicRow}>
                <MapPin size={12} color={COLORS.accent} />
                <Text style={styles.clinicName}>{practitioner.clinic_name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <MessageSquare size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Call Clinic</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{practitioner.bio}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recovery Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Book Session</Text>
            </TouchableOpacity>
          </View>

          {sessions.length > 0 ? (
            sessions.map((session, i) => (
              <View key={session.id || i} style={styles.sessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View style={styles.dateBadge}>
                    <Calendar size={14} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formatDate(session.scheduled_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: session.completed_at ? COLORS.accentMuted : '#FFF7ED' }]}>
                    <Text style={[styles.statusText, { color: session.completed_at ? COLORS.primary : '#C2410C' }]}>
                      {session.completed_at ? 'COMPLETED' : 'UPCOMING'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.sessionNotes}>{session.notes}</Text>
                
                {session.focus_areas && session.focus_areas.length > 0 && (
                  <View style={styles.focusContainer}>
                    {session.focus_areas.map((area: string, index: number) => (
                      <View key={index} style={styles.focusBadge}>
                        <Text style={styles.focusText}>{area.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <TouchableOpacity style={styles.sessionDetailBtn}>
                  <Info size={14} color={COLORS.muted} />
                  <Text style={styles.sessionDetailText}>View Session Plan</Text>
                  <ChevronRight size={16} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptySessions}>
              <Text style={styles.emptySessionText}>No sessions recorded yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: RADIUS.lg,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  practitionerName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clinicName: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bioText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    opacity: 0.8,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sessionNotes: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  focusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  focusBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  focusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
  },
  sessionDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDetailText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  emptySessions: {
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptySessionText: {
    color: COLORS.muted,
    fontSize: 14,
  }
});

export default PractitionerScreen;
