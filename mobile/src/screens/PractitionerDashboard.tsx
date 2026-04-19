import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Users, Activity, TrendingUp, AlertCircle, ChevronRight, MessageSquare, Search, Filter, Layers, Clock } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../services/supabase';
import { useRole } from '../context/RoleContext';

const { width } = Dimensions.get('window');
const DEMO_PRACTITIONER_ID = 'de000000-0000-4000-a000-000000000002';
const ALEX_PATIENT_ID = 'de00dead-0000-4000-a000-000000000000';

const PractitionerDashboard = ({ navigation }: any) => {
  const { toggleRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeToday: 0
  });

  useFocusEffect(
    useCallback(() => {
      fetchClinicData();
    }, [])
  );

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      const { data: patientData, error: pError } = await supabase
        .from('practitioner_patients')
        .select(`
          patient_id,
          patients (
            id,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('practitioner_id', DEMO_PRACTITIONER_ID);

      if (pError) throw pError;

      const enrichedPatients = await Promise.all((patientData || []).map(async (p: any) => {
        const { data: romData } = await supabase
          .from('rom_measurements')
          .select('range_of_motion_degrees, measured_at')
          .eq('patient_id', p.patient_id)
          .order('measured_at', { ascending: false })
          .limit(1);

        return {
          ...p,
          latestROM: romData && romData.length > 0 ? romData[0].range_of_motion_degrees : null,
          lastActive: romData && romData.length > 0 ? romData[0].measured_at : null,
          injury: p.patient_id === ALEX_PATIENT_ID ? 'Shoulder Labrum Tear' : 'Shoulder Flexion'
        };
      }));

      let sortedPatients = enrichedPatients.sort((a, b) => {
        if (a.patient_id === ALEX_PATIENT_ID) return -1;
        if (b.patient_id === ALEX_PATIENT_ID) return 1;
        return 0;
      });

      if (!sortedPatients.find(p => p.patient_id === ALEX_PATIENT_ID)) {
        let alexName = 'Alex';
        let alexROMVal = 82;
        let alexActivity = 'Mobility';

        try {
          const { data: alexProfile } = await supabase.from('profiles').select('full_name').eq('id', ALEX_PATIENT_ID).single();
          if (alexProfile) alexName = alexProfile.full_name;
          const { data: alexROM } = await supabase.from('rom_measurements').select('range_of_motion_degrees').eq('patient_id', ALEX_PATIENT_ID).order('measured_at', { ascending: false }).limit(1);
          if (alexROM && alexROM.length > 0) alexROMVal = alexROM[0].range_of_motion_degrees;
          const { data: alexLogs } = await supabase.from('recovery_logs').select('activity_type').eq('patient_id', ALEX_PATIENT_ID).order('logged_at', { ascending: false }).limit(1);
          if (alexLogs && alexLogs.length > 0) alexActivity = alexLogs[0].activity_type;
        } catch (e) {
          console.warn('Silent Alex fetch fail');
        }

        sortedPatients = [{
          patient_id: ALEX_PATIENT_ID,
          latestROM: alexROMVal,
          latestLog: alexActivity,
          injury: 'Shoulder Labrum Tear',
          patients: { profiles: { full_name: alexName } }
        }, ...sortedPatients];
      }

      setPatients(sortedPatients);
      setStats({
        totalPatients: sortedPatients.length,
        activeToday: sortedPatients.length
      });

    } catch (err) {
      console.error('Clinician data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const MiniSparkline = () => (
    <View style={styles.sparkline}>
      <Svg height="24" width="60">
        <Path d="M0 18 C10 18, 20 5, 30 12 C40 18, 50 2, 60 8" fill="none" stroke={COLORS.primary} strokeWidth="2" />
      </Svg>
    </View>
  );

  const renderPatientCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.patientCard, item.patient_id === ALEX_PATIENT_ID && styles.alexCard]}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.patient_id, name: item.patients?.profiles?.full_name })}
    >
      <View style={styles.patientAvatar}>
        <Text style={styles.avatarText}>{item.patients?.profiles?.full_name?.charAt(0)}</Text>
        {item.patient_id === ALEX_PATIENT_ID && <View style={styles.activeDot} />}
      </View>
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>{item.patients?.profiles?.full_name}</Text>
          <Text style={styles.injuryText}>({item.injury})</Text>
        </View>
        <View style={styles.activitySnippet}>
          <Clock size={10} color={COLORS.muted} />
          <Text style={styles.activityText}>Latest: {item.latestLog || 'Assessment'}</Text>
        </View>
        <View style={styles.patientMetrics}>
          <View style={styles.miniStat}>
            <Activity size={14} color={COLORS.primary} />
            <Text style={styles.miniStatVal}>{item.latestROM ? `${Math.round(item.latestROM)}°` : '82°'}</Text>
            <MiniSparkline />
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.miniStat}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={[styles.miniStatVal, { color: COLORS.success }]}>+5.2%</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Clinician Dashboard</Text>
          <Text style={styles.subGreeting}>Welcome back, Dr. Practionior</Text>
        </View>
        <TouchableOpacity style={styles.roleToggle} onPress={toggleRole}>
          <Layers size={20} color={COLORS.primary} />
          <Text style={styles.roleToggleText}>Patient Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={24} color={COLORS.primary} />
            <Text style={styles.statLargeVal}>{stats.totalPatients}</Text>
            <Text style={styles.statDesc}>Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={24} color={COLORS.success} />
            <Text style={styles.statLargeVal}>{stats.activeToday}</Text>
            <Text style={styles.statDesc}>Active Today</Text>
          </View>
        </View>

        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Anomalies & Alerts</Text>
          <View style={styles.alertCard}>
            <View style={[styles.alertIcon, { backgroundColor: '#FEF2F2' }]}>
              <AlertCircle size={20} color={COLORS.error} />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>ROM Drop Detected</Text>
              <Text style={styles.alertDesc}>Alex (Shoulder) dropped -8° since yesterday.</Text>
            </View>
            <TouchableOpacity style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.muted} />
          <Text style={styles.searchPlaceholder}>Search for a patient...</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Patients</Text>
            <Text style={styles.patientCount}>{patients.length} Total</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={patients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.patient_id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <AlertCircle size={48} color={COLORS.muted} />
                  <Text style={styles.emptyText}>No patients assigned yet.</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingBottom: SPACING.md },
  greeting: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  subGreeting: { fontSize: 14, color: COLORS.muted },
  roleToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full },
  roleToggleText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  scrollContent: { padding: SPACING.lg, paddingTop: 0 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  statLargeVal: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginVertical: 4 },
  statDesc: { fontSize: 10, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase' },
  alertsSection: { marginTop: 12, marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.error, ...SHADOWS.sm },
  alertIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '800', color: COLORS.error, marginBottom: 2 },
  alertDesc: { fontSize: 12, color: COLORS.text, opacity: 0.8 },
  reviewBtn: { backgroundColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
  reviewBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: RADIUS.md, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  searchPlaceholder: { flex: 1, marginLeft: 12, color: COLORS.muted, fontSize: 15 },
  filterBtn: { padding: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  patientCount: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  patientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.lg, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  alexCard: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: '#F8FAFC' },
  patientAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: 16, position: 'relative' },
  activeDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: '#FFF' },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  patientInfo: { flex: 1 },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  patientName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  injuryText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  activitySnippet: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, opacity: 0.7 },
  activityText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  patientMetrics: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniStatVal: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  sparkline: { marginLeft: 'auto' },
  metricDivider: { width: 1, height: 12, backgroundColor: COLORS.border },
  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { marginTop: 12, color: COLORS.muted, fontSize: 14 }
});

export default PractitionerDashboard;
