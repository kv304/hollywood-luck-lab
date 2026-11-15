(function(root) {
  'use strict';
  function probability(model, budget, year) {
    if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(year)) throw new RangeError('A positive budget and valid year are required.');
    const values = [Math.log(budget), year];
    const z = model.weights[0] + values.reduce((sum,v,i) => sum + model.weights[i+1] * (v-model.mean[i])/model.scale[i],0);
    return 1 / (1 + Math.exp(-Math.max(-40,Math.min(40,z))));
  }
  function score(p, outcome) {
    if (!Number.isFinite(p) || p < 0 || p > 1 || ![0,1].includes(outcome)) throw new RangeError('Invalid forecast or outcome.');
    return 100 * (1 - (p - outcome) ** 2);
  }
  function shuffle(rows, seed) {
    let state = seed >>> 0;
    const result = rows.slice();
    for(let i=result.length-1;i>0;i--) {
      state = (Math.imul(state,1664525)+1013904223)>>>0;
      const j = Math.floor((state / 4294967296)*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function wilson(hits, n) {
    if (!Number.isInteger(hits) || !Number.isInteger(n) || n < 1 || hits < 0 || hits > n) throw new RangeError('Invalid counts.');
    const z = 1.96, p = hits/n, d=1+z*z/n;
    const center=(p+z*z/(2*n))/d;
    const margin=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
    return [center-margin,center+margin];
  }
  function calibrationBand(bins, p) {
    if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError('Invalid probability.');
    return bins.find(bin=>p>=bin.low && (p<bin.high || (bin.high===1 && p===1))) || null;
  }
  const api={probability,score,shuffle,wilson,calibrationBand};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.ForecastLab=api;
})(typeof window!=='undefined'?window:globalThis);
