/* ============================================
   BiteBalance Utility Helpers
   ============================================ */

export const healthQuotes = [
  "Small healthy choices create big results.",
  "Your daily meals shape your future energy.",
  "Progress, not perfection.",
  "Health is built one meal at a time.",
  "Eat to nourish, not just to satisfy.",
  "To eat is a necessity, but to eat intelligently is an art.",
  "Every bite you take is either feeding disease or fighting it.",
  "Nourishing your body is a form of self-respect."
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * healthQuotes.length);
  return healthQuotes[index];
}

export function getScoreColor(score) {
  if (score >= 80) return 'var(--score-excellent)';
  if (score >= 65) return 'var(--score-good)';
  if (score >= 50) return 'var(--score-moderate)';
  if (score >= 35) return 'var(--score-poor)';
  return 'var(--score-bad)';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 35) return 'Needs Work';
  return 'Unhealthy';
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function formatFullDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function getTodayDateString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset*60*1000));
  return localDate.toISOString().split('T')[0];
}

export function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
