(function (root) {
  'use strict';
  const executives = [
    { id: 'alex', name: 'Alex Morgan', initials: 'AM', letter: 'A' },
    { id: 'jordan', name: 'Jordan Ellis', initials: 'JE', letter: 'B' },
    { id: 'sam', name: 'Sam Rivera', initials: 'SR', letter: 'C' },
    { id: 'casey', name: 'Casey Brooks', initials: 'CB', letter: 'D' }
  ];
  function rng(seed) {
    let value = seed >>> 0;
    return function () {
      value = (value + 0x6D2B79F5) >>> 0;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function simulate(seed, films, advantage) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new RangeError('Seed must be an unsigned 32-bit integer.');
    if (!Number.isInteger(films) || films < 1 || films > 1000) throw new RangeError('Film count must be an integer between 1 and 1000.');
    if (!Number.isFinite(advantage) || advantage < 0 || advantage > 0.5) throw new RangeError('Advantage must be between 0 and 0.5.');
    return executives.map((executive, index) => {
      const random = rng((seed + Math.imul(index + 1, 2654435761)) >>> 0);
      const probability = 0.5 + (index === 0 ? advantage : 0);
      const outcomes = Array.from({ length: films }, () => Number(random() < probability));
      const hits = outcomes.reduce((a, b) => a + b, 0);
      return { ...executive, probability, outcomes, films, hits, rate: hits / films };
    });
  }
  function leaders(results) {
    const maximum = Math.max(...results.map(result => result.hits));
    return results.filter(result => result.hits === maximum);
  }
  function simulateMany(seed, films, advantage, count = 1000) {
    if (!Number.isInteger(count) || count < 1 || count > 10000) throw new RangeError('History count must be between 1 and 10000.');
    const wins = Object.fromEntries(executives.map(executive => [executive.id, 0]));
    let ties = 0;
    const histories = [];
    for (let i = 0; i < count; i++) {
      const historySeed = (seed + 0x9E3779B9 + Math.imul(i + 1, 2246822519)) >>> 0;
      const results = simulate(historySeed, films, advantage);
      const first = leaders(results);
      if (first.length === 1) wins[first[0].id]++;
      else ties++;
      histories.push({ seed: historySeed, results });
    }
    return { wins, ties, count, histories };
  }
  const api = { executives, rng, simulate, leaders, simulateMany };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LuckLab = api;
})(typeof window !== 'undefined' ? window : globalThis);
