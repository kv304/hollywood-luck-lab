(() => {
  'use strict';
  const {report,movies} = window.MovieLabData;
  const media=window.LabMedia||{}, editorial=window.MovieEditorial;
  const {probability,score,shuffle,wilson}=window.ForecastLab;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(v);
  const pct=p=>`${Math.round(p*100)}%`;
  const model=report.models['2.5'];
  const featured=Object.keys(editorial).map(id=>movies.find(m=>m.id===id)).filter(Boolean);
  const opening=['tt1375666','tt1663662','tt1478338','tt0401729','tt1210166'];
  let phase='preview',blind=false,deck=[],answers=[],round=0,hintUsed=false,replayCount=0;
  let priorFocus=null,visibleCount=12;
  let best=0;
  try{best=Number(localStorage.getItem('hollywood-luck-lab-v2-best'))||0;}catch{}
  const announce=text=>{$('status').textContent=text;};
  function focus(id,scroll=true){const el=$(id);el.setAttribute('tabindex','-1');el.focus({preventScroll:true});if(scroll)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
  function artFor(movie){return media[editorial[movie.id]?.slug];}
  function art(movie,options={}){
    const asset=artFor(movie);
    return asset?`<img src="${esc(asset.path)}" alt="${esc(options.decorative?'':movie.title+' theatrical poster')}" ${options.eager?'fetchpriority="high"':'loading="lazy"'} width="300" height="450">`:`<span class="poster-fallback">${esc(movie.title)}</span>`;
  }
  function sourceLink(movie,label='Financial data · FiveThirtyEight snapshot'){
    return `<a class="source-link" href="https://github.com/fivethirtyeight/data/blob/master/bechdel/movies.csv" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  }
  function trivia(movie){
    const e=editorial[movie.id];
    if(!e)return `<div class="trivia-box"><p class="mini-label">A CHANGE OF YARDSTICK</p><p>Reported gross is ${movie.multiple.toFixed(2)}× production budget in this snapshot. Try another threshold in the backlot: the label can change even though the film does not.</p>${sourceLink(movie)}</div>`;
    return `<div class="trivia-box"><p class="mini-label">THE POST-CREDITS FACT</p><p>${esc(e.trivia)}</p>${e.source?`<a class="source-link" href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">${esc(e.sourceLabel)} ↗</a>`:sourceLink(movie)}</div>`;
  }
  function watch(movie){const e=editorial[movie.id];return e?.watch?`<a class="watch-link" href="${esc(e.watch)}" target="_blank" rel="noopener noreferrer">▶ &nbsp;${esc(e.watchLabel)} ↗</a>`:'';}
  function getTotal(){return answers.reduce((n,a)=>n+a.points,0);}
  function gameTop(){return `<div class="game-top"><span class="round-count">ROUND ${round+1} / 5</span><span class="progress-dots" aria-label="${answers.length} of 5 forecasts completed">${Array.from({length:5},(_,i)=>`<i class="${i<round?'done':i===round?'current':''}"></i>`).join('')}</span><span class="game-score"><strong>${Math.round(getTotal())}</strong> / 500 points</span></div>`;}
  function gameFootnote(){return '<p class="game-footnote">A curated historical deck, not a representative test. The mark is gross ≥ 2.5× production budget, not profit. Recognizing a past outcome can help. Play at your own pace.</p>';}
  function renderPreview(){
    $('game').innerHTML=`<div class="game-preview"><div class="preview-copy"><span class="mini-label">NOW CASTING: YOUR INNER STUDIO CHAIR</span><h3>Could you spot the next big return?</h3><p>Give each movie a chance of clearing our box-office mark. Lock your call, open the receipt, and collect forecast points.</p><div class="mode-choice" role="group" aria-label="Choose game mode"><button class="mode-button" data-mode="posters" aria-pressed="${!blind}">✦ Posters on</button><button class="mode-button" data-mode="blind" aria-pressed="${blind}">◈ Poster-blind</button></div><p id="mode-description">${blind?'Just budget and year first. The film’s identity appears after your call.':'The film, its poster, and its budget. Bring your movie knowledge.'}</p><button class="button dark" data-start>Take the chair <span aria-hidden="true">↗</span></button>${best?`<p class="small-note">YOUR SAVED BEST · ${Math.round(best)} / 500</p>`:''}</div><div class="preview-art" aria-hidden="true">${['tt1478338','tt0401729','tt1375666'].map(id=>art(movies.find(m=>m.id===id),{decorative:true})).join('')}<span class="preview-ticket">5 CALLS. ONE REALITY CHECK.</span></div></div>${gameFootnote()}`;
    $('game').querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{blind=b.dataset.mode==='blind';renderPreview();$('game').querySelector(`[data-mode="${blind?'blind':'posters'}"]`).focus({preventScroll:true});}));
    $('game').querySelector('[data-start]').addEventListener('click',start);
  }
  function start(){
    if(phase==='forecast'||phase==='reveal'){focus('game-round');return;}
    deck=(replayCount?shuffle(featured,20261112+replayCount*7919).slice(0,5):opening.map(id=>movies.find(m=>m.id===id)));
    phase='forecast';answers=[];round=0;hintUsed=false;renderGame();focus('game-round');
  }
  function filmSide(movie,reveal=false){
    const concealed=blind&&!reveal;
    return `<div class="film-side"><div class="film-cover">${concealed?'<div class="blind-cover"><span aria-hidden="true">?</span><small>IDENTITY SEALED</small></div>':art(movie,{eager:true})}</div><div class="film-side-info"><span class="film-year">${movie.year} ${concealed?' / BLIND FILE':' / THEATRICAL RELEASE'}</span><h3>${concealed?'Mystery movie '+(round+1):esc(movie.title)}</h3><p class="film-vibe">${concealed?'Let the budget do the talking.':esc(editorial[movie.id]?.label||'A little more than a headline.')}</p><div class="film-budget">REPORTED PRODUCTION BUDGET<strong>${money(movie.budget)}</strong></div></div></div>`;
  }
  function renderGame(){
    const movie=deck[round];
    if(phase==='summary'){renderSummary();return;}
    if(phase==='reveal'){renderReveal();return;}
    $('game').innerHTML=`${gameTop()}<div class="game-shell" id="game-round">${filmSide(movie)}<div class="forecast-side"><p class="mini-label">MAKE YOUR CALL</p><h3>Will it clear<br>the 2.5× mark?</h3><p>That means at least <strong>${money(movie.budget*2.5)}</strong> in worldwide ticket sales. What chance would you give it?</p><label class="forecast-label" for="player-forecast">Your probability <output for="player-forecast" id="player-value">50%</output></label><input id="player-forecast" type="range" min="0" max="100" step="5" value="50"><div class="range-labels"><span>Long shot</span><span>Almost certain</span></div><div class="quick-probs" role="group" aria-label="Set your probability">${[20,40,60,80].map(p=>`<button data-prob="${p}">${p}%</button>`).join('')}</div><div class="forecast-actions"><button class="button violet" id="lock-forecast">Lock my forecast <span aria-hidden="true">↗</span></button><button class="inline-button" id="show-model">Need a starting point?<br>Show the model</button></div><p class="model-hint" id="model-hint" hidden></p></div></div>${gameFootnote()}`;
    const input=$('player-forecast');
    input.addEventListener('input',()=>{$('player-value').value=`${input.value}%`;});
    $('game').querySelectorAll('[data-prob]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.prob;$('player-value').value=`${input.value}%`;}));
    $('show-model').addEventListener('click',()=>{hintUsed=true;$('model-hint').hidden=false;$('model-hint').innerHTML=`The budget-and-year baseline gives this a <strong>${pct(movie.probabilities['2.5'])}</strong> chance. It was fitted on films released through 2008. It knows neither this movie’s identity nor its actual gross.`;$('show-model').disabled=true;announce('Historical model estimate revealed.');});
    $('lock-forecast').addEventListener('click',()=>{
      const p=Number(input.value)/100,actual=Number(movie.multiple>=2.5),modelP=movie.probabilities['2.5'];
      answers.push({id:movie.id,title:movie.title,p,actual,modelP,points:score(p,actual),modelPoints:score(modelP,actual),hintUsed,blind});
      phase='reveal';renderGame();focus('round-reveal');announce(`${movie.title}: ${actual?'cleared':'fell short of'} the 2.5 times budget mark.`);
    });
  }
  function renderReveal(){
    const movie=deck[round],answer=answers[round];
    $('game').innerHTML=`${gameTop()}<div class="game-shell">${filmSide(movie,true)}<div class="forecast-side" id="round-reveal"><span class="reveal-badge ${answer.actual?'':'short'}">${answer.actual?'✦ CLEARED THE MARK':'↘ SHORT OF THE MARK'}</span><h3 class="reveal-title">${movie.multiple.toFixed(1)}× the budget.<br>${answer.actual?'That’s a clear.':'That’s the twist.'}</h3><div class="reveal-amounts"><div><strong>${money(movie.budget)}</strong>production budget</div><div class="gross-amount"><strong>${money(movie.gross)}</strong>worldwide gross</div></div><div class="comparison-receipt"><span>Your forecast<strong>${pct(answer.p)}</strong></span><span>Model forecast<strong>${pct(answer.modelP)}</strong></span><span>This call earned<strong>+${Math.round(answer.points)} pts</strong></span></div>${trivia(movie)}<div class="reveal-bottom">${watch(movie)}<button class="button dark" id="next-round">${round===4?'See my scorecard':'Next movie'} <span aria-hidden="true">→</span></button></div><p class="small-note">Archived financial snapshot; later releases and revisions can change totals.</p></div></div>${gameFootnote()}`;
    $('next-round').addEventListener('click',()=>{if(round===4){phase='summary';renderSummary();focus('game-summary');}else{round++;hintUsed=false;phase='forecast';renderGame();focus('game-round');}});
  }
  function renderSummary(){
    const total=getTotal(), modelTotal=answers.reduce((n,a)=>n+a.modelPoints,0),difference=total-modelTotal;
    if(total>best){best=total;try{localStorage.setItem('hollywood-luck-lab-v2-best',String(best));}catch{}}
    const title=difference>1?'Your instincts had a good night.':difference<-1?'The numbers stole this scene.':'A photo finish.';
    $('game').innerHTML=`<div class="summary-shell" id="game-summary"><div class="summary-header"><div><span class="mini-label">THAT’S A WRAP / 5 OF 5</span><h3>${title}</h3><p>${difference>0?`You finished ${Math.round(difference)} points ahead of`:`You finished ${Math.round(Math.abs(difference))} points behind`} the budget-and-year baseline on this deck. A fun result to inspect—not a verdict on your forecasting talent.</p><span class="reveal-badge">✦ REALITY CHECK COMPLETE</span></div><div class="score-ticket"><span>YOUR FORECAST SCORE</span><strong>${Math.round(total)}<small> / 500</small></strong><p>Model: ${Math.round(modelTotal)} / 500 · Your saved best: <span id="summary-best">${Math.round(best)}</span></p></div></div><div>${answers.map((a,i)=>`<div class="summary-row"><span>${art(deck[i],{decorative:true})}</span><strong>${esc(a.title)}<small class="result-text ${a.actual?'':'short'}">${a.actual?'Cleared 2.5×':'Below 2.5×'} ${a.hintUsed?'· model viewed':''}</small></strong><span><small>YOU</small>${pct(a.p)}</span><span><small>MODEL</small>${pct(a.modelP)}</span><span><small>POINTS</small>+${Math.round(a.points)}</span></div>`).join('')}</div><div class="summary-actions"><button class="button hot" id="play-again">Another slate <span aria-hidden="true">↻</span></button><button class="button outline" id="copy-score">Copy my scorecard ↗</button><button class="button outline" id="export-game">Download my calls ↓</button></div><p class="summary-note">${blind?'Poster-blind':'Poster-visible'} mode · This curated, recognizable sample differs from the full model evaluation. Prior knowledge, help from the model, and repeated play can raise your score. Your calls stay in this tab; only the best score is saved locally.</p></div>`;
    $('play-again').addEventListener('click',()=>{replayCount++;phase='preview';renderPreview();focus('play-title');});
    $('export-game').addEventListener('click',exportCalls);
    $('copy-score').addEventListener('click',async()=>{
      const text=`Hollywood Luck Lab · ${Math.round(total)}/500 forecast points\nBudget-model baseline: ${Math.round(modelTotal)}/500 · ${blind?'poster-blind':'posters on'}\nFive curated historical movies—not a validated skill test.\n${answers.map(a=>`${a.title}: my forecast ${pct(a.p)}, ${a.actual?'cleared':'below'} 2.5× budget`).join('\n')}`;
      try{await navigator.clipboard.writeText(text);$('copy-score').textContent='Scorecard copied ✓';announce('Scorecard copied.');}catch{$('copy-score').textContent='Clipboard unavailable · use download';}
    });
  }
  function exportCalls(){
    const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const rows=[['title','imdb_id','probability','model_probability','cleared_2.5x','forecast_points','model_viewed','poster_blind'],...answers.map(a=>[a.title,a.id,a.p,a.modelP,a.actual,a.points,a.hintUsed,a.blind])];
    const url=URL.createObjectURL(new Blob([rows.map(r=>r.map(quote).join(',')).join('\n')+'\n'],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='hollywood-luck-lab-scorecard.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Forecast scorecard downloaded.');
  }

  const dossierLook={
    lansing:{photo:'sherry-lansing',short:'Sherry Lansing',initials:'SL',subtitle:'The inherited hit',films:[['war-worlds','War of the Worlds']]},
    ross:{photo:'rich-ross',short:'Rich Ross',initials:'RR',subtitle:'A hit. A miss. An unmade movie.',films:[['john-carter','John Carter'],['avengers','The Avengers']]},
    horn:{photo:'alan-horn',short:'Alan Horn',initials:'AH',subtitle:'Success that kept returning',films:[['iron-man-3','Iron Man 3']]}
  };
  let selectedCase='lansing';
  const caseAnswers={},caseOpen=new Set();
  function renderDossiers(){
    const cases=window.HistoricalCases,item=cases.find(c=>c.id===selectedCase),look=dossierLook[selectedCase],open=caseOpen.has(selectedCase);
    $('dossiers').innerHTML=`<div class="dossier-nav" role="group" aria-label="Choose an executive case">${cases.map(c=>{const d=dossierLook[c.id],asset=media[d.photo];return `<button class="dossier-tab" data-case="${c.id}" aria-pressed="${c.id===selectedCase}">${asset?`<span class="exec-portrait portrait-${c.id}"><img class="exec-photo" src="${esc(asset.path)}" alt="${esc(d.short)} portrait" width="66" height="77" loading="lazy"></span>`:`<span class="exec-placeholder" aria-hidden="true">${d.initials}</span>`}<span><small>${esc(c.studio)}</small><strong>${esc(d.short)}</strong><em>${esc(d.subtitle)}</em></span></button>`;}).join('')}</div><article class="dossier-card" aria-labelledby="case-name"><div class="dossier-brief"><span class="mini-label">${esc(item.date.toUpperCase())}</span><h3 id="case-name">${esc(item.name)}</h3><p>${esc(item.known)}</p><fieldset ${open?'disabled':''}><legend>${esc(item.question)}</legend><div class="case-options">${['Likely','Unlikely','Need more evidence'].map(v=>`<label><input type="radio" name="case-forecast" value="${v}" ${caseAnswers[selectedCase]===v?'checked':''}>${v}</label>`).join('')}</div></fieldset><button id="open-dossier" class="button violet" ${!caseAnswers[selectedCase]||open?'disabled':''}>${open?'File opened ✓':'Open the file ↗'}</button><div class="dossier-films">${look.films.filter(([slug])=>media[slug]).map(([slug,title])=>`<figure><img src="${esc(media[slug].path)}" alt="${esc(title)} theatrical poster" loading="lazy" width="100" height="150"><figcaption>${esc(title)}</figcaption></figure>`).join('')}</div><p class="small-note">Make a retrospective judgment, then inspect the timeline. Prior knowledge may help. These are selected historical examples, not causal estimates of executive performance.</p></div><div class="dossier-evidence">${open?`<p class="dossier-outcome">YOUR FORECAST: <strong>${esc(caseAnswers[selectedCase])}</strong><br>DOCUMENTED OUTCOME: ${esc(item.event)}</p><ol class="case-timeline">${item.timeline.map(([date,title,text])=>`<li><time>${esc(date)}</time><h4>${esc(title)}</h4><p>${esc(text)}</p></li>`).join('')}</ol><p class="case-takeaway"><strong>THE ATTRIBUTION CHECK</strong>${esc(item.lesson)}</p><details class="source-details"><summary>Open source notes (${item.sources.length})</summary><ul>${item.sources.map(([title,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a></li>`).join('')}</ul></details>`:'<div class="sealed"><span aria-hidden="true">↳</span><h4>The headline is only<br>the opening scene.</h4><p>Make your call.<br>Then follow the production timeline.</p></div>'}</div></article><p class="dossier-notice">Inspired by questions about randomness in Leonard Mlodinow’s <em>The Drunkard’s Walk</em>; independently researched, not a reproduction of the book. Planned departure, resignation, and ouster keep their documented meanings. A halted film’s unrealized return remains unknown.</p>`;
    $('dossiers').querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{selectedCase=button.dataset.case;renderDossiers();$('dossiers').querySelector(`[data-case="${selectedCase}"]`).focus({preventScroll:true});}));
    $('dossiers').querySelectorAll('input[name="case-forecast"]').forEach(input=>input.addEventListener('change',()=>{caseAnswers[selectedCase]=input.value;$('open-dossier').disabled=false;}));
    $('open-dossier').addEventListener('click',()=>{if(!caseAnswers[selectedCase]||open)return;caseOpen.add(selectedCase);renderDossiers();const panel=$('dossiers').querySelector('.dossier-outcome');panel.setAttribute('tabindex','-1');panel.focus({preventScroll:true});announce('Executive file opened. '+item.event);});
  }
  function threshold(){return $('explore-threshold').value;}
  function currentMovies(){
    const query=$('movie-search').value.trim().toLocaleLowerCase();
    const list=movies.filter(m=>`${m.title} ${m.year}`.toLocaleLowerCase().includes(query));
    const sort=$('explore-sort').value,key=threshold();
    const order=Object.keys(editorial);
    list.sort((a,b)=>sort==='probability'?b.probabilities[key]-a.probabilities[key]||a.title.localeCompare(b.title):sort==='multiple'?b.multiple-a.multiple:sort==='year'?b.year-a.year||a.title.localeCompare(b.title):((order.indexOf(a.id)<0?999:order.indexOf(a.id))-(order.indexOf(b.id)<0?999:order.indexOf(b.id)))||a.title.localeCompare(b.title));
    return list;
  }
  function renderArchive(){
    const list=currentMovies(),key=threshold();
    $('explore-count').textContent=`${list.length.toLocaleString()} film${list.length===1?'':'s'} · ${Math.min(visibleCount,list.length)} shown`;
    $('movie-grid').innerHTML=list.length?list.slice(0,visibleCount).map(movie=>`<button class="movie-tile" data-movie="${movie.id}" aria-label="Open ${esc(movie.title)}, ${movie.year}, actual gross ${movie.multiple.toFixed(1)} times production budget"><span class="tile-art">${art(movie)}<span class="tile-badge">${movie.multiple.toFixed(1)}× gross</span></span><h3>${esc(movie.title)}</h3><p>${movie.year} · ${money(movie.budget)} budget</p><span class="tile-prediction">${pct(movie.probabilities[key])} model chance of ${Number(key)}×</span></button>`).join(''):'<p class="empty-state">No matching films in this snapshot. Try another title or a year from 2009–2013.</p>';
    $('show-more').hidden=visibleCount>=list.length;
    $('movie-grid').querySelectorAll('[data-movie]').forEach(button=>button.addEventListener('click',()=>openMovie(button.dataset.movie,button)));
  }
  function openMovie(id,trigger){
    const movie=movies.find(m=>m.id===id),key=threshold(),chosen=report.models[key],cohort=chosen.cohorts.find(c=>movie.budget>=c.low&&(c.high===null||movie.budget<c.high)),interval=wilson(cohort.hits,cohort.n),actual=movie.multiple>=Number(key);
    priorFocus=trigger;
    $('dialog-content').innerHTML=`<div class="dialog-layout"><div class="dialog-poster">${art(movie,{eager:true})}<p class="small-note">${artFor(movie)?`<a href="${esc(artFor(movie).filePage)}" target="_blank" rel="noopener noreferrer">Poster source & rights ↗</a>`:'Poster unavailable for this snapshot.'}</p></div><div class="dialog-content"><span class="mini-label">${movie.year} / FROM THE HELD-OUT ARCHIVE</span><h2 id="dialog-title">${esc(movie.title)}</h2><span class="reveal-badge ${actual?'':'short'}">${actual?'CLEARED':'BELOW'} THE ${Number(key)}× MARK</span><div class="reveal-amounts"><div><strong>${money(movie.budget)}</strong>production budget</div><div class="gross-amount"><strong>${money(movie.gross)}</strong>worldwide gross</div></div><p><strong>${movie.multiple.toFixed(2)}× gross / budget.</strong> Your chosen mark is ${Number(key)}×. This is a comparison rule, not a profit calculation.</p><div class="method-comparison"><span class="mini-label">THREE LENSES / SAME TARGET</span><div class="method-line"><span>Budget + year model</span><strong>${pct(movie.probabilities[key])}</strong></div><div class="method-line"><span>Training-set base rate</span><strong>${pct(chosen.baseRate)}</strong></div><div class="method-line"><span>Similar-budget cohort</span><strong>${pct(cohort.probability)}</strong></div><small>Cohort: ${cohort.label}, ${cohort.hits}/${cohort.n} earlier films cleared the mark. Estimate uses a Beta(2,2) prior; raw-rate 95% Wilson interval: ${pct(interval[0])}–${pct(interval[1])}. This interval describes the cohort rate, not this movie’s model uncertainty.</small></div>${trivia(movie)}${watch(movie)}<div style="margin-top:15px">${sourceLink(movie)}</div></div></div>`;
    $('movie-dialog').showModal();
  }
  function closeMovie(){ $('movie-dialog').close();priorFocus?.focus({preventScroll:true}); }
  function renderDataRoom(){
    const metric=model.evaluation,improvement=metric.baseline.brier-metric.model.brier;
    $('data-summary').innerHTML=`<div class="data-stats"><div><strong>${report.cleanRows.toLocaleString()}</strong>retained historical films</div><div><strong>${report.train.n.toLocaleString()}</strong>training films · through 2008</div><div><strong>${report.holdout.n}</strong>held-out films · 2009–2013</div><div><strong>${report.excludedRows}</strong>ambiguous / incomplete rows removed</div></div><div class="performance-card"><div><h3>The model barely<br>edges the base rate.</h3><p>At the game’s 2.5× mark, the Brier error improves by only <strong>${improvement.toFixed(4)}</strong> on the full held-out set. Budget and year alone leave a lot unexplained. This is a baseline to question, not a blockbuster oracle.</p></div><div><div class="performance-rows"><div class="performance-row"><span>Budget + year</span><span class="metric-track" role="img" aria-label="Budget and year model Brier error ${metric.model.brier.toFixed(4)}"><i style="width:${metric.model.brier*100}%"></i></span><strong>${metric.model.brier.toFixed(4)}</strong></div><div class="performance-row baseline"><span>Constant base rate</span><span class="metric-track" role="img" aria-label="Constant base-rate Brier error ${metric.baseline.brier.toFixed(4)}"><i style="width:${metric.baseline.brier*100}%"></i></span><strong>${metric.baseline.brier.toFixed(4)}</strong></div></div><p class="performance-caption">Brier error · same 0–1 scale · lower is better · 538 films<br>0 = perfect. Model classification accuracy at 50%: ${pct(metric.model.accuracy)}. These are historical results, not guarantees.</p></div></div>`;
  }
  function cleanMeta(text){return String(text||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');}
  function renderCredits(){
    $('credits-content').innerHTML=`<h4>Data and historical reporting</h4><p>Financial columns: <a href="${report.source}" target="_blank" rel="noopener noreferrer">FiveThirtyEight’s Bechdel dataset</a>, CC BY 4.0. Downloaded November 12, 2026; archived figures cover 1970–2013. Cleaning, exclusion flags, derived gross multiples, probability estimates, and charts are our modifications. <a href="data/LICENSE-data.txt">Full data license</a> · <a href="data/model-report.json">Audit and evaluation</a>. Executive reporting is linked inside each dossier.</p><h4>Design references, not a claim about what causes engagement</h4><div class="credit-grid"><p><a href="https://letterboxd.com/" target="_blank" rel="noopener noreferrer">Letterboxd</a>: poster-led discovery, a shared film vocabulary, and compact metadata. Its <a href="https://embed.letterboxd.com/crew/story/indiewire-inside-the-art-of-letterboxds-four/" target="_blank" rel="noopener noreferrer">Four Favorites</a> interviews offer a repeatable, personality-led prompt; see its <a href="https://www.instagram.com/letterboxd/" target="_blank" rel="noopener noreferrer">Instagram</a>.</p><p><a href="https://pudding.cool/2017/03/film-dialogue/" target="_blank" rel="noopener noreferrer">The Pudding</a>: begin with a concrete film question, then let readers inspect the evidence. <a href="https://www.rottentomatoes.com/" target="_blank" rel="noopener noreferrer">Rotten Tomatoes</a>: recognizable artwork, concise labels, and a clear route to trailers.</p><p><a href="https://www.youtube.com/@screenjunkies" target="_blank" rel="noopener noreferrer">Screen Junkies / Honest Trailers</a>: a compact entertainment hook followed by commentary. We borrow the short setup-and-reveal rhythm, not their wording, logos, or footage.</p><p>Our coral, violet, mint, and yellow palette is an original film-festival direction. Popularity is not evidence that a palette improves learning. No A/B study or audience test has been run.</p></div><h4>Image credits</h4><p>Small movie-poster reference images illustrate critical comparison of the named works; they are not released under the data license. No endorsement is implied. Wikimedia portraits retain their individual licenses. Local caching and a linked source/author manifest preserve provenance.</p><ul>${Object.entries(media).map(([slug,m])=>{const meta=m.licenseMetadata||{},author=cleanMeta(meta.Artist?.value||meta.Attribution?.value),license=cleanMeta(meta.LicenseShortName?.value||'');return `<li><a href="${esc(m.filePage)}" target="_blank" rel="noopener noreferrer">${esc(m.title)}${m.kind==='copyrighted_poster'?' poster':''}</a> — ${m.kind==='commons_photo'?`${esc(author)} · <a href="${esc(meta.LicenseUrl?.value||m.filePage)}" target="_blank" rel="noopener noreferrer">${esc(license||'see source license')}</a> · thumbnail, displayed with a cover crop`:esc(m.credit)}</li>`;}).join('')}</ul><p><a href="assets/manifest.json">Download media provenance ↗</a> · <a href="classic/index.html">Version 1 remains playable ↗</a></p>`;
  }
  document.querySelectorAll('header [data-start],.hero [data-start]').forEach(button=>button.addEventListener('click',start));
  $('explore-threshold').addEventListener('change',()=>{visibleCount=12;renderArchive();});
  $('explore-sort').addEventListener('change',()=>{visibleCount=12;renderArchive();});
  $('movie-search').addEventListener('input',()=>{visibleCount=12;renderArchive();});
  $('show-more').addEventListener('click',()=>{visibleCount+=12;renderArchive();});
  $('movie-dialog').querySelector('.dialog-close').addEventListener('click',closeMovie);
  $('movie-dialog').addEventListener('cancel',()=>{priorFocus?.focus({preventScroll:true});});
  $('clear-local').addEventListener('click',()=>{try{localStorage.removeItem('hollywood-luck-lab-v2-best');}catch{}best=0;if(phase==='preview')renderPreview();if($('summary-best'))$('summary-best').textContent='0';$('clear-local').textContent='Saved score cleared ✓';announce('Saved best score cleared.');});
  $('hero-posters').innerHTML=['tt1375666','tt1478338','tt0401729'].map(id=>`<div class="hero-poster">${art(movies.find(m=>m.id===id),{eager:true})}</div>`).join('');
  document.querySelectorAll('[data-holdout-count]').forEach(el=>el.textContent=report.holdout.n);
  renderPreview();renderDossiers();renderArchive();renderDataRoom();renderCredits();
})();
