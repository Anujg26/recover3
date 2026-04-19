export const mockPatients = [
  {
    id: '1',
    full_name: 'Alex Rivera',
    recovery_score: 82,
    recovery_grade: 'B',
    adherence: 94,
    status: 'Recovering',
    last_session: '2 days ago',
    next_session: 'Tomorrow, 10:00 AM',
    zones: { shoulder: 'yellow', knee: 'green', back: 'red' }
  },
  {
    id: '2',
    full_name: 'Jordan Smith',
    recovery_score: 65,
    recovery_grade: 'D',
    adherence: 42,
    status: 'Stalled',
    last_session: '1 week ago',
    next_session: 'Today, 2:30 PM',
    zones: { shoulder: 'red', knee: 'yellow', back: 'yellow' }
  },
  {
    id: '3',
    full_name: 'Sarah Chen',
    recovery_score: 92,
    recovery_grade: 'A',
    adherence: 98,
    status: 'Stable',
    last_session: '3 days ago',
    next_session: 'Apr 22, 11:30 AM',
    zones: { shoulder: 'green', knee: 'green', back: 'green' }
  }
];

export const mockAdherence = [
  { day: 'Mon', percentage: 90 },
  { day: 'Tue', percentage: 85 },
  { day: 'Wed', percentage: 95 },
  { day: 'Thu', percentage: 70 },
  { day: 'Fri', percentage: 88 },
  { day: 'Sat', percentage: 92 },
  { day: 'Sun', percentage: 98 },
];
