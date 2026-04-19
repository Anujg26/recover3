import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Zap, Heart, Flame, Clock, CheckCircle2, Circle, Info, X, BarChart2, Lock, Layers } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasks } from '../context/TaskContext';
import { useRole } from '../context/RoleContext';

interface Task {
  id: string;
  time: string;
  title: string;
  category: string;
  duration: string;
  required: boolean;
  description: string;
  instructions: string[];
}

const HomeScreen = ({ navigation }: any) => {
  const { tasks, completedTasks, toggleTask, isAllComplete, progress } = useTasks();
  const { toggleRole } = useRole();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const currentProgress = progress;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Alex</Text>
            <Text style={styles.subGreeting}>Time for your morning mobility.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.accentMuted, padding: 8, borderRadius: RADIUS.md }} 
              onPress={toggleRole}
            >
              <Layers size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.profileBadge}>
              <Text style={styles.levelText}>LVL 12</Text>
            </View>
          </View>
        </View>

        {/* Recovery Score Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.scoreCard}
        >
          <View style={styles.scoreHeader}>
            <View style={styles.statItem}>
              <Flame size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>14</Text>
              <Text style={styles.statLabel}>STREAK</Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>2,450</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>

          <View style={styles.mainScoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreGrade}>B+</Text>
              <Text style={styles.scoreValue}>82</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>Recovery Score</Text>
              <Text style={styles.scoreDesc}>You're improving! Your shoulder mobility is up 5% since last session.</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Log')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Heart size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>Log Recovery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Progress')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
              <BarChart2 size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Session Alert */}
        <View style={styles.upcomingAlert}>
          <Info size={20} color={COLORS.primary} />
          <Text style={styles.upcomingAlertText}>Your Hydrawav3 session in 2 days!</Text>
        </View>

        {/* Interactive Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Track</Text>
              <Text style={styles.progressSubtext}>{completedTasks.length}/{tasks.length} tasks completed</Text>
            </View>
            <View style={styles.miniProgressContainer}>
              <View style={[styles.miniProgressBar, { width: `${currentProgress}%` }]} />
            </View>
          </View>

          {tasks.map(task => {
            const isDone = completedTasks.includes(task.id);
            return (
              <TouchableOpacity 
                key={task.id} 
                style={[styles.taskCard, isDone ? styles.taskCardDone : {}]}
                onPress={() => toggleTask(task.id)}
              >
                <View style={styles.taskIconContainer}>
                  {isDone ? <CheckCircle2 size={24} color={COLORS.success} /> : <Circle size={24} color={COLORS.primary} />}
                </View>
                <View style={styles.taskDetails}>
                  <Text style={[styles.taskTime, isDone && { color: COLORS.success }]}>{task.time} {task.required ? '• REQUIRED' : ''}</Text>
                  <Text style={[styles.taskTitle, isDone && styles.textDone]}>{task.title}</Text>
                  <Text style={styles.taskDuration}>{task.duration} • {task.category.toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={styles.infoBtn} onPress={() => setSelectedTask(task)}>
                  <Info size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ROM Check Banner (Gated) */}
        <TouchableOpacity 
          style={[styles.romBanner, !isAllComplete && styles.romBannerLocked]}
          onPress={() => isAllComplete && navigation.navigate('ROM')}
          activeOpacity={isAllComplete ? 0.7 : 1}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.romTitle, !isAllComplete && { color: COLORS.muted }]}>
                {isAllComplete ? 'ROM Check-in Due' : 'Check-in Locked'}
              </Text>
              {!isAllComplete && <Lock size={16} color={COLORS.muted} />}
            </View>
            <Text style={[styles.romDesc, !isAllComplete && { color: COLORS.muted }]}>
              {isAllComplete ? 'Update your shoulder mobility baseline.' : 'Complete all daily rituals to unlock.'}
            </Text>
          </View>
          <View style={[styles.romBtn, !isAllComplete && { backgroundColor: COLORS.border }]}>
            <Text style={[styles.romBtnText, !isAllComplete && { color: COLORS.muted }]}>
              {isAllComplete ? 'Start Check-in' : 'Locked'}
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* Task Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedTask !== null}
        onRequestClose={() => setSelectedTask(null)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setSelectedTask(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCategoryBadge}>
                <Text style={styles.modalCategoryText}>{selectedTask?.category.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <X size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Why it matters</Text>
              <Text style={styles.modalDescription}>{selectedTask?.description}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Instructions</Text>
              {selectedTask?.instructions.map((step, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={styles.stepBullet}><Text style={styles.stepBulletText}>{i + 1}</Text></View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setSelectedTask(null)}
            >
              <Text style={styles.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.sm },
  greeting: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  subGreeting: { fontSize: 16, color: COLORS.muted },
  profileBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  levelText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  scoreCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md },
  scoreHeader: { flexDirection: 'row', justifyContent: 'flex-start', gap: 32, marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { color: 'white', fontSize: 20, fontWeight: '700', },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' },
  mainScoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  scoreGrade: { color: COLORS.accent, fontSize: 28, fontWeight: '800' },
  scoreValue: { color: 'white', fontSize: 14, fontWeight: '600' },
  scoreInfo: { flex: 1 },
  scoreTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  scoreDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
  quickActions: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  actionBtn: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  progressSubtext: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginTop: 2 },
  miniProgressContainer: { width: 100, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  miniProgressBar: { height: '100%', backgroundColor: COLORS.success },
  upcomingAlert: { flexDirection: 'row', backgroundColor: COLORS.accentMuted, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', gap: 12, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.accent },
  upcomingAlertText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  taskCard: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  taskCardDone: { opacity: 0.6, backgroundColor: '#F9FAFB', borderColor: 'transparent' },
  taskIconContainer: { marginRight: 16 },
  taskDetails: { flex: 1 },
  taskTime: { fontSize: 10, fontWeight: '700', color: COLORS.muted, marginBottom: 2 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  textDone: { textDecorationLine: 'line-through', color: COLORS.muted },
  taskDuration: { fontSize: 12, color: COLORS.muted },
  infoBtn: { padding: 8 },
  romBanner: { backgroundColor: COLORS.accentMuted, padding: SPACING.lg, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent, marginBottom: 40 },
  romBannerLocked: { backgroundColor: '#F3F4F6', borderColor: COLORS.border, opacity: 0.8 },
  romTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  romDesc: { fontSize: 14, color: COLORS.primary, opacity: 0.7 },
  romBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md },
  romBtnText: { color: 'white', fontWeight: '600' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,10,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 24, width: '100%', ...SHADOWS.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalCategoryBadge: { backgroundColor: COLORS.accentMuted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  modalCategoryText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  modalSection: { marginBottom: 24 },
  modalSectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', marginBottom: 12 },
  modalDescription: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  stepBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center' },
  stepBulletText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  closeBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});

export default HomeScreen;
