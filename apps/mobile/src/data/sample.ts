// Sample content for the Today reader (ported from the prototype's KF_ARTICLE).
// Replaced by server-personalized content from Phase A4 onward.
export const SAMPLE_ARTICLE = {
  topic: 'Finance',
  subtopic: 'Compound Interest',
  day: 12,
  readTime: 4,
  difficulty: 'Medium' as const,
  body: [
    `Albert Einstein reportedly called compound interest "the eighth wonder of the world." Whether he actually said it is debatable — but the sentiment endures because the mathematics behind it is genuinely remarkable.`,
    `Compound interest means earning returns not just on your original principal, but on all previously accumulated interest. The effect starts slowly, almost imperceptibly, then accelerates. A single investment, left untouched, can double, triple, grow tenfold — not because of any dramatic intervention, but simply because time passes.`,
    `Consider two investors. The first invests $10,000 at age 25 and never adds another dollar. The second waits until 35 to invest the same amount. By retirement at 65, assuming an 8% annual return, the first investor ends with roughly $217,000. The second ends with just over $100,000. Ten years of waiting costs them more than half their wealth.`,
    `The principle extends beyond money. Skills compound. Knowledge compounds. Reputation compounds. Every page you read today makes the next page slightly easier to understand. Every conversation you have sharpens your ability to have the next one.`,
    `What compound interest teaches us, ultimately, is a lesson about patience and consistency. The dramatic results arrive at the end, not the beginning. Most of the growth happens in the final years, not the first ones. This is why so many people underestimate it — we're wired to expect linear progress, and compounding is anything but linear.`,
  ],
};

export const SAMPLE_QUIZ = [
  {
    type: 'mc' as const,
    q: 'What does "compound interest" mean?',
    opts: [
      'Interest earned only on the principal',
      'Interest earned on principal AND prior interest',
      'A fixed monthly payment',
      'Government bond yields',
    ],
    correct: 1,
  },
  {
    type: 'mc' as const,
    q: 'Two investors each invest $10,000. One starts at 25, one at 35. At retirement, who has more?',
    opts: [
      'The one who started at 35',
      'They end up equal',
      'The one who started at 25',
      'It depends on the rate',
    ],
    correct: 2,
  },
  {
    type: 'open' as const,
    q: 'What surprised you most about compound interest?',
    placeholder: 'Type your thoughts…',
  },
];

export const SAMPLE_BRANCHES = [
  { id: 'b1', title: 'The Rule of 72', desc: 'A mental shortcut for estimating how long it takes money to double.' },
  { id: 'b2', title: 'Inflation & Real Returns', desc: 'Why purchasing power matters more than the number on your statement.' },
  { id: 'b3', title: 'Index Funds', desc: 'How passive investing harnesses compound returns without stock-picking.' },
  { id: 'b4', title: 'Psychology of Saving', desc: 'Why we struggle to delay gratification, and systems that help.' },
  { id: 'b5', title: 'Debt Compounding', desc: 'How the same mathematics that builds wealth can trap borrowers.' },
];

export type TrailNode = { id: string; topic: string; label: string; day?: number; isCurrent?: boolean; isNext?: boolean };
export const TRAIL: TrailNode[] = [
  { id: 't0', topic: 'Finance', label: 'Introduction to Finance', day: 1 },
  { id: 't1', topic: 'Finance', label: 'Time Value of Money', day: 3 },
  { id: 't2', topic: 'Finance', label: 'Compound Interest', day: 12, isCurrent: true },
  { id: 't3', topic: 'Finance', label: 'The Rule of 72', isNext: true },
];

export type GraphNode = { id: string; label: string; topic: string; x: number; y: number; day?: number; read?: boolean; current?: boolean; next?: boolean };
export const GRAPH_NODES: GraphNode[] = [
  { id: 'n1', label: 'Intro to Finance', topic: 'Finance', x: 300, y: 220, day: 1, read: true },
  { id: 'n2', label: 'Time Value of Money', topic: 'Finance', x: 370, y: 300, day: 3, read: true },
  { id: 'n3', label: 'Compound Interest', topic: 'Finance', x: 290, y: 380, day: 12, read: true, current: true },
  { id: 'n4', label: 'The Rule of 72', topic: 'Finance', x: 370, y: 460, next: true },
  { id: 'n5', label: 'How the Internet Works', topic: 'Technology', x: 160, y: 200, day: 5, read: true },
  { id: 'n6', label: 'Machine Learning Basics', topic: 'Technology', x: 100, y: 290, day: 8, read: true },
  { id: 'n7', label: "Plato's Cave", topic: 'Philosophy', x: 490, y: 200, day: 7, read: true },
];
export const GRAPH_EDGES: [string, string][] = [['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n5', 'n6'], ['n1', 'n5']];
export const TOPIC_COLORS: Record<string, string> = { Finance: '#4A7C6F', Technology: '#5B7BA8', Philosophy: '#8A6BA8' };

export const HIGHLIGHTS = [
  { id: 'h1', quote: 'Skills compound. Knowledge compounds. Reputation compounds.', article: 'Compound Interest', topic: 'Finance', date: 'Today' },
  { id: 'h2', quote: 'The dramatic results arrive at the end, not the beginning.', article: 'Compound Interest', topic: 'Finance', date: 'Today' },
  { id: 'h3', quote: 'The definition of insanity is doing the same thing over and over again and expecting a different result.', article: 'Cognitive Biases', topic: 'Psychology', date: '3 days ago' },
  { id: 'h4', quote: 'Money is a tool. It will take you wherever you wish, but it will not replace you as the driver.', article: 'Time Value of Money', topic: 'Finance', date: '1 week ago' },
];

export type Friend = { name: string; articles: number; streak: number; isYou?: boolean };
export const FRIENDS: Friend[] = [
  { name: 'You', articles: 12, streak: 12, isYou: true },
  { name: 'Amara K.', articles: 19, streak: 23 },
  { name: 'Luis P.', articles: 15, streak: 7 },
  { name: 'Priya M.', articles: 11, streak: 5 },
  { name: 'Tom R.', articles: 8, streak: 3 },
];

export const BADGES = [
  { label: 'Finance Explorer', note: '10 articles deep', emoji: '📈' },
  { label: 'Day 12 Streak', note: 'Keep going!', emoji: '🔥' },
];
