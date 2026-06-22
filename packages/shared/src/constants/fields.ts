// 12 interest fields (mirrors the supabase `fields` seed + the prototype KF_TOPICS).
export const TOPICS = [
  { id: 'finance', label: 'Finance', emoji: '📈', color: '#4A7C6F' },
  { id: 'technology', label: 'Technology', emoji: '💻', color: '#5B7BA8' },
  { id: 'philosophy', label: 'Philosophy', emoji: '🧠', color: '#8A6BA8' },
  { id: 'science', label: 'Science', emoji: '🔬', color: '#5B98A8' },
  { id: 'history', label: 'History', emoji: '📜', color: '#A88B5B' },
  { id: 'psychology', label: 'Psychology', emoji: '🧩', color: '#A85B6B' },
  { id: 'literature', label: 'Literature', emoji: '📖', color: '#6B8A5B' },
  { id: 'economics', label: 'Economics', emoji: '🏛️', color: '#8A7B5B' },
  { id: 'art', label: 'Art & Design', emoji: '🎨', color: '#8A5B7B' },
  { id: 'health', label: 'Health', emoji: '🌿', color: '#5B8A6B' },
  { id: 'politics', label: 'Politics', emoji: '⚖️', color: '#7B5B8A' },
  { id: 'astronomy', label: 'Astronomy', emoji: '🌌', color: '#5B6B8A' },
] as const;

export type Topic = (typeof TOPICS)[number];
export type TopicId = Topic['id'];
