import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Flame, Droplets, Wind, Footprints, Moon, Dumbbell, Timer, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '../services/supabase';

const DEMO_PATIENT_ID = 'de00dead-0000-4000-a000-000000000000';

const LogScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const recoveryTypes = [
    { label: 'Stretch', icon: <Flame size={20} color="#EF4444" />, bg: '#FEE2E2', value: 'stretch' },
    { label: 'Sauna', icon: <Flame size={20} color="#F59E0B" />, bg: '#FEF3C7', value: 'sauna' },
    { label: 'Cold Tub', icon: <Droplets size={20} color="#0EA5E9" />, bg: '#E0F2FE', value: 'cold_tub' },
    { label: 'Breathwork', icon: <Wind size={20} color="#10B981" />, bg: '#D1FAE5', value: 'breathwork' },
    { label: 'Walk', icon: <Footprints size={20} color="#6366F1" />, bg: '#E0E7FF', value: 'walk' },
    { label: 'Rest', icon: <Moon size={20} color="#6B7280" />, bg: '#F3F4F6', value: 'rest' },
  ];

  const activityTypes = [
    { label: 'Lift', icon: <Dumbbell size={20} color={COLORS.text} />, value: 'lift' },
    { label: 'Cardio', icon: <Timer size={20} color={COLORS.text} />, value: 'cardio' },
    { label: 'Sport', icon: <Timer size={20} color={COLORS.text} />, value: 'sport' },
  ];

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please select a recovery behavior first.');
      return;
    }

    setLoading(true);
    try {
      // Mapping activity context into notes since it's not in the recovery_logs schema
      const finalNotes = selectedActivity
        ? `[Workout: ${selectedActivity.toUpperCase()}] ${notes}`
        : notes;

      const { error } = await supabase.from('recovery_logs').insert({
        patient_id: DEMO_PATIENT_ID,
        activity_type: selectedType, // Changed from recovery_type
        duration_minutes: duration ? parseInt(duration) : null, // Changed from duration
        notes: finalNotes,
        logged_at: new Date().toISOString(), // Changed from created_at
      });

      if (error) throw error;

      // Trigger AI Summary Refresh (Background)
      // Using localhost for iOS Simulator connectivity
      fetch(`http://localhost:8000/api/ai/refresh/${DEMO_PATIENT_ID}`, {
        method: 'POST',
      }).catch(err => console.log('AI Refresh Trigger Silently Failed:', err));

      Alert.alert('Success', 'Recovery log saved successfully!', [
        { text: 'View History', onPress: () => navigation.navigate('Progress') }
      ]);

      // Reset form
      setSelectedType(null);
      setSelectedActivity(null);
      setDuration('');
      setNotes('');

    } catch (err: any) {
      console.error('Save error:', err);
      Alert.alert('Save Failed', err.message || 'Could not save the log. Check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Log Recovery</Text>
        <Text style={styles.subTitle}>Select a recovery behavior you performed today.</Text>

        <View style={styles.grid}>
          {recoveryTypes.map((item, i) => {
            const isSelected = selectedType === item.value;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.logItem, isSelected && styles.selectedItem]}
                onPress={() => setSelectedType(item.value)}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                  {item.icon}
                </View>
                <Text style={styles.logLabel}>{item.label}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <CheckCircle2 size={14} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <TextInput
            style={styles.input}
            placeholder="Duration (minutes)"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor={COLORS.muted}
          />
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Notes (e.g. how did you feel?)"
            multiline={true}
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Context (Optional)</Text>
          <View style={styles.activityRow}>
            {activityTypes.map((type, i) => {
              const isSelected = selectedActivity === type.value;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.activityBtn, isSelected && styles.selectedActivityBtn]}
                  onPress={() => setSelectedActivity(isSelected ? null : type.value)}
                >
                  {type.icon}
                  <Text style={[styles.activityLabel, isSelected && { color: COLORS.white }]}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Save Log</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  subTitle: { fontSize: 16, color: COLORS.muted, marginBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  logItem: { width: '30%', aspectRatio: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm, position: 'relative' },
  selectedItem: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: '#F0F9FF' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  checkBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: COLORS.primary, borderRadius: 10, padding: 2 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 16 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 16, fontSize: 16, marginBottom: 12, color: COLORS.text },
  activityRow: { flexDirection: 'row', gap: 12 },
  activityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  selectedActivityBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  activityLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  submitBtn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 20, marginBottom: 40, ...SHADOWS.sm },
  submitText: { color: 'white', fontSize: 18, fontWeight: '700' }
});

export default LogScreen;
