window.NestPublic = {
    area(value) {
        const s=String(value??'').trim(),n=Number(s.replace(/,/g,'').match(/[\d.]+/)?.[0]);
        if(!s)return '-';
        if(Number.isFinite(n)&&/㎡|m²|m2|평|py/i.test(s)){
            const py=/평|py/i.test(s)&&!/㎡|m²|m2/i.test(s)?n:n/3.305785;
            const sqm=/평|py/i.test(s)&&!/㎡|m²|m2/i.test(s)?n*3.305785:n;
            return sqm.toLocaleString('ko-KR',{maximumFractionDigits:2})+'㎡ ('+py.toFixed(1)+'py)';
        }
        return s;
    },
    managerCode(property) {
        const name=String(typeof property==='string'?property:property?.writer||'').trim();
        const sameName=(a,b)=>a===b||a.startsWith(b+' ')||a.startsWith(b+'/');
        try {
            const users=JSON.parse(localStorage.getItem('nest_users')||'[]');
            const matches=users.filter(u=>u.name&&(sameName(name,String(u.name).trim())||sameName(String(u.name).trim(),name)));
            const exact=matches.find(u=>u.name===name), user=exact||(matches.length===1?matches[0]:null);
            if(user&&Object.prototype.hasOwnProperty.call(user,'managerCode'))return String(user.managerCode||'').toUpperCase();
        }catch(e){}
        if(typeof property==='object'&&Object.prototype.hasOwnProperty.call(property,'managerCode'))return String(property.managerCode||'').toUpperCase();
        const codes={'김우성':'KK','배기열':'BB','조건희':'AA','배우리':'RR'};
        const match=Object.keys(codes).find(n=>name===n||name.startsWith(n+' ')||name.startsWith(n+'/'));
        return match?codes[match]:'';
    },
    exclusive(property) {
        const code=this.managerCode(property);
        return this.area(property.exclusiveArea)+(code?' · '+code:'');
    },
    address(value) {
        return String(value || '').replace(/(\S+(?:동|읍|면|리|가))\s+(?:산\s*)?\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/(\S+(?:로|길))\s+\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/\s{2,}/g, ' ').trim();
    },
    title(p) {
        return this.address(p.title || '');
    }
};
