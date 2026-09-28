/**
 * Achievement catalog shared by the dashboard, the achievements modal and the
 * toast system (so toasts always show a human label, never a raw id).
 */
export const ACHIEVEMENTS: Record<string, { icon: string; label: string; hint: string }> = {
  'first-lesson': { icon: 'grad', label: 'First Steps', hint: 'Complete your first lesson' },
  'ten-lessons': { icon: 'flame', label: 'On Fire', hint: 'Complete 10 lessons' },
  'fifty-lessons': { icon: 'bolt', label: 'Unstoppable', hint: 'Complete 50 lessons' },
  centurion: { icon: 'sparkles', label: 'Centurion', hint: 'Complete 100 lessons' },
  graduate: { icon: 'crown', label: 'Graduate', hint: 'Complete every lesson on the platform' },
  'streak-3': { icon: 'calendar', label: 'Habit Forming', hint: 'Learn 3 days in a row' },
  'streak-7': { icon: 'calendar-check', label: 'Week Warrior', hint: 'Learn 7 days in a row' },
  'streak-30': { icon: 'trophy', label: 'Iron Routine', hint: 'Learn 30 days in a row' },
  'quiz-5': { icon: 'brain', label: 'Sharp Mind', hint: 'Ace 5 quizzes perfectly' },
  'quiz-20': { icon: 'brain', label: 'Encyclopedia', hint: 'Ace 20 quizzes perfectly' },
}
