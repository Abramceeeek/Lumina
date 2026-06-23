import { ingest } from './ingest.js';

const r = await ingest();
console.log(`Ingest complete — fetched ${r.fetched}, inserted ${r.inserted} new raw items.`);
