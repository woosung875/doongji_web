(function(){
    const clean=s=>String(s||'').replace(/\([^)]*\)/g,'').replace(/\s/g,'').toLowerCase();
    function split(value){
        const raw=String(value||'').trim();
        const start=raw.search(/(?:서울특별시|서울시|경기도|부산광역시|인천광역시|대구광역시|대전광역시|광주광역시|울산광역시|세종특별자치시)/);
        if(start<=0)return null;
        const name=raw.slice(0,start).trim(),rest=raw.slice(start);
        const match=rest.match(/^(.+?(?:\s|^)[^\s]+(?:동|읍|면|리))(?=\s|$)/);
        if(!match)return null;
        return {name,region:match[1].trim(),unit:rest.slice(match[1].length).trim(),source:raw};
    }
    function candidates(parts,rows){
        const regionTokens=parts.region.split(/\s+/).slice(1);
        return rows.filter(r=>r.address_name&&regionTokens.every(t=>r.address_name.includes(t))).map(r=>({name:r.place_name,address:r.address_name,roadAddress:r.road_address_name||'',lat:Number(r.y),lng:Number(r.x),unit:parts.unit}));
    }
    function resolve(property){
        return new Promise(done=>{
            const parts=split(property.sourceAddress||property.address);
            if(!parts||!window.kakao?.maps?.services?.Places)return done(null);
            const timer=setTimeout(()=>done(null),7000);
            new kakao.maps.services.Places().keywordSearch(parts.region+' '+parts.name,(rows,status,pagination)=>{
                clearTimeout(timer);if(status!==kakao.maps.services.Status.OK)return done(null);
                const matches=candidates(parts,rows),exact=matches.filter(r=>clean(r.name)===clean(parts.name));
                const unique=new Map(exact.map(r=>[r.address,r]));
                if(unique.size===1&&!pagination?.hasNext){const result=[...unique.values()][0];return done({...result,address:result.address+(parts.unit?' '+parts.unit:''),sourceAddress:parts.source,complexName:parts.name})}
                done({candidates:matches,complexName:parts.name,sourceAddress:parts.source});
            });
        });
    }
    window.NestComplexAddress={split,candidates,resolve};
})();
