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
