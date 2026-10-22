(function () {
    const style = document.createElement('style');
    style.textContent = '#groupPicker{position:fixed;right:0;top:80px;bottom:0;width:min(390px,92vw);background:white;z-index:9998;box-shadow:-8px 0 32px #162d4633;transform:translateX(110%);transition:transform .28s ease;display:flex;flex-direction:column}#groupPicker.open{transform:translateX(0)}#groupPicker header{padding:20px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center}#groupPickerList{padding:16px;overflow:auto}#groupPicker button{cursor:pointer;font:inherit}#groupPickerList button{display:block;text-align:left;width:100%;padding:18px;margin-bottom:12px;border:1px solid #dbe2ea;border-radius:10px;background:#fff;white-space:pre-line;line-height:1.7}#groupPickerList button:hover{border-color:#b5954e;background:#fffbef}';
    style.textContent += `
    #groupPicker,#groupPicker *{box-sizing:border-box}
    #groupPicker{width:min(410px,94vw);background:#f3f5f8;border-radius:18px 0 0 0;overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1)}
    #groupPicker header{position:static!important;inset:auto!important;width:100%;flex:0 0 auto;min-height:78px;padding:20px 22px;background:linear-gradient(120deg,#18283c,#2c425b);box-shadow:none!important;gap:12px}
    #groupPicker header strong{color:#fff!important;font-size:17px;line-height:1.4}
    #groupPicker header button{color:#fff;background:#ffffff14;border:1px solid #ffffff40;border-radius:22px;padding:8px 12px;font-size:12px;white-space:nowrap}
    #groupPicker header button:hover{background:#ffffff30}
    #groupPickerList{flex:1;min-height:0;padding:18px;overscroll-behavior:contain}
    #groupPickerList button{padding:20px;margin:0 0 14px;border-color:#e4e9f0;border-radius:14px;box-shadow:0 3px 12px #18283c06;white-space:normal;color:#25364a;transition:transform .2s,box-shadow .2s}
    #groupPickerList button:hover{transform:translateY(-2px);background:white;box-shadow:0 8px 22px #18283c12}
    #groupPickerList span{display:block;overflow-wrap:anywhere}
    #groupPickerList .picker-kind{display:inline-block;background:#f4efdf;color:#8a6d2d;border-radius:6px;padding:3px 8px;font-size:11px;margin-bottom:10px}
    #groupPickerList .picker-title{font-size:15px;font-weight:700;margin-bottom:8px}
    #groupPickerList .picker-price{font-size:15px;font-weight:700;color:#223d59;margin-bottom:12px}
    #groupPickerList .picker-meta,#groupPickerList .picker-address{font-size:12px;color:#768396}
    #groupPickerList .picker-link{border-top:1px solid #eef1f5;margin-top:14px;padding-top:12px;color:#9a7a36;font-size:12px;font-weight:600}
    #premiumDetailModal{display:flex!important;visibility:hidden;pointer-events:none;opacity:0;justify-content:flex-end!important;align-items:stretch!important;padding:0!important;background:#12223866!important;transition:opacity .3s,visibility .3s}
    #premiumDetailModal>div{width:min(1050px,96vw)!important;max-width:1050px!important;height:100%!important;border-radius:18px 0 0 18px!important;animation:none!important;transform:translateX(100%);transition:transform .38s cubic-bezier(.22,1,.36,1)!important}
    #premiumDetailModal.drawer-open{visibility:visible;pointer-events:auto;opacity:1}
    #premiumDetailModal.drawer-open>div{transform:translateX(0)}
    #premiumDetailModal .drawer-close{position:absolute;right:16px;top:12px;z-index:10010;width:32px;height:32px;border:1px solid #dce3eb;border-radius:50%;background:white;color:#52657b;font-size:22px;cursor:pointer;box-shadow:0 2px 8px #15283c12}
    @media(prefers-reduced-motion:reduce){#groupPicker,#premiumDetailModal,#premiumDetailModal>div{transition:none!important}}
    `;
    style.textContent += `
    #groupPicker{width:min(410px,34vw)}
    #premiumDetailModal{left:auto!important;right:min(410px,34vw)!important;top:80px!important;bottom:0!important;width:min(1050px,66vw)!important;height:auto!important;background:transparent!important;overflow:hidden}
    #premiumDetailModal>div{width:100%!important;max-width:none!important;border-radius:18px 0 0 0!important;box-shadow:-8px 0 32px #162d4626!important}
    #groupPickerList button.selected{border-color:#b5954e;background:#fffaf0;box-shadow:0 0 0 1px #b5954e}
    @media(max-width:700px){
      #groupPicker{width:100%;top:64px;height:32vh;bottom:auto;border-radius:0}
      #groupPicker header{min-height:52px;padding:10px 16px}
      #groupPickerList{display:flex;gap:12px;padding:10px;overflow:auto}
      #groupPickerList button{flex:0 0 240px;margin:0;padding:12px}
      #groupPickerList .picker-meta,#groupPickerList .picker-address,#groupPickerList .picker-link{display:none}
      #premiumDetailModal{top:calc(64px + 32vh)!important;right:0!important;bottom:0!important;width:100%!important}
    }
    `;
    style.textContent += `
    #groupPickerList button{padding:16px 18px;border-radius:10px}
    #groupPickerList button.selected{background:#fffcf5;border-left:4px solid #b5954e;padding-left:15px}
    #groupPickerList .picker-kind{background:none;color:#64768b;padding:0;margin:0 0 4px;font-size:11px}
    #groupPickerList .picker-title{font-size:13px;font-weight:500;color:#54677c;margin-bottom:2px}
    #groupPickerList .picker-price{font-size:19px;letter-spacing:-.5px;line-height:1.5;margin-bottom:5px}
    #groupPickerList .picker-meta{font-size:12px;color:#687b90}
    #groupPickerList .picker-address{font-size:11px;margin-top:4px}
    #groupPickerList .picker-link{padding-top:9px;margin-top:9px;font-size:11px}
    `;
    style.textContent += `
    #groupPicker{width:min(330px,32vw)}
    #premiumDetailModal{right:min(330px,32vw)!important;width:min(650px,68vw)!important}
    #premiumDetailModal>div{border-radius:12px 0 0 0!important}
    @media(max-width:700px){#groupPicker{width:100%}#premiumDetailModal{right:0!important;width:100%!important}}
    `;
    document.head.append(style);
    const panel = document.createElement('aside');panel.id='groupPicker';panel.setAttribute('aria-label','선택 위치 매물 목록');panel.setAttribute('aria-hidden','true');panel.inert=true;
    const header=document.createElement('header'), heading=document.createElement('strong'), close=document.createElement('button'), list=document.createElement('div');list.id='groupPickerList';close.textContent='닫기 ×';header.append(heading,close);panel.append(header,list);document.body.append(panel);
    close.onclick=()=>{window.closePremiumDetailModal?.();panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panel.inert=true};
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('premiumDetailModal')?.classList.contains('drawer-open'))close.click()});
    window.openPropertyGroup=function(items){
        // A new map selection resets the previous detail while keeping the list available.
        const detail=document.getElementById('premiumDetailModal');
        if(detail?.classList.contains('drawer-open'))window.closePremiumDetailModal?.();
        heading.textContent=`이 위치의 매물 ${items.length}개`;list.replaceChildren();
        items.forEach(p=>{const b=document.createElement('button');b.type='button';
            [['picker-kind',`${p.type||'매물'} · ${p.floor||'층수 미기재'}`],['picker-title',NestPublic.title(p)],['picker-price',p.price||'가격 문의'],['picker-meta',`임대 ${p.supplyArea||'-'} / 전용 ${p.exclusiveArea||'-'}`],['picker-address',NestPublic.address(p.address)],['picker-link','매물 상세 보기 →']].forEach(([cls,value])=>{const span=document.createElement('span');span.className=cls;span.textContent=value;b.append(span)});
            b.onclick=()=>{for(const card of list.children){card.classList.remove('selected');card.setAttribute('aria-pressed','false')}b.classList.add('selected');b.setAttribute('aria-pressed','true');openPremiumDetailModal(p.id)};list.append(b)});
        panel.inert=false;panel.setAttribute('aria-hidden','false');panel.classList.add('open');close.focus();
    };
    const modal=document.getElementById('premiumDetailModal'),iframe=document.getElementById('premiumDetailIframe');
    let previousFocus,clearTimer;
    if(modal&&iframe){
        modal.querySelector('span[onclick]')?.remove();
        const button=document.createElement('button');button.type='button';button.className='drawer-close';button.textContent='×';button.setAttribute('aria-label','매물 상세 닫기');modal.firstElementChild.prepend(button);
        modal.setAttribute('role','region');modal.setAttribute('aria-label','매물 상세');modal.inert=true;
        window.openPremiumDetailModal=function(id){clearTimeout(clearTimer);previousFocus=document.activeElement;iframe.src='property-detail.html?id='+encodeURIComponent(id);modal.inert=false;modal.classList.add('drawer-open');document.body.style.overflow='hidden';button.focus()};
        window.closePremiumDetailModal=function(){modal.classList.remove('drawer-open');modal.inert=true;document.body.style.overflow='';clearTimer=setTimeout(()=>{iframe.src=''},400);previousFocus?.focus()};
        button.onclick=window.closePremiumDetailModal;
        modal.addEventListener('click',e=>{if(e.target===modal)window.closePremiumDetailModal()});
        document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('drawer-open'))window.closePremiumDetailModal()});
        iframe.addEventListener('load',()=>{try{iframe.contentDocument.addEventListener('keydown',e=>{if(e.key==='Escape')window.closePremiumDetailModal()})}catch(e){}});
    }
})();
