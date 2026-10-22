(function(){
    const placeholder='photo-pending.svg';
    window.NestPhoto={placeholder};
    function update(image){
        if(image.id!=='mainPropertyImg')return;
        const pending=(image.getAttribute('src')||'').includes(placeholder);
        const parent=image.closest('.image-viewer-container');
        if(!parent)return;
        const watermark=parent.querySelector('.watermark-overlay');
        if(watermark)watermark.style.display=pending?'none':'';
        image.alt=pending?'사진 준비중':'매물 사진';
        image.style.objectFit=pending?'contain':'cover';
        parent.style.background=pending?'#f7f8fa':'';
    }
    document.addEventListener('error',event=>{
        const image=event.target;
        if(!(image instanceof HTMLImageElement))return;
        if(!image.matches('#mainPropertyImg,.other-img,#panelImg'))return;
        if((image.getAttribute('src')||'').includes(placeholder))return;
        image.src=placeholder;update(image);
    },true);
    document.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)update(event.target)},true);
    document.addEventListener('DOMContentLoaded',()=>{
        const style=document.createElement('style');style.textContent='.other-img[src*="photo-pending.svg"]{object-fit:contain!important;background:#f7f8fa}.card-image{background-color:#f7f8fa}.card-image.photo-pending{background-size:contain!important;background-repeat:no-repeat;background-position:center}';document.head.append(style);
        document.querySelectorAll('#mainPropertyImg,.other-img,#panelImg').forEach(image=>{if(!image.getAttribute('src')||['undefined','null'].includes(image.getAttribute('src')))image.src=placeholder;update(image)});
    });
})();
