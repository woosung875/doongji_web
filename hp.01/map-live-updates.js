(function(){
    let busy=false;
    async function update(){
        if(busy)return;
        if(typeof applyFilters==='function')applyFilters();
        if(!window.kakao?.maps?.services)return;
        busy=true;
        try{
            const list=JSON.parse(localStorage.getItem('nest_properties')||'[]');
            for(const item of list.filter(p=>p.address&&(!p.lat||!p.lng))){
                const address=item.address;
                const complex=window.NestComplexAddress?.split(item.sourceAddress||address);
                const resolved=complex?await window.NestComplexAddress.resolve(item):null;
                if(complex&&!resolved?.lat)continue;
                const result=resolved?{x:resolved.lng,y:resolved.lat,address:resolved.address}:await new Promise(resolve=>{const timer=setTimeout(()=>resolve(null),6000);new kakao.maps.services.Geocoder().addressSearch(address.replace(/\s+(?:지하\s*)?\d+층.*$/,''),(rows,status)=>{clearTimeout(timer);resolve(status===kakao.maps.services.Status.OK&&rows.length?rows[0]:null)})});
                if(result){const latest=JSON.parse(localStorage.getItem('nest_properties')||'[]');const p=latest.find(p=>p.id===item.id&&p.address===address);if(p){p.lat=Number(result.y);p.lng=Number(result.x);if(result.address){p.sourceAddress=p.sourceAddress||p.address;p.address=result.address;}p.geocodeStatus='resolved';localStorage.setItem('nest_properties',JSON.stringify(latest));if(typeof applyFilters==='function')applyFilters()}}
                await new Promise(resolve=>setTimeout(resolve,150));
            }
        }finally{busy=false}
    }
    window.addEventListener('storage',e=>{if(e.key==='nest_properties')update()});window.addEventListener('focus',update);update();
})();
