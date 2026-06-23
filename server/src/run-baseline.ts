import { buildBaselines } from './baseline.js';

const r = await buildBaselines();
console.log(`Baselines complete — created ${r.created} baseline articles.`);
