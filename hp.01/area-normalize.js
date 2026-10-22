(function () {
    function normalize(p) {
        if (!String(p.exclusiveArea ?? '').trim() && String(p.supplyArea ?? '').trim()) {
            p.exclusiveArea = p.supplyArea;
            p.areaNeedsReview = true;
            p.exclusiveAreaSource = 'copied-from-rental';
        }
        return p;
    }
    window.NestNormalizeArea = normalize;
    try {
        const raw = localStorage.getItem('nest_properties');
        if (!raw) return;
        const rows = JSON.parse(raw);
        if (!Array.isArray(rows)) return;
        let changed = false;
        rows.forEach(p => { if (!String(p.exclusiveArea ?? '').trim() && String(p.supplyArea ?? '').trim()) { normalize(p); changed = true; } });
        if (changed) {
            localStorage.setItem('nest_properties_backup_area_' + Date.now(), raw);
            localStorage.setItem('nest_properties', JSON.stringify(rows));
        }
    } catch (e) { console.error('면적 자동 보완 실패: 기존 데이터는 유지됩니다.', e); }
})();
