(function () {
    'use strict';
    const config = window.NestExcelConfig || {};
    const localStorage = config.storage || window.localStorage;
    const sessionStorage = config.session || window.sessionStorage;
    const text = v => String(v ?? '').trim();
    const types = { 사무실: '사무실', 상가점포: '상가', 상가: '상가', 주택: '주택', 아파트: '아파트', 오피스텔: '오피스텔', 빌딩건물: '빌딩', 빌딩: '빌딩', 토지: '토지' };
    const money = v => {
        const s = text(v).replace(/,/g, '');
        if (!/^\d+(\.\d+)?$/.test(s)) throw Error('가격은 만원 단위 숫자여야 합니다');
        return Number(s);
    };
    const fmt = n => n.toLocaleString('ko-KR', { maximumFractionDigits: 4 }) + '만원';
    function convert(row, rowNumber) {
        const propertyNo = text(row['네이버매물번호'] || row['매물번호']);
        if (!propertyNo) throw Error('매물번호가 비어 있습니다');
        const type = types[text(row['매물분류'])];
        const deal = text(row['거래종류']);
        if (!type) throw Error('지원하지 않는 매물분류: ' + text(row['매물분류']));
        if (!['월세', '매매', '전세'].includes(deal)) throw Error('거래종류를 확인하세요');
        const address = text(row['소재지']);
        if (!address) throw Error('소재지가 비어 있습니다');
        const area = text(row['면적']);
        if (!/㎡|m²|m2/i.test(area)) throw Error('면적 단위(㎡)를 확인하세요');
        const parts = area.replace(/\(?(㎡|m²|m2)\)?/ig, '').split('/').map(s => text(s).replace(/,/g, ''));
        if (parts.length > 2 || parts.some(s => !/^\d+(\.\d+)?$/.test(s) || Number(s) <= 0)) throw Error('면적을 확인하세요');
        const prices = text(row['매물가(만원)']).split('/');
        if (prices.length !== (deal === '월세' ? 2 : 1)) throw Error('가격 형식: 월세는 보증금/임대료, 매매·전세는 단일 금액');
        const a = money(prices[0]), b = deal === '월세' ? money(prices[1]) : null;
        const desc = text(row['매물특징']);
        const floor = address.match(/(?:지하\s*)?\d+층/);
        return {
            propertyNo, naverPropertyNo: propertyNo, sourceAddress: address,
            type, sourceCategory: text(row['매물분류']), dealType: deal,
            tag: address.includes('서울') ? '서울' : address.includes('경기') ? '경기' : address.split(/\s/)[0],
            address, title: address + ' ' + type, desc,
            supplyArea: Number(parts[0]) + '㎡', exclusiveArea: Number(parts[1] || parts[0]) + '㎡',
            price: deal === '월세' ? `보증금 ${fmt(a)} / 월 ${fmt(b)}` : `${deal} ${fmt(a)}`,
            salePrice: deal === '매매' ? a : null, deposit: deal === '매매' ? null : a, monthlyRent: b,
            moveInDate: text(row['입주정보']), adminMemo: text(row['관리자메모']),
            floor: floor ? floor[0] : '', imageUrl: '', imageUrls: [], maintenance: '',
            importRow: rowNumber, areaNeedsReview: parts.length === 1, exclusiveAreaSource: parts.length === 1 ? 'copied-from-rental' : 'excel',
            importKey: JSON.stringify([type, deal, address, parts, a, b, desc]),
            lat: null, lng: null, geocodeStatus: 'pending'
        };
    }
    function resolveWriter(memo, users) {
        const candidate = text(memo).slice(0, 3);
        const matches = users.filter(u => text(u.name) === candidate);
        return { candidate, name: matches.length === 1 ? text(matches[0].name) : '', valid: matches.length === 1 };
    }
    function merge(existing, incoming) {
        const changed = (existing.sourceAddress || existing.address) !== incoming.sourceAddress;
        const result = {...existing, ...incoming, id: existing.id, createdDate: existing.createdDate,
            imageUrl: existing.imageUrl || '', imageUrls: existing.imageUrls || [], maintenance: existing.maintenance ?? '',
            floor: incoming.floor || existing.floor || '', updatedAt: new Date().toISOString()};
        if (!changed) { result.address=existing.address; result.lat=existing.lat; result.lng=existing.lng; result.geocodeStatus=existing.geocodeStatus; }
        return result;
    }
    window.NestExcel = { convert, resolveWriter, merge };
    if (typeof document === 'undefined') return;
    const host = document.getElementById('propertiesTabArea');
    if (!host) return;
    const box = document.createElement('section');
    box.style.cssText = 'padding:20px;margin:16px 0;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px';
    box.innerHTML = '<h3>엑셀로 매물 일괄 등록</h3><p>같은 매물번호는 최신 정보로 업데이트하며, 사진·관리비 등 엑셀에 없는 정보는 유지합니다. 엑셀에서 빠진 매물은 삭제하지 않습니다. 등록리스트 양식 · 가격: 만원 · 면적: ㎡ (임대/전용). 전용면적이 없으면 임대면적과 동일하게 채웁니다. 자동 보완된 전용면적은 실제 면적 확인이 필요합니다.</p><input id="excelFile" type="file" accept=".xlsx,.xls"><button type="button" id="excelSave" disabled>미리보기 확인 후 등록·업데이트</button> <button type="button" id="excelRetry">지도 위치 재검색</button><p id="excelStatus" role="status" aria-live="polite"></p><div id="excelPreview" style="overflow:auto;max-height:420px"></div>';
    host.prepend(box);
    const file = box.querySelector('#excelFile'), save = box.querySelector('#excelSave'), retry = box.querySelector('#excelRetry'), status = box.querySelector('#excelStatus'), preview = box.querySelector('#excelPreview');
    let pending = [], busy = false;
    const esc = s => text(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function stored() { const list = JSON.parse(localStorage.getItem('nest_properties') || '[]'); if (!Array.isArray(list)) throw Error('저장된 매물 데이터 오류'); return list; }
    file.onchange = async () => {
        pending = []; save.disabled = true; preview.replaceChildren();
        try {
            if (!file.files[0]) return;
            if (!window.XLSX) throw Error('엑셀 읽기 라이브러리를 불러오지 못했습니다. 인터넷 연결 후 새로고침하세요');
            const wb = XLSX.read(await file.files[0].arrayBuffer(), { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', blankrows: true, raw: false });
            const headers = rows.shift().map(text);
            for (const h of ['매물분류','거래종류','면적','소재지','매물특징','매물가(만원)']) if (!headers.includes(h)) throw Error('필수 열 누락: ' + h);
            const existing = stored(); const keys = new Set();
            if (!headers.includes('네이버매물번호') && !headers.includes('매물번호')) throw Error('매물번호 열이 필요합니다');
            let errors = 0, duplicates = 0, body = '';
            rows.forEach((values, i) => {
                if (values.every(v => !text(v))) return;
                try {
                    const p = convert(Object.fromEntries(headers.map((h,j) => [h,values[j]])), i+2);
                    const users = typeof getUsers === 'function' ? getUsers() : JSON.parse(localStorage.getItem('nest_users') || '[]');
                    const owner = resolveWriter(p.adminMemo, users);
                    const currentUser = JSON.parse(sessionStorage.getItem('nest_currentUser') || '{"role":"master"}');
                    if (!owner.valid) throw Error('담당자 확인 필요: ' + (owner.candidate || '메모 없음') + ' (등록된 임직원 이름과 일치해야 합니다)');
                    if (currentUser.role !== 'master' && owner.name !== currentUser.name) throw Error('다른 담당자의 매물은 마스터 계정에서 등록하세요: ' + owner.name);
                    p.writer = owner.name;
                    const duplicate = keys.has(p.propertyNo); keys.add(p.propertyNo);
                    const matches = existing.filter(old => text(old.propertyNo || old.naverPropertyNo) === p.propertyNo);
                    if (matches.length > 1) throw Error('기존 데이터에 동일 매물번호가 여러 건입니다: ' + p.propertyNo);
                    if (matches.length && currentUser.role !== 'master' && matches[0].writer !== currentUser.name) throw Error('다른 담당자의 매물은 마스터만 업데이트할 수 있습니다');
                    if (duplicate) duplicates++; else pending.push(p);
                    body += '<tr>' + [i+2,p.propertyNo,p.writer,p.type,p.dealType,p.address,p.supplyArea,p.exclusiveArea || '미기재',p.price,p.desc,duplicate ? '중복 제외' : p.areaNeedsReview ? '전용면적 확인 필요' : matches.length ? '업데이트' : '신규 등록'].map(v => `<td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td>`).join('') + '</tr>';
                } catch(e) { errors++; body += `<tr><td colspan="11">${i+2}행 오류: ${esc(e.message)}</td></tr>`; }
            });
            preview.innerHTML = '<table style="width:100%;font-size:13px"><thead><tr>' + ['행','매물번호','담당자','분류','거래','소재지','임대면적','전용면적','가격','매물특징','확인'].map(h=>`<th>${h}</th>`).join('') + '</tr></thead><tbody>' + body + '</tbody></table>';
            status.textContent = `등록·업데이트 가능 ${pending.length}건 / 중복 제외 ${duplicates}건 / 오류 ${errors}건. 오류 행은 제외됩니다.`;
            save.disabled = !pending.length;
        } catch(e) { status.textContent = e.message; }
    };
    window.NestExcel.loadTestFile = async function (testFile) {
        const transfer = new DataTransfer(); transfer.items.add(testFile);
        file.files = transfer.files; await file.onchange();
    };
    async function geocodeProperty(p) {
        const result = await window.NestComplexAddress?.resolve(p);
        if (result?.candidates) { p.addressCandidates=result.candidates; p.addressNeedsReview=true; return null; }
        if (result) { p.sourceAddress=p.sourceAddress||p.address; p.address=result.address; p.complexName=result.complexName; p.addressNeedsReview=false; p.addressCandidates=[]; return result; }
        // A complex name without a confirmed address must not be located by a vague neighbourhood match.
        if (window.NestComplexAddress?.split(p.sourceAddress||p.address)) return null;
        return geocode(p.address);
    }
    function geocode(address) {
        return new Promise(resolve => {
            if (!window.kakao?.maps?.services) return resolve(null);
            const timer = setTimeout(() => resolve(null), 8000);
            const query = address.replace(/\s+(?:지하\s*)?\d+층.*$/, '').replace(/\s+(?:제\s*)?\d+호.*$/, '');
            new kakao.maps.services.Geocoder().addressSearch(query, (r,s) => {
                clearTimeout(timer);
                resolve(s === kakao.maps.services.Status.OK && r.length ? {lat: Number(r[0].y), lng: Number(r[0].x)} : null);
            });
        });
    }
    async function locate(list, targets) {
        for (let i=0; i<targets.length; i++) {
            status.textContent = `지도 위치 검색 ${i+1}/${targets.length}건`;
            const p = targets[i], coords = await geocodeProperty(p);
            if (coords) Object.assign(p, {lat:coords.lat,lng:coords.lng,geocodeStatus:'resolved'}); else p.geocodeStatus='failed';
            await new Promise(r => setTimeout(r, 120));
        }
        localStorage.setItem('nest_properties', JSON.stringify(list));
        showAddressCandidates(targets);
        if (typeof applyAdminFilters === 'function') applyAdminFilters();
        const failed = targets.filter(p=>p.geocodeStatus!=='resolved').length;
        status.textContent = `처리 완료 ${targets.length}건 · 지도 표시 ${targets.length-failed}건 · 위치 재확인 ${failed}건. ${!window.kakao?.maps?.services ? '카카오 지도 키와 허용 도메인을 확인한 후 지도 위치 재검색을 누르세요.' : '위치 미확인 매물은 주소를 수정하거나 재검색하세요.'}`;
    }
    async function run(action) {
        if (busy) return;
        busy=true; save.disabled=true; retry.disabled=true; file.disabled=true;
        try { await action(); } catch(e) { status.textContent='처리 실패: '+e.message; }
        finally { busy=false; retry.disabled=false; file.disabled=false; save.disabled=!pending.length; }
    }
    function showAddressCandidates(targets) {
        box.querySelector('#excelAddressCandidates')?.remove();
        const panel=document.createElement('div');panel.id='excelAddressCandidates';
        targets.filter(p=>p.addressNeedsReview).forEach(p=>{
            const group=document.createElement('div');group.style.cssText='padding:12px;margin:8px 0;border:1px solid #d8c492;border-radius:6px';
            const label=document.createElement('p');label.textContent=p.propertyNo+' · '+p.sourceAddress+' — 주소 후보 확인';group.append(label);
            (p.addressCandidates||[]).forEach(c=>{const button=document.createElement('button');button.type='button';button.textContent=c.name+' / '+c.address;button.onclick=()=>{
                const all=stored(),target=all.find(row=>row.id===p.id);if(!target)return;
                target.address=c.address+(c.unit?' '+c.unit:'');target.lat=c.lat;target.lng=c.lng;target.complexName=p.complexName;target.geocodeStatus='resolved';target.addressNeedsReview=false;target.addressCandidates=[];
                localStorage.setItem('nest_properties',JSON.stringify(all));group.textContent=p.propertyNo+' 주소 확인 완료: '+target.address;if(typeof applyAdminFilters==='function')applyAdminFilters();
            };group.append(button)});panel.append(group);
        });box.append(panel);
    }
    save.onclick = () => run(async () => {
        const list=stored();
        const user=JSON.parse(sessionStorage.getItem('nest_currentUser') || '{"role":"master"}');
        const users = typeof getUsers === 'function' ? getUsers() : JSON.parse(localStorage.getItem('nest_users') || '[]');
        if (pending.some(p => !resolveWriter(p.adminMemo, users).valid || (user.role !== 'master' && p.writer !== user.name))) throw Error('담당자 계정이 변경되었습니다. 파일을 다시 선택하세요');
        const targets=[], all=[...list];
        for(const p of pending){
            let matches=all.filter(old=>text(old.propertyNo||old.naverPropertyNo)===p.propertyNo);
            if(matches.length>1)throw Error('동일 매물번호 중복: '+p.propertyNo);
            // One-time link only where the complete legacy import fingerprint is identical.
            if(!matches.length)matches=all.filter(old=>!old.propertyNo&&!old.naverPropertyNo&&old.importKey===p.importKey);
            if(matches.length>1)throw Error('기존 매물 연결을 확인하세요: '+p.propertyNo);
            if(matches.length&&user.role!=='master'&&matches[0].writer!==user.name)throw Error('다른 담당자의 매물 업데이트 권한이 없습니다');
            const next=matches.length?merge(matches[0],p):{...p,id:'prop-'+crypto.randomUUID(),createdDate:new Date().toISOString().slice(0,10)};
            if(matches.length)all[all.indexOf(matches[0])]=next;else all.unshift(next);targets.push(next);
        }
        localStorage.setItem('nest_properties_backup_excel_'+Date.now(),JSON.stringify(list));
        localStorage.setItem('nest_properties',JSON.stringify(all));pending=[];
        await locate(all,targets);
    });
    retry.onclick = () => run(async () => { const list=stored(); const user=JSON.parse(sessionStorage.getItem('nest_currentUser') || '{"role":"master"}'); await locate(list,list.filter(p=>p.importKey && (!p.lat || !p.lng) && (user.role==='master' || p.writer===user.name))); });
})();
