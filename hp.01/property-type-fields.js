(function(){
    'use strict';
    const record=typeof p!=='undefined'?p:{};
    const editing=['add','edit'].includes(new URLSearchParams(location.search).get('mode'));
    const grid=document.querySelector('.spec-grid'),typeInput=document.getElementById('editType');
    if(!grid)return;
    const housingTypes=['주택','주거용','아파트','오피스텔'];
    const isHousing=type=>housingTypes.includes(type);
    const visibleType=()=>editing?typeInput?.value||record.type:record.type;
    const hide=id=>{const row=document.getElementById(id)?.closest('.spec-item');if(row)row.style.setProperty('display','none','important');};
    hide('specUnregistered');hide('specViolation');hide('specParking');hide('specRooms');
    const directionLabel=document.getElementById('specDirection')?.closest('.spec-item')?.querySelector('.spec-label');
    const style=document.createElement('style');style.textContent='.type-field-control{width:100%;min-width:0;padding:7px 8px;border:1px solid #d6dde5;border-radius:5px;font:inherit;box-sizing:border-box}.type-fee-card{grid-column:1/-1;margin-top:12px;padding:15px;background:#f8fafc;border:1px solid #e2e8ef;border-radius:8px}.type-fee-card h3{font-size:14px;margin:0 0 12px;color:#31465e}.type-fee-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.type-fee-fields label{font-size:12px;color:#617085;display:block}.type-fee-fields input,.type-fee-fields select{margin-top:5px}.type-fee-items{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:14px;font-size:12px}.type-fee-items label{display:flex;align-items:center;gap:5px}.type-fee-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;font-size:12px}.type-fee-breakdown label{display:flex;align-items:center;gap:8px}.type-fee-breakdown input{width:110px}.type-fee-summary{white-space:pre-wrap;font-size:12px;color:#5f7086;line-height:1.8}@media(max-width:480px){.type-fee-fields,.type-fee-breakdown{grid-template-columns:1fr}}';document.head.append(style);
    const controls={};
    function control(key,kind,value,options){
        const input=document.createElement(kind==='select'?'select':'input');input.className='type-field-control';input.id='typeField_'+key;
        if(kind==='select'){options.forEach(option=>input.add(new Option(option||'선택하세요',option)))}
        else {input.type=kind; if(kind==='number'){input.min='0';input.step='1';input.inputMode='numeric'}}
        input.value=value??'';controls[key]=input;return input;
    }
    function row(label,key,kind,value,options){
        const item=document.createElement('div');item.className='spec-item';const name=document.createElement('div'),val=document.createElement('div');name.className='spec-label';name.textContent=label;val.className='spec-val';
        if(editing){const input=control(key,kind,value,options);input.setAttribute('aria-label',label);val.append(input)}else val.textContent=value===0?'0':String(value??'').trim()||'확인 필요';
        item.append(name,val);grid.append(item);return {item,val};
    }
    const parking=row('주차가능여부','parkingAvailable','select',record.parkingAvailable,['','가능','불가능']);
    const parkingLabel=parking.item.querySelector('.spec-label');
    if(parkingLabel)parkingLabel.style.cssText+=';white-space:nowrap;flex-basis:86px;width:86px;';
    const parkingCount=row('주차대수','parkingCount','number',record.parkingCount);
    const room=row('방 개수','roomCount','number',record.roomCount);
    const bathroom=row('화장실 수','bathroomCount','number',record.bathroomCount);
    if(!editing){if(record.parkingCount!=null)parkingCount.val.textContent=record.parkingCount+'대';if(record.roomCount!=null)room.val.textContent=record.roomCount+'개';if(record.bathroomCount!=null)bathroom.val.textContent=record.bathroomCount+'개';}
    const card=document.createElement('section');card.className='type-fee-card';const heading=document.createElement('h3');heading.textContent='관리비 부과정보 및 세부내역';card.append(heading);grid.append(card);
    const old=record.maintenanceDetail||{};
    const categories=['전기료','수도료','가스료','난방비','인터넷','TV사용료','공용관리비','기타관리비'];
    if(editing){
        const fields=document.createElement('div');fields.className='type-fee-fields';
        function field(label,key,kind,value,options){const wrap=document.createElement('label');wrap.textContent=label;wrap.append(control(key,kind,value,options));fields.append(wrap);}
        field('부과방식','billingMethod','select',old.billingMethod,['','정액관리비','정액관리비 (세부내역 미고지한 경우)','기타부과','확인불가']);
        field('부과기준','billingBasis','select',old.billingBasis,['','직전 월 관리비','최근 3개월 평균','최근 1년 평균','기타']);
        field('부과기준 설명 / 미고지·확인불가 사유','basisNote','text',old.basisNote);
        field('관리비 타입','feeType','select',old.feeType,['','정액','실비','없음','확인불가']);
        field('관리비 총액 (원)','feeAmount','number',record.maintenance);
        card.append(fields);
        const items=document.createElement('div');items.className='type-fee-items';
        categories.forEach((category,i)=>{const label=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.id='typeField_include'+i;cb.value=category;cb.checked=(old.includes||[]).includes(category);controls['include'+i]=cb;label.append(cb,document.createTextNode(category));items.append(label)});
        const noneLabel=document.createElement('label'),none=document.createElement('input');none.type='checkbox';none.id='typeField_noIncludedItems';none.checked=!!old.noIncludedItems;controls.noIncludedItems=none;noneLabel.append(none,document.createTextNode('관리비 포함항목 없음'));items.append(noneLabel);card.append(items);
        const breakdown=document.createElement('div');breakdown.className='type-fee-breakdown';
        categories.forEach((category,i)=>{const label=document.createElement('label');label.textContent=category+' (원)';label.append(control('amount'+i,'number',old.amounts?.[category]));breakdown.append(label)});card.append(breakdown);
        const note=document.createElement('p');note.style.cssText='font-size:11px;color:#8590a0;margin-bottom:0';note.textContent='확인한 값만 입력하세요. 빈칸은 0원과 구분하며, 세부내역 미고지는 사유를 기재할 수 있습니다.';card.append(note);
        function syncIncluded(){categories.forEach((_,i)=>{const cb=controls['include'+i];cb.disabled=none.checked;controls['amount'+i].disabled=none.checked||!cb.checked;})}
        none.onchange=syncIncluded;categories.forEach((_,i)=>controls['include'+i].onchange=syncIncluded);syncIncluded();
        const legacyFee=document.getElementById('editMaintenance');
        if(legacyFee){controls.feeAmount.oninput=()=>{legacyFee.value=controls.feeAmount.value===''?'':String(Number(controls.feeAmount.value)/10000)};legacyFee.addEventListener('input',()=>{const v=legacyFee.value.replace(/,/g,'');controls.feeAmount.value=v===''?'':String(Number(v)*10000)})}
        controls.parkingAvailable.onchange=()=>{const unavailable=controls.parkingAvailable.value==='불가능';controls.parkingCount.disabled=unavailable;if(unavailable)controls.parkingCount.value='0'};controls.parkingAvailable.onchange();
    }else{
        const info=document.createElement('div');info.className='type-fee-summary';const lines=[];
        [['부과방식',old.billingMethod],['부과기준',old.billingBasis],['기준·사유',old.basisNote],['관리비 타입',old.feeType]].forEach(([label,value])=>{if(value)lines.push(label+': '+value)});
        if(record.maintenance!==''&&record.maintenance!=null)lines.push('관리비 총액: '+Number(record.maintenance).toLocaleString('ko-KR')+'원');
        if(old.noIncludedItems)lines.push('관리비 포함항목 없음');else if(old.includes?.length)lines.push('포함항목: '+old.includes.join(', '));
        Object.entries(old.amounts||{}).forEach(([key,value])=>{if(value!==null&&value!=='')lines.push(key+': '+Number(value).toLocaleString('ko-KR')+'원')});
        info.textContent=lines.length?lines.join('\n'):'관리비 정보 확인 필요';card.append(info);
    }
    function visibility(){
        const type=visibleType(),housing=isHousing(type),commercial=['상가','사무실'].includes(type);
        room.item.style.display=housing||type==='상가'?'':'none';bathroom.item.style.display=housing?'':'none';parking.item.style.display=parkingCount.item.style.display=housing||commercial?'':'none';card.style.display=housing?'':'none';
        if(directionLabel)directionLabel.textContent='방향';
        const direction=document.getElementById('specDirection');
        if(direction&&!editing){
            const value=String(record.direction||'확인 필요').replace(/\s*\([^)]*기준[^)]*\)/g,'').trim();
            direction.textContent=value+' '+(housing?'(주실기준)':'(주출입구기준)');
        }
    }
    visibility();typeInput?.addEventListener('change',visibility);
    function splitAreaDisplay(){
        const area=document.getElementById('specArea');
        if(!area||editing)return;
        area.replaceChildren();area.style.cssText+=';display:grid;gap:4px;width:100%;text-align:left;';
        [['임대',record.supplyArea],['전용',record.exclusiveArea||record.supplyArea]].forEach(([label,value])=>{
            const line=document.createElement('span');line.style.cssText='display:grid;grid-template-columns:26px minmax(0,1fr);gap:5px;align-items:baseline;';
            const name=document.createElement('span'),amount=document.createElement('span');name.textContent=label;amount.textContent=window.NestPublic?window.NestPublic.area(value):String(value||'확인 필요');line.append(name,amount);area.append(line);
        });
    }
    splitAreaDisplay();
    if(typeof window.toggleAreaUnit==='function'){
        const toggle=window.toggleAreaUnit;
        window.toggleAreaUnit=function(){toggle();splitAreaDisplay()};
    }
    const num=key=>controls[key]?.value===''||!controls[key]?null:Number(controls[key].value);
    window.NestPropertyFields={
        validate(){
            if(!editing)return '';
            const type=visibleType(),keys=['주택','주거용','아파트','오피스텔','상가','사무실'].includes(type)?['parkingCount']:[];
            if(isHousing(type)||type==='상가')keys.push('roomCount');if(isHousing(type))keys.push('bathroomCount','feeAmount');
            for(const key of keys){const n=num(key);if(n!==null&&(!Number.isFinite(n)||n<0||!Number.isInteger(n))){controls[key].focus();return '주차·방·화장실 수 및 관리비는 0 이상의 정수로 입력하세요.'}}
            if(isHousing(type)){for(let i=0;i<categories.length;i++){const n=num('amount'+i);if(!controls['amount'+i].disabled&&n!==null&&(!Number.isInteger(n)||n<0))return '관리비 세부 금액을 확인하세요.'}}
            return '';
        },
        collect(){
            if(!editing)return {};
            const type=visibleType(),housing=isHousing(type),result={};
            if(housing||['상가','사무실'].includes(type)){result.parkingAvailable=controls.parkingAvailable.value;result.parkingCount=controls.parkingAvailable.value==='불가능'?0:num('parkingCount');result.parking=result.parkingAvailable||result.parkingCount!=null?[result.parkingAvailable,result.parkingCount==null?'':result.parkingCount+'대'].filter(Boolean).join(' / '):(record.parking||'')}
            if(housing||type==='상가')result.roomCount=num('roomCount');if(housing)result.bathroomCount=num('bathroomCount');
            if(housing||type==='상가')result.rooms=(result.roomCount==null&&(!housing||result.bathroomCount==null)&&record.rooms)?record.rooms:[result.roomCount==null?'방 미입력':'방 '+result.roomCount+'개',housing?(result.bathroomCount==null?'화장실 미입력':'화장실 '+result.bathroomCount+'개'):''].filter(Boolean).join(' / ');
            if(housing){const none=controls.noIncludedItems.checked,includes=none?[]:categories.filter((_,i)=>controls['include'+i].checked),amounts={};categories.forEach((key,i)=>{if(includes.includes(key))amounts[key]=num('amount'+i)});result.maintenance=num('feeAmount');result.maintenanceDetail={billingMethod:controls.billingMethod.value,billingBasis:controls.billingBasis.value,basisNote:controls.basisNote.value.trim(),feeType:controls.feeType.value,includes,amounts,noIncludedItems:none};}
            return result;
        }
    };
})();
