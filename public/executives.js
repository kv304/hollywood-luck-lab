(() => {
  'use strict';
  const cases=window.HistoricalCases;
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected='lansing',query='',company='';
  const choices={},opened=new Set();
  const films={lansing:[['war-worlds','War of the Worlds']],ross:[['john-carter','John Carter'],['avengers','The Avengers']],horn:[['iron-man-3','Iron Man 3']],feige:[['avengers','The Avengers']]};
  function mount(){
    const root=document.getElementById('dossiers');
    root.innerHTML=`<div class="case-browser"><label>Find a person or story<input id="case-search" type="search" placeholder="Try Marvel, Shonda, or an inherited slate…" value="${esc(query)}"></label><label>Company<select id="case-company"><option value="">All companies</option>${['Disney','Paramount','Sony','Marvel','New Line','Netflix'].map(c=>`<option ${company===c?'selected':''}>${c}</option>`).join('')}</select></label><span id="case-count" aria-live="polite"></span></div><div id="case-list" class="dossier-nav"></div><div id="case-story"></div><p class="dossier-notice">Inspired by questions about randomness in Leonard Mlodinow’s <em>The Drunkard’s Walk</em>; independently researched. Selected cases illustrate attribution, not causal estimates of individual ability. Company announcements describe their own results; coverage is selective.</p>`;
    document.getElementById('case-search').addEventListener('input',e=>{query=e.target.value;renderList();});
    document.getElementById('case-company').addEventListener('change',e=>{company=e.target.value;renderList();});
    renderList();
  }
  function renderList(){
    const filtered=cases.filter(c=>(c.name+' '+c.company+' '+c.lens).toLowerCase().includes(query.toLowerCase())&&(!company||c.company.includes(company)));
    document.getElementById('case-count').textContent=`${filtered.length} of ${cases.length} case files`;
    if(filtered.length&&!filtered.some(c=>c.id===selected))selected=filtered[0].id;
    document.getElementById('case-list').innerHTML=filtered.map(c=>{const image=window.LabMedia[c.photo];return `<button class="dossier-tab" data-case="${c.id}" aria-pressed="${c.id===selected}">${image?`<span class="exec-portrait portrait-${c.id}"><img class="exec-photo" src="${esc(image.path)}" alt="${esc(c.short)} portrait" width="66" height="77" loading="lazy"></span>`:`<span class="exec-placeholder" aria-hidden="true">${esc(c.short.split(' ').map(s=>s[0]).slice(0,2).join(''))}</span>`}<span><small class="company-badge">${esc(c.company)}</small><strong>${esc(c.short)}</strong><em>${esc(c.lens)}</em></span></button>`;}).join('')||'<p>No matching case files. Try another company or name.</p>';
    document.querySelectorAll('#case-list [data-case]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.case;renderList();document.querySelector(`#case-list [data-case="${selected}"]`).focus({preventScroll:true});}));
    if(filtered.length)renderStory();else document.getElementById('case-story').innerHTML='';
  }
  function renderStory(){
    const c=cases.find(c=>c.id===selected),open=opened.has(selected);
    const groups=[];
    c.timeline.forEach(([date,title,text])=>{const year=date.match(/\b(?:19|20)\d{2}\b/)?.[0]||date;if(groups.at(-1)?.year!==year)groups.push({year,events:[]});groups.at(-1).events.push({date,title,text});});
    document.getElementById('case-story').innerHTML=`<article class="dossier-card"><div class="dossier-brief"><span class="company-badge company-large">${esc(c.company)}</span><p class="mini-label">${esc(c.date)}</p><h3 id="case-name">${esc(c.name)}</h3><p class="story-hook">${esc(c.lens)}</p><p>${esc(c.known)}</p><fieldset ${open?'disabled':''}><legend>${esc(c.question)}</legend><div class="case-options">${['Likely','Unlikely','Need more evidence'].map(v=>`<label><input type="radio" name="case-forecast" value="${v}" ${choices[selected]===v?'checked':''}>${v}</label>`).join('')}</div></fieldset><button id="open-dossier" class="button violet" ${!open&&!choices[selected]?'disabled':''}>${open?'Reconsider my call ↺':'Reveal the next chapter →'}</button><div class="dossier-films">${(films[c.id]||[]).filter(([slug])=>window.LabMedia[slug]).map(([slug,title])=>`<figure><img src="${esc(window.LabMedia[slug].path)}" alt="${esc(title)} poster" width="100" height="150" loading="lazy"><figcaption>${esc(title)}</figcaption></figure>`).join('')}</div><p class="small-note">Pause at the date above. Make a judgment, then follow what happened. Knowing the history can help; this is a learning prompt, not a prediction test.</p></div><div class="dossier-evidence">${open?`<div class="story-reveal" tabindex="-1"><span class="mini-label">YOU SAID: ${esc(choices[selected])}</span><h4>Here’s how the story unfolded.</h4><p>${esc(c.event)}</p></div><div class="year-story">${groups.map(g=>`<section class="story-year"><h4>${esc(g.year)}</h4><ol class="case-timeline">${g.events.map(e=>`<li><time>${esc(e.date)}</time><h5>${esc(e.title)}</h5><p>${esc(e.text)}</p></li>`).join('')}</ol></section>`).join('')}</div><p class="case-takeaway"><strong>BEFORE YOU HAND OUT THE CREDIT</strong>${esc(c.lesson)}</p><details class="source-details"><summary>Check the reporting (${c.sources.length} sources)</summary><ul>${c.sources.map(([t,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a></li>`).join('')}</ul></details><a class="story-next" href="#people">Now explore a credited filmography →</a>`:'<div class="sealed"><span aria-hidden="true">↳</span><h4>Start with a decision.<br>Stay for the plot twist.</h4><p>The year-by-year record is sealed.<br>Make your call to reveal it.</p></div>'}</div></article>`;
    document.querySelectorAll('#case-story input[name="case-forecast"]').forEach(i=>i.addEventListener('change',()=>{choices[selected]=i.value;document.getElementById('open-dossier').disabled=false;}));
    document.getElementById('open-dossier').addEventListener('click',()=>{if(open){opened.delete(selected);renderStory();document.querySelector('#case-story input')?.focus();return;}if(!choices[selected])return;opened.add(selected);renderStory();document.querySelector('.story-reveal').focus({preventScroll:true});document.getElementById('status').textContent=c.event;});
  }
  window.ExecutiveLab={mount};
})();
