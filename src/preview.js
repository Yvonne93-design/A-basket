const stage=document.querySelector('.preview-stage');
const space=document.querySelector('.device-space');
const frame=document.querySelector('iframe');
const fullScreen=document.querySelector('#open-app');
function fit(){const scale=Math.min(1,(stage.clientWidth-28)/422,(stage.clientHeight-18)/894);space.style.width=422*scale+'px';space.style.height=894*scale+'px';space.style.setProperty('--device-scale',scale);}
new ResizeObserver(fit).observe(stage);fit();
frame.src='/?device=iphone17'+(location.hash||'#/basket');
frame.addEventListener('load',()=>{const sync=()=>{const hash=frame.contentWindow.location.hash;history.replaceState(null,'','/preview.html'+hash);fullScreen.href='/'+hash;};sync();frame.contentWindow.addEventListener('hashchange',sync);});
window.addEventListener('hashchange',()=>{if(frame.contentWindow.location.hash!==location.hash)frame.contentWindow.location.hash=location.hash;});
