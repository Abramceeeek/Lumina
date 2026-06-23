import { synthesize } from './synthesize.js';

const r = await synthesize();
console.log(`Synthesis complete — created ${r.created} stories, skipped ${r.skipped} fields.`);
