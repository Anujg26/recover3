import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { RefreshCw, Wifi, WifiOff, Save, Monitor, Lock, ArrowRight } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useTasks } from '../context/TaskContext';

const { width } = Dimensions.get('window');

// ── CONFIG ────────────────────────────────────────────────────────────────
const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 8000;
const DEMO_PATIENT_ID = 'de00dead-0000-4000-a000-000000000000';

type ROMResult = {
  annotated_frame?: string;
  state?: string;
  instruction?: string;
  sub?: string;
  progress?: number;
  posture_ok?: boolean;
  shoulder_angle?: number;
  rom?: number | null;
  interrupt_msg?: string | null;
  error?: string;
  action?: string;
};

const ROMCheckScreen = ({ navigation }: any) => {
  const { isAllComplete, tasks, completedTasks } = useTasks();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [result, setResult] = useState<ROMResult>({});
  const [sessionId] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36));

  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket lifecycle
  useEffect(() => {
    return () => {
      disconnectWS();
    };
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current) return;

    setIsConnecting(true);
    // CONFIG TIP: Change 127.0.0.1 to your Mac's IP (e.g. 192.168.1.XX) if using a real phone!
    const url = `ws://${SERVER_HOST}:${SERVER_PORT}/ws/${sessionId}`;
    console.log('Connecting to:', url);

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('✅ WebSocket Connected');
      setIsConnected(true);
      setIsConnecting(false);
    };

    ws.onmessage = (e) => {
      try {
        const data: ROMResult = JSON.parse(e.data);
        if (data.annotated_frame) {
          setResult(data);
        }
      } catch (err) {
        console.warn('Malformed WS message', err);
      }
    };

    ws.onerror = (e) => {
      console.log('❌ WebSocket Error:', e);
      setIsConnecting(false);
      Alert.alert(
        'Connection Failed',
        `Could not reach ${url}.\n\n1. Ensure FastAPI is running\n2. If using a real phone, use your Mac's LAN IP instead of 127.0.0.1`,
        [{ text: 'Retry', onPress: connectWS }, { text: 'Cancel' }]
      );
    };

    ws.onclose = (e) => {
      console.log('🛑 WebSocket Closed:', e.code, e.reason);
      setIsConnected(false);
      setIsConnecting(false);
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [sessionId]);

  const disconnectWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setResult({});
    setHasSaved(false);
  }, []);

  const handleReset = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send('reset');
    }
    setResult({});
    setHasSaved(false);
  }, []);

  const saveAssessment = async () => {
    if (!result.rom) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('rom_measurements').insert({
        patient_id: DEMO_PATIENT_ID,
        joint: 'shoulder',
        side: 'left',
        range_of_motion_degrees: result.rom,
        measured_at: new Date().toISOString(),
      });
      if (error) throw error;
      setHasSaved(true);
      Alert.alert('Success', 'Measurement saved.');
    } catch (err: any) {
      Alert.alert('Save Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── RENDER: LOCKED STATE ────────────────────────────────────────────────
  if (!isAllComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockCircle}>
            <Lock size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.lockedTitle}>Check-in Locked</Text>
          <Text style={styles.lockedDesc}>
            To ensure an accurate assessment, you must complete all daily recovery rituals before performing a ROM check-in.
          </Text>

          <View style={styles.lockStatsCards}>
            <View style={styles.lockStatCard}>
              <Text style={styles.lockStatValue}>{completedTasks.length}/{tasks.length}</Text>
              <Text style={styles.lockStatLabel}>TASKS DONE</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryBtnText}>Finish Rituals</Text>
            <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── RENDER: UNLOCKED STATE ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Remote ROM</Text>
          <View style={[styles.statusBadge, isConnected ? styles.statusLive : styles.statusOffline]}>
            {isConnected ? <Wifi size={14} color="#FFF" /> : <WifiOff size={14} color="#6B7280" />}
            <Text style={[styles.statusText, isConnected && { color: '#FFF' }]}>
              {isConnected ? 'STREAMING' : 'OFFLINE'}
            </Text>
          </View>
        </View>
        <Text style={styles.subTitle}>Viewing stream from Mac Camera</Text>
      </View>

      <View style={styles.cameraContainer}>
        {result.annotated_frame ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${result.annotated_frame}` }}
            style={styles.annotatedFrame}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cameraPlaceholder, { backgroundColor: '#111' }]}>
            <View style={styles.waitOverlay}>
              <Monitor size={48} color="rgba(255,255,255,0.2)" />
              <Text style={styles.waitText}>
                {isConnected ? 'Waiting for video...' : 'Connect to start session'}
              </Text>
            </View>
          </View>
        )}

        {isConnected && result.instruction && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{result.instruction}</Text>
          </View>
        )}

        {result.rom !== undefined && result.rom !== null && (
          <View style={styles.romResultBadge}>
            <Text style={styles.romResultValue}>{Math.round(result.rom)}°</Text>
            <Text style={styles.romResultLabel}>MAX ROM</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {!isConnected ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={connectWS} disabled={isConnecting}>
            {isConnecting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Connect to Stream</Text>}
          </TouchableOpacity>
        ) : (
          <View style={styles.btnRow}>
            {result.state === 'DONE' && !hasSaved ? (
              <TouchableOpacity style={[styles.primaryBtn, { flex: 2, backgroundColor: COLORS.success }]} onPress={saveAssessment} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Save Results</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset}>
                <RefreshCw size={20} color={COLORS.primary} />
                <Text style={styles.secondaryBtnText}>{hasSaved ? 'New' : 'Reset'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: hasSaved ? COLORS.primary : COLORS.error }]} onPress={disconnectWS}>
              <Text style={styles.primaryBtnText}>{hasSaved ? 'Finish' : 'Stop'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.accentMuted },
  statusLive: { backgroundColor: COLORS.success },
  statusOffline: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 10, fontWeight: '800', color: COLORS.muted },
  subTitle: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  cameraContainer: { marginHorizontal: SPACING.md, flex: 1, backgroundColor: '#000', borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
  annotatedFrame: { ...StyleSheet.absoluteFillObject },
  cameraPlaceholder: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  waitOverlay: { alignItems: 'center', gap: 16 },
  waitText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 40 },
  instructionBox: { position: 'absolute', bottom: 24, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.8)', padding: 16, borderRadius: RADIUS.md },
  instructionText: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  romResultBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOWS.sm },
  romResultValue: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  romResultLabel: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  controls: { padding: SPACING.lg },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 18, borderRadius: RADIUS.md },
  secondaryBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },

  // Locked State Styles
  lockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  lockCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.accentMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...SHADOWS.md },
  lockedTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  lockedDesc: { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  lockStatsCards: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  lockStatCard: { backgroundColor: COLORS.surface, paddingHorizontal: 24, paddingVertical: 20, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm, minWidth: 140 },
  lockStatValue: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  lockStatLabel: { fontSize: 10, fontWeight: '700', color: COLORS.muted, marginTop: 4, letterSpacing: 1 },
});

export default ROMCheckScreen;
