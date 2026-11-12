(() => {
  'use strict';
  const data=window.PeopleLabData,people=data.people;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(v);
  let selected=people[0].id,visible=12,expanded=false;
  
  const slug=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
  function portrait(person){const asset=window.LabMedia[slug(person.name)];return asset?`<img src="${esc(asset.path)}" alt="${esc(person.name)} portrait" width="64" height="76" loading="lazy">`:`<span class="person-initials" aria-hidden="true">${esc(person.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</span>`;}
  function filteredFilms(p){const decade=$('people-decade').value;return p.films.filter(f=>(!decade||Math.floor(f.year/10)*10===Number(decade))&&(!$('people-role').value||f.roles.includes($('people-role').value)));}
  function list(){const q=$('people-search').value.trim().toLowerCase();return people.filter(p=>p.name.toLowerCase().includes(q)&&filteredFilms(p).length);}
  function renderList(){
    const found=list();
    $('people-count').textContent=`${found.length.toLocaleString()} people · ${Math.min(visible,found.length)} shown · selected historical credits`;
    $('people-grid').innerHTML=found.slice(0,visible).map(p=>`<button class="person-card" data-person="${p.id}" aria-pressed="${selected===p.id}">${portrait(p)}<span><strong>${esc(p.name)}</strong><small>${esc(p.roles.join(' / '))} · ${p.firstYear}–${p.lastYear}</small><em>${filteredFilms(p).filter(f=>f.multiple!==null).length} films with budget + gross in this view</em></span></button>`).join('')||'<p>No matching people in this snapshot. Try another decade or role.</p>';
    $('people-more').hidden=visible>=found.length;
    $('people-grid').querySelectorAll('[data-person]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.person;expanded=false;renderList();renderProfile();$('person-profile').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('person-heading').focus({preventScroll:true});}));
  }
  function renderProfile(){
    const p=people.find(p=>p.id===selected),films=filteredFilms(p),valid=films.filter(f=>f.multiple!==null),metric=$('people-metric').value;
    const total=valid.reduce((n,f)=>n+f.gross,0),hits=valid.filter(f=>f.multiple>=2.5).length;
    const ordered=valid.map(f=>f.multiple).sort((a,b)=>a-b),median=ordered.length?(ordered[Math.floor((ordered.length-1)/2)]+ordered[Math.floor(ordered.length/2)])/2:null;
    const biggest=valid.slice().sort((a,b)=>b.gross-a.gross)[0],efficient=valid.slice().sort((a,b)=>b.multiple-a.multiple)[0];
    const max=Math.max(...valid.map(f=>f[metric]),1),chronology=valid.slice().sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title)),shown=expanded?chronology:chronology.slice(-12);
    $('person-profile').innerHTML=`<div class="person-profile-heading"><div class="person-large-portrait">${portrait(p)}</div><div><span class="mini-label">THE CREDITED FILMOGRAPHY / ${esc(p.roles.join(' + '))}</span><h3 id="person-heading" tabindex="-1">${esc(p.name)}</h3><p>${films.length} sampled credits · ${films.length-valid.length} lack a usable budget or gross${$('people-decade').value?' · '+$('people-decade').value+'s only':''}</p></div><a class="source-link" href="https://www.themoviedb.org/person/${p.id}" target="_blank" rel="noopener noreferrer">Fuller filmography ↗</a></div><div class="person-stats"><div><strong>${valid.length?money(total):'—'}</strong>sum of reported gross</div><div><strong>${median===null?'—':median.toFixed(1)+'×'}</strong>median gross / budget</div><div><strong>${hits} / ${valid.length}</strong>cleared the 2.5× mark</div></div>${valid.length?`<div class="career-insight"><span class="mini-label">LOOK PAST THE BIGGEST NUMBER</span><p>${biggest.id!==efficient.id?`<strong>${esc(biggest.title)}</strong> has the largest reported gross in this selection (${money(biggest.gross)}). But <strong>${esc(efficient.title)}</strong> has the largest gross-to-budget multiple (${efficient.multiple.toFixed(1)}×). Change the yardstick and the standout changes.`:`<strong>${esc(biggest.title)}</strong> leads both gross and gross-to-budget multiple in this selection. It accounts for <strong>${Math.round(biggest.gross/total*100)}%</strong> of the sampled films’ combined reported gross.`}</p></div><div class="career-chart"><div class="chart-heading"><strong>${metric==='gross'?'Reported theatrical gross':'Gross ÷ production budget'}</strong><span>Each row is a film, in release-year order${expanded?'':' · latest 12'}</span></div>${shown.map(f=>`<a class="career-row" href="https://www.themoviedb.org/movie/${f.id}" target="_blank" rel="noopener noreferrer" aria-label="${esc(f.title)}, ${f.year}: ${money(f.gross)} gross on ${money(f.budget)} budget, ${f.multiple.toFixed(2)} times budget"><time>${f.year}</time><span class="career-title">${esc(f.title)}</span><span class="career-track"><i style="width:${Math.max(1,f[metric]/max*100)}%" class="${f.multiple>=2.5?'':'under-mark'}"></i></span><strong>${metric==='gross'?money(f.gross):f.multiple.toFixed(1)+'×'}</strong></a>`).join('')}</div>${chronology.length>12?`<button class="button outline" id="career-expand">${expanded?'Show latest 12 films':'Show all '+chronology.length+' films'} ↓</button>`:''}`:'<p>No films with both financial fields in this filtered view. Choose another decade or role.</p>'}<p class="small-note">Gross is reported ticket sales, not profit or personal earnings. These are films this person was credited on, not outcomes caused by them. No adjustment for inflation, market size, billing, franchises, or co-stars. The 1916–2017 snapshot is selective and excludes recent work; missing numbers are omitted, never treated as zero.</p>`;
    if(valid.length>=5){
      const box=document.createElement('div');box.className='reel-lab';
      box.innerHTML='<span class="mini-label">A SMALL EXPERIMENT IN SELECTIVE EVIDENCE</span><h4>Same career. Different highlight reel.</h4><p>Would five films change your impression? Draw five different films from this selection and see which story the sample tells.</p><button class="button violet" id="shuffle-reel">Shuffle a five-film reel ↻</button><div id="reel-result" aria-live="polite"></div><p class="small-note">This shuffles observed credits, not the person’s talent or actual release history. It illustrates selection and small samples; it does not estimate how much success was caused by luck.</p>';
      $('person-profile').insertBefore(box,$('person-profile').querySelector(':scope>.small-note'));
      $('shuffle-reel').addEventListener('click',()=>{
        const copy=valid.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
        const reel=copy.slice(0,5);
        const clears=reel.filter(f=>f.multiple>=2.5).length;
        const sampleMean=reel.reduce((n,f)=>n+f.multiple,0)/5,fullMean=valid.reduce((n,f)=>n+f.multiple,0)/valid.length;
        $('reel-result').innerHTML=`<div class="reel-score"><strong>${clears} / 5</strong><span>cleared 2.5× in this reel<br>Full selection: ${hits} / ${valid.length}</span></div><div class="reel-films">${reel.map(f=>`<span><strong>${esc(f.title)}</strong><small>${f.year} · ${f.multiple.toFixed(1)}× gross / budget</small></span>`).join('')}</div><p>This reel’s average multiple: <strong>${sampleMean.toFixed(1)}×</strong>. Full selection’s average: <strong>${fullMean.toFixed(1)}×</strong>. Every film is real; which five you see changes the impression.</p>`;
      });
    }
    $('career-expand')?.addEventListener('click',()=>{expanded=!expanded;renderProfile();});
  }
  ['people-search','people-decade','people-role'].forEach(id=>$(id).addEventListener(id==='people-search'?'input':'change',()=>{visible=12;const found=list();if(!found.some(p=>p.id===selected)&&found.length)selected=found[0].id;expanded=false;renderList();renderProfile();}));
  $('people-metric').addEventListener('change',renderProfile);
  $('people-more').addEventListener('click',()=>{visible+=12;renderList();});
  $('people-surprise').addEventListener('click',()=>{const known=list().filter(p=>p.featured<999&&filteredFilms(p).filter(f=>f.multiple!==null).length>=3);if(!known.length)return;selected=known[Math.floor(Math.random()*known.length)].id;expanded=false;renderList();renderProfile();$('person-profile').scrollIntoView({behavior:'smooth',block:'start'});$('person-heading').focus({preventScroll:true});});
  renderList();renderProfile();
})();
