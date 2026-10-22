(function () {
    const style = document.createElement('style');
    style.textContent = '#groupPicker{position:fixed;right:0;top:80px;bottom:0;width:min(390px,92vw);background:white;z-index:9998;box-shadow:-8px 0 32px #162d4633;transform:translateX(110%);transition:transform .28s ease;display:flex;flex-direction:column}#groupPicker.open{transform:translateX(0)}#groupPicker header{padding:20px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center}#groupPickerList{padding:16px;overflow:auto}#groupPicker button{cursor:pointer;font:inherit}#groupPickerList button{display:block;text-align:left;width:100%;padding:18px;margin-bottom:12px;border:1px solid #dbe2ea;border-radius:10px;background:#fff;white-space:pre-line;line-height:1.7}#groupPickerList button:hover{border-color:#b5954e;background:#fffbef}';
    document.head.append(style);
    const panel = document.createElement('aside');panel.id='groupPicker';panel.setAttribute('aria-label','선택 위치 매물 목록');panel.setAttribute('aria-hidden','true');panel.inert=true;
    const header=document.createElement('header'), heading=document.createElement('strong'), close=document.createElement('button'), list=document.createElement('div');list.id='groupPickerList';close.textContent='닫기 ×';header.append(heading,close);panel.append(header,list);document.body.append(panel);
    close.onclick=()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panel.inert=true};
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close.click()});
    window.openPropertyGroup=function(items){
        if(items.length===1){openPremiumDetailModal(items[0].id);return}
        heading.textContent=`이 위치의 매물 ${items.length}개`;list.replaceChildren();
        items.forEach(p=>{const b=document.createElement('button');b.type='button';b.textContent=`${NestPublic.title(p)}\n${p.type || ''} · ${p.floor || '층수 미기재'}\n${p.price || ''}\n임대 ${p.supplyArea || '-'} / 전용 ${p.exclusiveArea || '-'}\n${NestPublic.address(p.address)}`;b.onclick=()=>openPremiumDetailModal(p.id);list.append(b)});
        panel.inert=false;panel.setAttribute('aria-hidden','false');panel.classList.add('open');close.focus();
    };
})();
