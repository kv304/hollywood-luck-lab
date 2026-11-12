(() => {
  'use strict';
  const cases = [
    {
      id: 'lansing', number: '01', name: 'Sherry Lansing → Brad Grey', studio: 'PARAMOUNT / 2004–05', lens: 'The inherited slate',
      date: 'Pause the clock: November 2004',
      known: 'Paramount announces that Lansing plans to leave when her contract expires at the end of 2005. War of the Worlds is already on an accelerated schedule, co-financed with DreamWorks.',
      question: 'Would you expect War of the Worlds to reach $500 million worldwide?',
      event: 'War of the Worlds reached $500 million worldwide.',
      happened: true,
      timeline: [
        ['AUG 2004', 'In development', 'Spielberg and Cruise’s War of the Worlds is publicly reported to be moving toward production.'],
        ['JAN 2005', 'Leadership change', 'Brad Grey is hired to replace Lansing.'],
        ['2005 RELEASE', 'Released · about $604m worldwide', 'War of the Worlds exceeds the threshold. A release in a successor’s tenure can come from a project already underway.']
      ],
      lesson: 'The timeline challenges a simple before-and-after story. It does not establish who caused the film’s success or what would have happened if Lansing had stayed. The contemporary announcement describes a planned departure, so this case is not labeled a firing.',
      sources: [
        ['Departure announcement · Box Office Mojo, Nov 1, 2004', 'https://www.boxofficemojo.com/article/ed3782607876/'],
        ['Pre-departure production report · UPI, Aug 12, 2004', 'https://www.upi.com/Entertainment_News/2004/08/12/Spielberg-Cruise-set-for-War/93881092331939/'],
        ['Successor appointment · The Guardian, Jan 7, 2005', 'https://www.theguardian.com/film/2005/jan/07/business.news'],
        ['2005 worldwide grosses · Box Office Mojo', 'https://www.boxofficemojo.com/year/world/2005/']
      ]
    },
    {
      id: 'ross', number: '02', name: 'Rich Ross', studio: 'DISNEY / 2009–12', lens: 'A loss, a hit, an unmade film',
      date: 'Pause the clock: October 5, 2009',
      known: 'Ross replaces Dick Cook as Disney’s studio chairman after leading Disney Channels Worldwide. A planned Captain Nemo: 20,000 Leagues Under the Sea production is attached to director McG. You are considering the incoming chair’s slate, before its later results.',
      question: 'Would you expect Disney to keep McG’s Captain Nemo production moving that autumn?',
      event: 'Disney halted McG’s Captain Nemo production in November 2009.', happened: false,
      timeline: [
        ['SEP 2009', 'Predecessor ousted', 'Dick Cook is ousted as Disney’s studio chief.'],
        ['NOV 2009', 'Halted · McG’s Captain Nemo', 'Disney halts the planned Captain Nemo: 20,000 Leagues Under the Sea production; McG leaves the project. This specific version provides no released-film box-office result to evaluate.'],
        ['FEB 2011', 'Avengers already in the pipeline', 'At Disney’s investor conference, Marvel’s Kevin Feige describes an April production start and a planned May 2012 release for The Avengers.'],
        ['APR 2012', 'Ross departs', 'Ross steps down after John Carter. Contemporary reporting says that film and several earlier billion-dollar hits were greenlit under predecessor Dick Cook. Release-date credit can cut both ways.'],
        ['MAY 2012', 'Released · The Avengers', 'The US release follows Ross’s departure. The film ultimately grosses over $1.5 billion worldwide.'],
        ['MAY 2012', 'Studio results', 'Disney reports a quarterly studio operating loss of $84 million, primarily reflecting John Carter and its write-down. A later hit does not erase that reported loss.']
      ],
      lesson: 'A chair can inherit both successes and failures, while still influencing marketing and execution. The evidence does not isolate Ross’s contribution. For the halted Nemo version, we cannot observe whether making it would have produced a hit or a loss.',
      sources: [
        ['Chairmanship dates · D23 / Disney', 'https://d23.com/a-to-z/ross-rich/'],
        ['Nemo announced with McG · Animation World Network, Jan 7, 2009', 'https://www.awn.com/news/mcg-goes-20000-leagues-under-sea'],
        ['Departure and greenlight history · TheWrap, Apr 20, 2012', 'https://www.thewrap.com/rich-ross-out-walt-disney-studios-chairman-37166/'],
        ['Avengers plans · Disney investor conference, Feb 17, 2011 (PDF)', 'https://thewaltdisneycompany.com/app/uploads/ir/2011/events/ic/2011_Investor_Conference_Transcript_FINAL.pdf'],
        ['Film release and grosses · The Numbers', 'https://www.the-numbers.com/movie/Avengers-The-(2012)'],
        ['Quarterly results · Disney, May 8, 2012', 'https://thewaltdisneycompany.com/press-releases/y12-q2-earnings/'],
        ['Nemo production halted · ComingSoon, Nov 17, 2009', 'https://www.comingsoon.net/movies/news/60966-disney-halts-captain-nemo-20000-leagues-under-the-sea'],
        ['Cook’s ouster · Los Angeles Times, Nov 17, 2009', 'https://www.latimes.com/archives/blogs/company-town-blog/story/2009-11-17/new-disney-movie-chief-pulls-plug-on-costly-captain-nemo']
      ]
    },
    {
      id: 'horn', number: '03', name: 'Alan Horn + the Disney team', studio: 'DISNEY / 2012–19', lens: 'The counterweight: sustained success',
      date: 'Pause the clock: May 31, 2012',
      known: 'Disney appoints Alan Horn as studio chairman. His responsibilities cover production, distribution, and marketing across Disney, Pixar, and Marvel. He arrives with a long record at Warner Bros.',
      question: 'Would you expect Disney’s studio to pass $7 billion worldwide in a single year by the end of 2018?',
      event: 'Disney’s studio passed $7 billion in a year by the end of 2018.', happened: true,
      timeline: [
        ['MAY 2012', 'Hire announced', 'Horn is named chairman. The announcement describes broad operational responsibilities.'],
        ['2016 + 2018', 'Repeated results', 'Disney later reports worldwide studio grosses of $7.6 billion in 2016 and $7.3 billion in 2018. Its report credits Horn and Alan Bergman jointly.'],
        ['MAY 2019', 'Shared leadership formalized', 'Bergman becomes co-chairman; Horn adds the chief creative officer title. The studio describes an expanded portfolio including Lucasfilm and the recently acquired Fox film labels.']
      ],
      lesson: 'This is a counterweight to “it is all luck,” not a controlled demonstration that the hire caused the totals. Sustained outcomes deserve examination alongside franchises, acquisitions, teams, budgets, and changing market conditions. More observations do not automatically remove these confounders.',
      sources: [
        ['Appointment · ABC News, May 31, 2012', 'https://abcnews.com/blogs/headlines/2012/05/alan-horn-named-chairman-of-the-walt-disney-studios'],
        ['Results and leadership structure · Disney, May 1, 2019', 'https://thewaltdisneycompany.com/news/alan-bergman-upped-alan-horn-expands-role-at-the-walt-disney-studios/']
      ]
    }
  ];
  const host = document.getElementById('case-files');
  const forecasts = {};
  let current = cases[0].id;
  let revealed = new Set();
  function render() {
    const item = cases.find(c => c.id === current);
    const open = revealed.has(current);
    host.innerHTML = `<div class="section-heading"><div><p class="eyebrow">04 / REAL-WORLD CASE FILES</p><h2 id="case-title">Now give reality a turn.</h2></div><p>Make a forecast. Open the timeline.<br>Revisit who deserves the credit—or blame.</p></div>
      <p class="case-intro">Inspired by the questions about success and randomness in Leonard Mlodinow’s <em>The Drunkard’s Walk</em>. These independently sourced cases test different interpretations; they are not a reproduction of the book’s accounts.</p>
      <div class="case-picker" role="group" aria-label="Select a real-world case">${cases.map(c => `<button class="case-tab ${c.id === current ? 'active' : ''}" data-case="${c.id}" aria-pressed="${c.id === current}"><span>CASE ${c.number} / ${c.studio}</span><strong>${c.name}</strong><small>${c.lens}</small></button>`).join('')}</div>
      <article class="case-panel" aria-labelledby="case-name"><div class="case-brief"><p class="eyebrow">${item.date}</p><h3 id="case-name">${item.name}</h3><p>${item.known}</p><fieldset ${open ? 'disabled' : ''}><legend>${item.question}</legend><div class="forecast-options">${['Likely', 'Unlikely', 'Need more evidence'].map(v => `<label class="forecast-option"><input type="radio" name="forecast" value="${v}" ${forecasts[current] === v ? 'checked' : ''}>${v}</label>`).join('')}</div></fieldset><button class="button primary" id="reveal-case" ${open || !forecasts[current] ? 'disabled' : ''}>${open ? 'Timeline opened ✓' : 'Lock forecast & open timeline ↗'}</button><p class="case-note">A retrospective exercise: prior knowledge may influence your answer. Your choice stays in this tab only.</p></div>
      <div class="case-evidence">${open ? `<p class="forecast-recap">YOUR FORECAST: <strong>${forecasts[current]}</strong><br>DOCUMENTED OUTCOME: ${item.event}</p><ol class="case-timeline">${item.timeline.map(([date, title, text]) => `<li><time>${date}</time><h4>${title}</h4><p>${text}</p></li>`).join('')}</ol><div class="case-takeaway"><p class="eyebrow">WHAT THE EVIDENCE ALLOWS</p><p>${item.lesson}</p></div><details class="case-sources"><summary>Check the sources (${item.sources.length})</summary><ul>${item.sources.map(([title, url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title} ↗</a></li>`).join('')}</ul></details>` : `<div class="sealed-file"><span aria-hidden="true">↳</span><p>Tomorrow’s results.<br>Today’s judgment.</p><small>Make your forecast to open the file.</small></div>`}</div></article>
      <p class="case-limits"><strong>Read the sample honestly.</strong> These selected cases are illustrative contrasts, not a representative dataset or a test of forecasting skill. Gross box office is not studio revenue or profit. A halted project has an unobserved counterfactual, not a zero-dollar flop. These timelines cannot establish whether hiring or replacing an executive caused a result.</p>`;
    host.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
      current = button.dataset.case; render();
      host.querySelector(`[data-case="${current}"]`).focus({ preventScroll: true });
    }));
    host.querySelectorAll('input[name="forecast"]').forEach(input => input.addEventListener('change', () => {
      forecasts[current] = input.value;
      document.getElementById('reveal-case').disabled = false;
    }));
    document.getElementById('reveal-case').addEventListener('click', () => {
      if (!forecasts[current] || revealed.has(current)) return;
      revealed.add(current); render();
      const recap = host.querySelector('.forecast-recap');
      recap.setAttribute('tabindex', '-1'); recap.focus({ preventScroll: true });
      document.getElementById('announcement').textContent = `${item.name} timeline opened. ${item.event}`;
    });
  }
  render();
})();
