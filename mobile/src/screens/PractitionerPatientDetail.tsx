import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { TrendingUp, Activity, Clock, CheckCircle2, MessageSquare, AlertCircle, Calendar, ChevronLeft, Sparkles } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

const PractitionerPatientDetail = ({ route, navigation }: any) => {
  const { patientId, name } = route.params;
  const [loading, setLoading] = useState(true);
  const [adherenceData] = useState([75, 90, 65, 95, 100, 85, 0]);
  const [recoveryLogs, setRecoveryLogs] = useState<any[]>([]);
  const [latestROM, setLatestROM] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPatientData();
    }, [patientId])
  );

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // 1. Fetch ROM
      const { data: romData } = await supabase
        .from('rom_measurements')
        .select('*')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: false });

      if (romData && romData.length > 0) {
        setLatestROM(romData[0].range_of_motion_degrees);
      }

      // 2. Fetch Logs
      const { data: logs } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('logged_at', { ascending: false })
        .limit(10);

      setRecoveryLogs(logs || []);

      // 3. Fetch latest AI summary
      const { data: aiData } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (aiData && aiData.length > 0) {
        setAiSummary(aiData[0]);
      }

    } catch (err) {
      console.error('Fetch detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = () => {
    Alert.alert('Flagged', `Session flagged for clinical review.`);
  };

  const LineChart = ({ data }: { data: number[] }) => {
    const chartHeight = 120;
    const chartWidth = width - 80;
    const maxVal = 100;
    const plotData = data.slice(0, 6);
    const points = plotData.map((val, i) => {
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
                <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.2" />
                <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Path d={areaD} fill="url(#grad)" />
            <Path d={d} fill="none" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
            {points.map((p, i) => (
              <SvgCircle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="2" />
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.patientName}>{name}</Text>
          <Text style={styles.patientId}>ID: {patientId.slice(0, 8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.messageBtn}>
          <MessageSquare size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Adherence Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adherence Trends</Text>
          <View style={styles.card}>
            <LineChart data={adherenceData} />
          </View>
        </View>

        {/* ROM Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Range of Motion</Text>
          <View style={styles.card}>
            <View style={styles.romRow}>
              <View style={styles.romStat}>
                <Text style={styles.romVal}>{Math.round(latestROM || 0)}°</Text>
                <Text style={styles.romLab}>L. SHOULDER</Text>
              </View>
              <View style={styles.romDivider} />
              <View style={styles.romStat}>
                <Text style={[styles.romVal, { color: COLORS.success }]}>+5.2%</Text>
                <Text style={styles.romLab}>WEEKLY TREND</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.flagBtn} onPress={handleFlag}>
              <AlertCircle size={14} color={COLORS.white} />
              <Text style={styles.flagBtnText}>Flag for Clinical Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insight Section */}
        {aiSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recovery Insight</Text>
            <TouchableOpacity 
              style={styles.aiCard} 
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.8}
            >
              <View style={styles.aiHeader}>
                <Sparkles size={18} color={COLORS.primary} />
                <Text style={styles.aiHeaderTitle}>Llama 3 Clinical Impression</Text>
              </View>
              <Text style={styles.aiText}>
                {isExpanded 
                  ? aiSummary.summary_text 
                  : `${aiSummary.summary_text.substring(0, 100)}...`}
              </Text>
              <View style={styles.aiFooter}>
                <Text style={styles.readMoreText}>{isExpanded ? 'Show Less' : 'Read More'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recovery Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Recovery Activity</Text>
          {recoveryLogs.map((log, i) => (
            <View key={i} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logType}>{log.activity_type.toUpperCase()}</Text>
                <Text style={styles.logDate}>{new Date(log.logged_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.logNotes}>"{log.notes}"</Text>
              <View style={styles.logFooter}>
                <Clock size={12} color={COLORS.muted} />
                <Text style={styles.logMeta}>{log.duration_minutes} min duration</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: 16 },
  backBtn: { padding: 4 },
  patientName: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  patientId: { fontSize: 12, color: COLORS.muted, fontWeight: '700' },
  messageBtn: { marginLeft: 'auto', backgroundColor: COLORS.accent, padding: 10, borderRadius: RADIUS.md },
  scrollContent: { padding: SPACING.lg, paddingTop: 0 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  chartWrapper: { flexDirection: 'row', height: 160 },
  chartYAxis: { justifyContent: 'space-between', paddingVertical: 10, marginRight: 10, height: 120 },
  axisText: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },
  chartMain: { flex: 1 },
  chartXLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  chartLabelText: { fontSize: 10, color: COLORS.muted, fontWeight: '700' },
  romRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  romStat: { flex: 1, alignItems: 'center' },
  romVal: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  romLab: { fontSize: 10, fontWeight: '700', color: COLORS.muted, marginTop: 4 },
  romDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  flagBtn: { backgroundColor: COLORS.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: RADIUS.md },
  flagBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  logCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  logType: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  logDate: { fontSize: 12, color: COLORS.muted },
  logNotes: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', marginBottom: 12 },
  logFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logMeta: { fontSize: 12, color: COLORS.muted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiCard: { 
    backgroundColor: '#F8F7FF', 
    padding: 20, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    borderColor: '#E0DEFF',
    ...SHADOWS.sm 
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiHeaderTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiText: { fontSize: 15, color: COLORS.text, lineHeight: 22, opacity: 0.9 },
  aiFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#E0DEFF', paddingTop: 12 },
  readMoreText: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textAlign: 'center' }
});

export default PractitionerPatientDetail;
