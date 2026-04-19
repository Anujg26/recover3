import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { TrendingUp, Award, Activity, AlertCircle, Flame, Droplets, Wind, Footprints, Moon, Clock, Dumbbell, X } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');
const DEMO_PATIENT_ID = 'de00dead-0000-4000-a000-000000000000';

const ProgressScreen = () => {
  const [loading, setLoading] = useState(true);
  const [baselineROM, setBaselineROM] = useState<number | null>(null);
  const [currentROM, setCurrentROM] = useState<number | null>(null);
  const [improvement, setImprovement] = useState<number | null>(null);
  const [adherenceData, setAdherenceData] = useState([70, 85, 50, 95, 100, 80, 0]);
  const [recoveryLogs, setRecoveryLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // useFocusEffect runs every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchROMData();
      fetchAdherenceData();
      fetchRecoveryLogs();
    }, [])
  );

  const fetchRecoveryLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('patient_id', DEMO_PATIENT_ID)
        .order('logged_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecoveryLogs(data || []);
    } catch (err) {
      console.error('Error fetching recovery logs:', err);
    }
  };

  const getRecoveryIcon = (type: string) => {
    switch (type) {
      case 'stretch': return <Flame size={18} color="#EF4444" />;
      case 'sauna': return <Flame size={18} color="#F59E0B" />;
      case 'cold_tub': return <Droplets size={18} color="#0EA5E9" />;
      case 'breathwork': return <Wind size={18} color="#10B981" />;
      case 'walk': return <Footprints size={18} color="#6366F1" />;
      case 'rest': return <Moon size={18} color="#6B7280" />;
      default: return <Activity size={18} color={COLORS.muted} />;
    }
  };

  const getRecoveryBg = (type: string) => {
    switch (type) {
      case 'stretch': return '#FEE2E2';
      case 'sauna': return '#FEF3C7';
      case 'cold_tub': return '#E0F2FE';
      case 'breathwork': return '#D1FAE5';
      case 'walk': return '#E0E7FF';
      case 'rest': return '#F3F4F6';
      default: return COLORS.border;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchAdherenceData = async () => {
    // ... (rest of logic unchanged) ...
    try {
      const { data } = await supabase
        .from('adherence_snapshots')
        .select('adherence_percentage, date')
        .eq('patient_id', DEMO_PATIENT_ID)
        .order('date', { ascending: false })
        .limit(7);

      if (data && data.length > 0) {
        setAdherenceData([75, 90, 65, 95, 100, 85, 0]);
      }
    } catch (err) { }
  };

  const fetchROMData = async () => {
    if (baselineROM === null) setLoading(true);
    try {
      const patientId = DEMO_PATIENT_ID;
      const { data: baselineData } = await supabase
        .from('rom_measurements')
        .select('range_of_motion_degrees, measured_at')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: true })
        .limit(1);
      const { data: latestData } = await supabase
        .from('rom_measurements')
        .select('range_of_motion_degrees, measured_at')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: false })
        .limit(1);

      if (baselineData && baselineData.length > 0 && latestData && latestData.length > 0) {
        const bVal = Number(baselineData[0].range_of_motion_degrees);
        const lVal = Number(latestData[0].range_of_motion_degrees);
        setBaselineROM(bVal);
        setCurrentROM(lVal);
        if (bVal > 0) setImprovement(((lVal - bVal) / bVal) * 100);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const LineChart = ({ data }: { data: number[] }) => {
    const chartHeight = 120;
    const chartWidth = width - 110; // Reduced to prevent leakage
    const maxVal = 100;

    // Only plot Monday (0) through Saturday (5)
    const plotData = data.slice(0, 6);

    const points = plotData.map((val, i) => {
      // Still space across the full 7-day scale for labels, but line stops at Saturday
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxVal) * chartHeight;
      return { x, y };
    });

    const d = points.reduce((acc, curr, i) => {
      if (i === 0) return `M 0 ${curr.y}`;
      const prev = points[i - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');

    // Area path closes at the last plotted point (Saturday)
    const lastPoint = points[points.length - 1];
    const areaD = `${d} L ${lastPoint.x} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
      <View style={styles.chartWrapper}>
        <View style={styles.chartYAxis}>
          <Text style={styles.axisText}>100%</Text>
          <Text style={styles.axisText}>50%</Text>
          <Text style={styles.axisText}>0%</Text>
        </View>
        <View style={styles.chartMain}>
          <Svg height={chartHeight} width={chartWidth}>
            <Defs>
              <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={COLORS.success} stopOpacity="0.2" />
                <Stop offset="1" stopColor={COLORS.success} stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Path d={areaD} fill="url(#grad)" />
            <Path
              d={d}
              fill="none"
              stroke={COLORS.success}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {points.map((p, i) => (
              <SvgCircle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={COLORS.white}
                stroke={COLORS.success}
                strokeWidth="2"
              />
            ))}
          </Svg>
          <View style={styles.chartXLabels}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <Text key={i} style={[styles.chartLabelText, i === 6 && { opacity: 0.3 }]}>{day}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const hasData = baselineROM !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Progress</Text>

        {!hasData ? (
          <View style={styles.emptyCard}>
            <AlertCircle size={48} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No Assessments Yet</Text>
            <Text style={styles.emptySub}>Perform your first ROM check-in to start tracking your mobility progress.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={fetchROMData}>
              <Text style={styles.emptyBtnText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Adherence Overview */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Plan Adherence</Text>
                <TrendingUp size={20} color={COLORS.success} />
              </View>
              <LineChart data={adherenceData} />
            </View>

            {/* ROM Trends */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Shoulder Mobility</Text>
                <Activity size={20} color={COLORS.primary} />
              </View>
              <View style={styles.romProgress}>
                <View style={styles.romItem}>
                  <Text style={styles.romVal}>{Math.round(baselineROM || 0)}°</Text>
                  <Text style={styles.romLab}>Baseline</Text>
                </View>
                <View style={styles.romDivider} />
                <View style={styles.romItem}>
                  <Text style={[styles.romVal, { color: COLORS.success }]}>{Math.round(currentROM || 0)}°</Text>
                  <Text style={styles.romLab}>Current</Text>
                </View>
              </View>
              {improvement !== null && (
                <View style={styles.improvementBadge}>
                  <Text style={styles.improvementText}>
                    {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}% Improvement
                  </Text>
                </View>
              )}
            </View>

            {/* Recovery History */}
            <Text style={styles.sectionTitle}>Recovery History</Text>
            {recoveryLogs.length > 0 ? (
              <View style={styles.historyList}>
                {recoveryLogs.map((log, i) => (
                  <TouchableOpacity
                    key={log.id || i}
                    style={styles.historyCard}
                    onPress={() => setSelectedLog(log)}
                  >
                    <View style={[styles.historyIcon, { backgroundColor: getRecoveryBg(log.activity_type) }]}>
                      {getRecoveryIcon(log.activity_type)}
                    </View>
                    <View style={styles.historyInfo}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyType}>{log.activity_type.replace('_', ' ').toUpperCase()}</Text>
                        <Text style={styles.historyDate}>{formatDate(log.logged_at)}</Text>
                      </View>
                      <View style={styles.historyMeta}>
                        {log.duration_minutes && (
                          <View style={styles.metaItem}>
                            <Clock size={12} color={COLORS.muted} />
                            <Text style={styles.metaText}>{log.duration_minutes} min</Text>
                          </View>
                        )}
                      </View>
                      {log.notes && <Text style={styles.historyNotes} numberOfLines={1}>"{log.notes}"</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No recovery logs yet.</Text>
              </View>
            )}

            {/* Achievements */}
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {[
                { title: 'First Check-in', icon: <Award size={32} color={COLORS.primary} /> },
                { title: 'Recovery Pro', icon: <Award size={32} color="#10B981" /> },
                { title: 'ROM Warrior', icon: <Award size={32} color="#6366F1" /> },
              ].map((item, i) => (
                <View key={i} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>{item.icon}</View>
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Log Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedLog !== null}
        onRequestClose={() => setSelectedLog(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedLog(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconCircle, { backgroundColor: getRecoveryBg(selectedLog?.activity_type) }]}>
                {getRecoveryIcon(selectedLog?.activity_type)}
              </View>
              <TouchableOpacity onPress={() => setSelectedLog(null)}>
                <X size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{selectedLog?.activity_type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.modalDate}>{selectedLog && formatDate(selectedLog.logged_at)}</Text>

            <View style={styles.modalMetaRow}>
              {selectedLog?.duration_minutes && (
                <View style={styles.modalMetaItem}>
                  <Clock size={16} color={COLORS.primary} />
                  <Text style={styles.modalMetaText}>{selectedLog.duration_minutes} Minutes</Text>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Your Notes</Text>
              <View style={styles.modalNotesBox}>
                <Text style={styles.modalNotesText}>
                  {selectedLog?.notes || "No notes recorded for this session."}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedLog(null)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 160,
    marginTop: 10,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginRight: 10,
    height: 120,
  },
  axisText: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },
  chartMain: {
    flex: 1,
  },
  chartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  chartLabelText: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLab: {
    fontSize: 12,
    color: COLORS.muted,
  },
  romProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  romItem: {
    alignItems: 'center',
  },
  romVal: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
  },
  romLab: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  romDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
  },
  improvementBadge: {
    backgroundColor: COLORS.accentMuted,
    padding: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 12,
  },
  improvementText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingBottom: 40,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginRight: 16,
    width: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  achievementIcon: {
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Recovery History Styles
  historyList: {
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  historyNotes: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 18,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: RADIUS.sm,
  },
  emptyHistory: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyHistoryText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  modalMetaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalNotesBox: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  modalNotesText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default ProgressScreen;
