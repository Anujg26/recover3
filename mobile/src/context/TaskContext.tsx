import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  time: string;
  title: string;
  category: string;
  duration: string;
  required: boolean;
  description: string;
  instructions: string[];
}

interface TaskContextType {
  tasks: Task[];
  completedTasks: string[];
  toggleTask: (id: string) => void;
  isAllComplete: boolean;
  progress: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>(['task-2']); // Start with one for demo flavor

  const tasks: Task[] = [
    { 
      id: 'task-1', 
      time: 'MORNING', 
      title: 'Controlled Articular Rotations', 
      category: 'mobility', 
      duration: '5 min', 
      required: true,
      description: 'CARs are active, rotational movements at the outer limits of a joint\'s range of motion. They help maintain joint health and improve longevity.',
      instructions: [
        'Stand tall and root yourself to the ground.',
        'Slowly rotate the joint in its largest possible circle.',
        'Move through any tension, but avoid sharp pain.',
        'Complete 3-5 slow circles in each direction.'
      ]
    },
    { 
      id: 'task-2', 
      time: 'MORNING', 
      title: 'Hydration Reset', 
      category: 'recovery', 
      duration: '2 min', 
      required: false,
      description: 'Proper hydration with electrolytes is essential for tissue elasticity and effective cellular recovery after sleep.',
      instructions: [
        'Drink 16-20 oz of filtered water.',
        'Add a pinch of sea salt or electrolyte powder.',
        'Sip slowly to ensure optimal absorption.'
      ]
    },
    { 
      id: 'task-3', 
      time: 'PRE-WORKOUT', 
      title: 'Shoulder Activation', 
      category: 'mobility', 
      duration: '8 min', 
      required: true,
      description: 'Priming the shoulder joint ensures proper motor recruitment and reduces the risk of injury during high-intensity load.',
      instructions: [
        'Perform 15 repetitions of "Scapular Pulls".',
        'Use a light resistance band for "External Rotations".',
        'Finish with 10 slow "YTI" movements.'
      ]
    },
    { 
      id: 'task-4', 
      time: 'POST-WORKOUT', 
      title: 'Cold Plunge', 
      category: 'recovery', 
      duration: '3 min', 
      required: true,
      description: 'Cold exposure triggers a systemic anti-inflammatory response and accelerates muscle recovery by stimulating blood flow.',
      instructions: [
        'Submerge yourself in water between 45-55°F.',
        'Focus on slow, rhythmic breathing to stay calm.',
        'Maintain exposure for 2-3 minutes for maximum effect.'
      ]
    },
    { 
      id: 'task-6', 
      time: 'EVENING', 
      title: 'Box Breathing', 
      category: 'breathwork', 
      duration: '10 min', 
      required: true,
      description: 'Box breathing is a powerful stress-management technique that shifts the body from "Fight or Flight" to "Rest and Digest" mode.',
      instructions: [
        'Inhale deeply for 4 seconds.',
        'Hold your breath for 4 seconds.',
        'Exhale completely for 4 seconds.',
        'Hold empty for 4 seconds, then repeat.'
      ]
    },
  ];

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const isAllComplete = completedTasks.length === tasks.length;
  const progress = (completedTasks.length / tasks.length) * 100;

  return (
    <TaskContext.Provider value={{ tasks, completedTasks, toggleTask, isAllComplete, progress }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
