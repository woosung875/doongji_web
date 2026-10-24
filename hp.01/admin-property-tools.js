(function(){
    const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch(e){return fallback}};
    function users(){return typeof getUsers==='function'?getUsers():read('nest_users',[])}
    function searchSelect(select){
        if(!select||select.disabled)return;
        const search=document.createElement('input');search.type='search';search.placeholder='매니저 이름 검색';search.setAttribute('aria-label','매니저 이름 검색');search.style.cssText='width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:5px;margin:6px 0';select.before(search);
        search.oninput=()=>{const selected=select.value;const options=users().filter(u=>u.name.includes(search.value.trim())||u.name===selected);select.replaceChildren();options.forEach(u=>select.add(new Option(u.name,u.name)));select.value=selected};
    }
    const filters=document.getElementById('adminFilterRegion');
    if(filters){
        const select=document.createElement('select');select.id='adminFilterWriter';select.setAttribute('aria-label','담당 매니저별 매물 필터');select.style.cssText=filters.style.cssText;
        const search=document.createElement('input');search.type='search';search.id='adminPropertySearch';search.placeholder='매물 검색 (주소·번지·매물명)';search.style.cssText='padding:8px;border:1px solid #ddd;border-radius:4px;width:250px';search.setAttribute('aria-label','매물 검색');
        const current=JSON.parse(sessionStorage.getItem('nest_currentUser')||'{"role":"master"}');
        function fill(){const previous=select.value;select.replaceChildren(new Option('전체 담당자',''));const names=new Set(users().map(u=>u.name).filter(Boolean));[...names].sort().filter(n=>(current.role==='master'||n===current.name)).forEach(n=>select.add(new Option(n,n)));select.value=[...select.options].some(o=>o.value===previous)?previous:'';}
        filters.before(search,select);fill();search.oninput=()=>applyAdminFilters();select.onchange=()=>applyAdminFilters();window.addEventListener('focus',fill);window.addEventListener('storage',e=>{if(e.key==='nest_users'){fill();applyAdminFilters()}});
    }
    const writer=document.getElementById('editWriter');
    if(writer){
        const selected=writer.value, current=JSON.parse(sessionStorage.getItem('nest_currentUser')||'{"role":"master"}');const list=users();
        writer.replaceChildren(new Option('담당자 선택',''));list.forEach(u=>writer.add(new Option(u.name,u.name)));
        const saved=typeof p!=='undefined'?p.writer:'';
        if(saved&&!list.some(u=>u.name===saved))writer.add(new Option(saved+' (기존 담당자)',saved));
        writer.value=(new URLSearchParams(location.search).get('mode')==='add'?current.name:saved)||selected;
        if(current.role!=='master'){writer.value=current.name||'';writer.disabled=true}else writer.disabled=false;
        searchSelect(writer);
    }
    let loading;
    function postcodeReady(){
        if(window.daum?.Postcode)return Promise.resolve();
        if(loading)return loading;
        loading=new Promise((resolve,reject)=>{const script=document.createElement('script');const timer=setTimeout(()=>reject(Error('주소검색 연결 시간이 초과되었습니다. 인터넷 연결을 확인하세요.')),10000);script.src='https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';script.onload=()=>{clearTimeout(timer);window.daum?.Postcode?resolve():reject(Error('주소검색 초기화 실패'))};script.onerror=()=>{clearTimeout(timer);reject(Error('주소검색 서비스를 불러오지 못했습니다.'))};document.head.append(script)}).catch(e=>{loading=null;throw e});return loading;
    }
    async function openAddress(input){
        const dialog=document.createElement('dialog');dialog.style.cssText='width:min(520px,95vw);height:min(600px,85vh);padding:12px;border:1px solid #b5954e;border-radius:10px';const close=document.createElement('button');close.type='button';close.textContent='주소검색 닫기 ×';const message=document.createElement('p');message.textContent='주소검색을 불러오는 중입니다…';const host=document.createElement('div');host.style.cssText='width:100%;height:calc(100% - 50px);min-height:350px';dialog.append(close,message,host);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();
        try{await postcodeReady();if(!dialog.open)return;message.remove();new daum.Postcode({oncomplete:data=>{input.value=data.jibunAddress||data.roadAddress||data.address;input.dispatchEvent(new Event('change',{bubbles:true}));if(typeof window.updateLiveTraffic==='function')window.updateLiveTraffic(input.value);dialog.close()},width:'100%',height:'100%'}).embed(host)}catch(e){message.textContent=e.message;}
    }
    window.execDaumPostcodeDetail=()=>openAddress(document.getElementById('editAddress'));
    // Capture the legacy handler so it cannot open a hidden/zero-width embedded layer.
    document.addEventListener('click',e=>{const target=e.target.closest('#btnSearchAddress,#propAddress');if(target){e.preventDefault();e.stopImmediatePropagation();openAddress(document.getElementById('propAddress'))}},true);
})();
