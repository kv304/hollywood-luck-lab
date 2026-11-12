const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probability,score,shuffle,wilson}=require('../public/forecast.js');
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/model-report.json'),'utf8'));
const movies=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/movies.json'),'utf8'));
for(const row of movies)for(const [key,model] of Object.entries(report.models)){
  assert.ok(Math.abs(probability(model,row.budget,row.year)-row.legacyProbabilities[key])<1e-8);
}
assert.equal(score(1,1),100);assert.equal(score(0,0),100);assert.equal(score(1,0),0);assert.equal(score(.5,1),75);
assert.throws(()=>score(1.1,1),RangeError);assert.throws(()=>score(.5,3),RangeError);assert.throws(()=>probability(report.models['2.5'],0,2012),RangeError);
const rows=[1,2,3,4,5];assert.deepEqual(shuffle(rows,12),shuffle(rows,12));assert.deepEqual(rows,[1,2,3,4,5]);assert.deepEqual([...shuffle(rows,12)].sort(),rows);
const [low,high]=wilson(50,100);assert.ok(low<.5&&high>.5&&low>0&&high<1);assert.throws(()=>wilson(2,1),RangeError);
assert.ok(wilson(100,100)[0]>.95);assert.ok(wilson(0,100)[1]<.05);
console.log(`Forecast checks passed; ${movies.length*3} legacy baseline probabilities independently verified.`);
