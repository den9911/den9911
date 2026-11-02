import {test} from 'node:test';
import assert from 'node:assert/strict';
import {series} from '../../docs/activity.js';
test('UTC series respects selected period, empty days and repository filter',()=>{
 const d={as_of:'2026-11-02',repositories:{one:{commits:[{date:'2026-11-02T23:00:00Z'},{date:'2026-11-01T00:00:00Z'},{date:'2026-10-01T00:00:00Z'}]},two:{commits:[{date:'2026-11-02T00:00:00Z'}]}}};
 assert.deepEqual(series(d,2),[{date:'2026-11-01',count:1},{date:'2026-11-02',count:2}]);
 assert.equal(series(d,14,'one').reduce((s,r)=>s+r.count,0),2);
 assert.equal(series(d,90).reduce((s,r)=>s+r.count,0),4);
 assert.equal(series(d,14,'unknown').reduce((s,r)=>s+r.count,0),0);
});
