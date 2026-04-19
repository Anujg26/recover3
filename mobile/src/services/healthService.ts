export interface HealthData {
  steps: number;
  sleepMinutes: number;
  hrv: number;
  restingHeartRate: number;
  activeCalories: number;
}

export const HealthService = {
  syncAppleHealth: async (): Promise<HealthData> => {
    console.log('[HealthService] Syncing with Apple HealthKit...');
    // Mocking a successful sync
    return {
      steps: 8240,
      sleepMinutes: 442,
      hrv: 58,
      restingHeartRate: 62,
      activeCalories: 340
    };
  },

  syncStrava: async (): Promise<any> => {
    console.log('[HealthService] Fetching activities from Strava...');
    return [
      { type: 'Run', distance: 5000, duration: 1540, date: new Date().toISOString() }
    ];
  },

  getRecoveryContext: (data: HealthData) => {
    // Logic to update recovery score based on context
    // This feeds into the score engine
    if (data.hrv < 50) return { factor: 'HRV', status: 'strained', recommendation: 'Increase breathwork' };
    return { factor: 'Sleep', status: 'optimal', recommendation: 'Baseline maintained' };
  }
};
