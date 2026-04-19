export type DeviceCommand = 'START' | 'STOP' | 'PAUSE' | 'RESUME' | 'SET_INTENSITY';

export interface Hydrawav3Command {
  command: DeviceCommand;
  payload?: any;
  timestamp: string;
}

export const publishDeviceCommand = async (deviceId: string, command: DeviceCommand, payload?: any) => {
  const body: Hydrawav3Command = {
    command,
    payload,
    timestamp: new Date().toISOString()
  };

  console.log(`[Hydrawav3] Sending ${command} to device ${deviceId}`, body);

  // In a real implementation:
  // const response = await fetch('/api/v1/mqtt/publish', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     topic: `devices/${deviceId}/commands`,
  //     payload: JSON.stringify(body)
  //   })
  // });
  // return response.json();

  // Mock response
  return { success: true, message: 'Command queued' };
};

export const deviceCommands = {
  startSession: (deviceId: string) => publishDeviceCommand(deviceId, 'START'),
  stopSession: (deviceId: string) => publishDeviceCommand(deviceId, 'STOP'),
  pauseSession: (deviceId: string) => publishDeviceCommand(deviceId, 'PAUSE'),
  resumeSession: (deviceId: string) => publishDeviceCommand(deviceId, 'RESUME'),
  setIntensity: (deviceId: string, level: number) => publishDeviceCommand(deviceId, 'SET_INTENSITY', { level }),
};
