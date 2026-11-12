(() => {
  'use strict';
  const { executives, simulate, leaders, simulateMany } = window.LuckLab;
  const $ = id => document.getElementById(id);
  const initialSeed = 1627;
  let roundSeed = initialSeed;
  let historySeed = initialSeed;
  let selected = null;
  let revealed = false;
  let initialResults = simulate(roundSeed, 10, 0);
  let currentResults = initialResults;
  let batchResults = null;
  const percent = value => `${Math.round(value * 100)}%`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  function announce(text) { $('announcement').textContent = text; }
  function focusHeading(id) {
    const heading = $(id);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.closest('section').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  function renderCandidates() {
    $('candidates').innerHTML = initialResults.map(executive => `<button type="button" class="candidate ${selected === executive.id ? 'selected' : ''}" data-id="${executive.id}" aria-pressed="${selected === executive.id}" ${revealed ? 'disabled' : ''} aria-label="${executive.name}, ${executive.hits} hits out of 10 films. ${selected === executive.id ? 'Selected.' : 'Choose this executive.'}">
      <span class="candidate-top"><span class="monogram">${executive.initials}</span><span class="candidate-code">EXECUTIVE ${executive.letter}</span><span class="selection-dot" aria-hidden="true">${selected === executive.id ? '✓' : ''}</span></span>
      <span class="candidate-name">${executive.name}</span><span class="candidate-metric"><strong>${percent(executive.rate)}</strong><span>hit rate</span></span>
      <span class="film-strip" aria-hidden="true">${executive.outcomes.map(hit => `<i class="film ${hit ? 'hit' : 'miss'}"></i>`).join('')}</span><span class="record-description">${executive.hits} hits <span> / </span> ${10 - executive.hits} misses</span>
      <span class="candidate-bottom">${revealed ? selected === executive.id ? 'YOUR HIRE' : 'RECORD REVIEWED' : selected === executive.id ? 'SELECTED' : 'CHOOSE EXECUTIVE'}<span aria-hidden="true">${selected === executive.id ? '✓' : '↗'}</span></span></button>`).join('');
    document.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => {
      if (revealed) return;
      selected = button.dataset.id;
      const name = executives.find(executive => executive.id === selected).name;
      renderCandidates();
      const newButton = document.querySelector(`[data-id="${selected}"]`);
      newButton.focus({ preventScroll: true });
      $('hire').disabled = false;
      $('choice-status').textContent = `${name} is your pick.`;
    }));
  }
  function renderComparison(id, results) {
    $(id).innerHTML = results.map(executive => `<div class="comparison-row"><div class="comparison-label"><span>${executive.name}${selected === executive.id ? '<small>YOUR HIRE</small>' : ''}</span><strong>${executive.hits}/${executive.films} <span>${percent(executive.rate)}</span></strong></div><div class="bar-track" role="img" aria-label="${executive.name}: observed hit rate ${percent(executive.rate)}, underlying hit probability ${percent(executive.probability)}"><span class="observed-bar" style="width:${executive.rate * 100}%"></span><span class="probability-marker" style="left:${executive.probability * 100}%"></span></div><div class="probability-label">Underlying chance: ${percent(executive.probability)}</div></div>`).join('');
  }
  function settings() { return { films: Number($('films').value), advantage: Number($('advantage').value) / 100 }; }
  function updateLab() {
    const { films, advantage } = settings();
    $('films-value').textContent = films;
    $('advantage-value').textContent = `${Math.round(advantage * 100)} pp`;
    $('odds-description').textContent = advantage === 0 ? 'Everyone has a 50% chance of a hit per film.' : `Alex: ${percent(0.5 + advantage)} per film. Everyone else: 50%.`;
    $('seed-label').textContent = `REPRODUCIBLE HISTORY / ${historySeed}`;
    currentResults = simulate(historySeed, films, advantage);
    renderComparison('explore-chart', currentResults);
    const first = leaders(currentResults);
    const names = first.map(executive => executive.name).join(' and ');
    $('history-summary').textContent = first.length > 1 ? `${names} share the lead in this history. ${advantage === 0 ? 'Their underlying odds are identical.' : 'Alex has the highest underlying hit probability.'}` : `${names} leads this history with ${plural(first[0].hits, 'hit')}. ${advantage === 0 ? 'All four executives still have identical underlying odds.' : first[0].id === 'alex' ? 'Here, the stronger executive comes out ahead.' : 'Here, Alex’s underlying advantage does not produce the strongest record.'}`;
    batchResults = null;
    $('batch-result').innerHTML = '<p class="batch-placeholder">A standout record can feel convincing.<br>Let’s see how often it repeats.</p>';
    $('batch').textContent = 'Run 1,000 histories ↗';
  }
  $('confidence').addEventListener('input', () => { $('confidence-value').textContent = `${$('confidence').value}%`; });
  $('hire').addEventListener('click', () => {
    if (!selected || revealed) return;
    revealed = true;
    renderCandidates();
    $('confidence').disabled = true;
    $('hire').disabled = true;
    $('hire').textContent = 'Decision recorded ✓';
    $('choice-status').textContent = 'Your first impression is locked in for this round.';
    const executive = initialResults.find(result => result.id === selected);
    $('hiring-recap').textContent = `You chose ${executive.name} · ${executive.hits}/10 hits · ${$('confidence').value}% confidence`;
    $('reveal').hidden = false;
    renderComparison('reveal-chart', initialResults);
    focusHeading('reveal-title');
    announce(`You chose ${executive.name}. In the opening scenario, all executives had the same 50% chance of a hit on each film.`);
  });
  $('open-lab').addEventListener('click', () => {
    $('lab').hidden = false;
    updateLab();
    focusHeading('lab-title');
  });
  for (const id of ['films', 'advantage']) $(id).addEventListener('input', updateLab);
  $('replay').addEventListener('click', () => {
    historySeed = (historySeed + 2654435761) >>> 0;
    updateLab();
    announce(`New simulated history. ${$('history-summary').textContent}`);
  });
  $('batch').addEventListener('click', () => {
    const { films, advantage } = settings();
    batchResults = simulateMany(historySeed, films, advantage);
    const rows = [...executives.map(executive => ({ name: executive.name, count: batchResults.wins[executive.id], id: executive.id })), { name: 'Tied lead', count: batchResults.ties, id: 'ties' }];
    $('batch-result').innerHTML = `<p class="batch-summary">${advantage > 0 ? `<strong>${percent(batchResults.wins.alex / 1000)}</strong> of histories put Alex alone in first, with a ${Math.round(advantage * 100)}-point underlying advantage.` : 'Everyone has the same underlying ability. Here’s who happens to finish alone in first.'}</p><div class="win-chart">${rows.map(row => `<div class="win-row"><span>${row.name}</span><div class="win-track" role="img" aria-label="${row.name}: ${row.count} out of 1000 histories"><i style="width:${row.count / 10}%" class="${row.id === 'ties' ? 'tie-bar' : ''}"></i></div><strong>${(row.count / 10).toFixed(1)}%</strong></div>`).join('')}</div><p class="batch-footnote">1,000 histories · ${films} films per executive · each history counted once. Percentages are Monte Carlo estimates for this model.</p>`;
    $('batch').textContent = 'Recalculate these settings ↗';
    announce('1,000 histories calculated. The results include a separate category for tied leads.');
  });
  $('export').addEventListener('click', () => {
    const { films, advantage } = settings();
    const header = 'scenario,seed,executive,films,hits,observed_hit_rate,underlying_hit_probability,selected_in_hiring_round,confidence_percent';
    const encode = (scenario, seed, rows) => rows.map(result => [scenario, seed, result.name, result.films, result.hits, result.rate, result.probability, result.id === selected, $('confidence').value].join(','));
    const data = [header, ...encode('hiring_round', roundSeed, initialResults), ...encode('exploration', historySeed, currentResults)];
    if (batchResults) batchResults.histories.forEach(history => data.push(...encode('batch', history.seed, history.results)));
    const blob = new Blob([data.join('\n') + '\n'], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hollywood-luck-lab-${films}-films-${Math.round(advantage * 100)}pp.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    announce('Simulated data downloaded. No data was sent to a server.');
  });
  $('reset').addEventListener('click', () => {
    roundSeed = (roundSeed + 2246822519) >>> 0;
    historySeed = roundSeed;
    initialResults = simulate(roundSeed, 10, 0);
    currentResults = initialResults;
    selected = null;
    revealed = false;
    batchResults = null;
    $('films').value = '10'; $('advantage').value = '0';
    $('confidence').value = '50'; $('confidence').disabled = false;
    $('confidence-value').textContent = '50%';
    $('hire').disabled = true; $('hire').innerHTML = 'Make my hire <span aria-hidden="true">↗</span>';
    $('choice-status').textContent = 'Select an executive to continue.';
    $('reveal').hidden = true; $('lab').hidden = true;
    renderCandidates();
    focusHeading('choice-title');
  });
  renderCandidates();
})();
