window.NestPublic = {
    area(value) {
        const s=String(value??'').trim(),n=Number(s.replace(/,/g,'').match(/[\d.]+/)?.[0]);
        if(!s)return '-';
        if(s.includes('평')&&Number.isFinite(n))return (n*3.305785).toLocaleString('ko-KR',{maximumFractionDigits:2})+'㎡ ('+n+'평)';
        return s;
    },
    address(value) {
        return String(value || '').replace(/(\S+(?:동|읍|면|리|가))\s+(?:산\s*)?\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/(\S+(?:로|길))\s+\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/\s{2,}/g, ' ').trim();
    },
    title(p) {
        return this.address(p.title || '');
    }
};
