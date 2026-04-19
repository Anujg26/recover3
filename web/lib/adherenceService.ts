import { mockPatients, mockAdherence } from './mockData';

export interface AdherenceSummary {
  patientId: string;
  period: string;
  adherenceRate: number;
  tasksCompleted: number;
  tasksRequired: number;
  tasksOptional: number;
  missedRequired: number;
  romImprovement: number;
  scoreTrend: number;
  topRecoveryBehaviors: string[];
  suggestedFocus: string;
}

export const getSinceLastSessionSummary = (patientId: string): AdherenceSummary => {
  // Logic to aggregate data from task_completions, recovery_logs, and rom_measurements
  // Mocking the result for the demo
  
  return {
    patientId,
    period: '7 days',
    adherenceRate: 85,
    tasksCompleted: 18,
    tasksRequired: 15,
    tasksOptional: 3,
    missedRequired: 2,
    romImprovement: 12.1,
    scoreTrend: 4,
    topRecoveryBehaviors: ['Sauna', 'Cold Plunge', 'Breathwork'],
    suggestedFocus: 'Increase frequency of post-workout cold therapy. Shoulder stability is improving but soreness remains high.'
  };
};
