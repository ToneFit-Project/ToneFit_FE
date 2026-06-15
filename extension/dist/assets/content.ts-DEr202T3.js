(function(){if(window.__tonefit_injected)throw Error(`[ToneFit] content script already injected — skipping`);window.__tonefit_injected=!0;var e=`div[gh="cm"]`,t=`input[name="subjectbox"]`,n=[`div[aria-label="메일 본문"]`,`div[aria-label="Message Body"]`,`div[aria-label="본문"]`,`div[g_editable="true"]`,`div[contenteditable="true"].Am`,`div[contenteditable="true"].editable`,`div.Am.Al.editable`],r=[`[data-tooltip*="더 많은 보내기"]`,`[data-tooltip*="보내기 옵션 더보기"]`,`[data-tooltip*="More send options"]`,`[data-tooltip*="Schedule send"]`,`[aria-label*="더 많은 보내기"]`,`[aria-label*="More send options"]`,`.gU.T-I`].join(`, `),i=`tonefit-overlay`,a=`tonefit-toolbar-btn`,o=`tonefit-styles`,s=e=>new Promise(t=>setTimeout(t,e)),c=()=>!!document.querySelector(t),l=()=>{let e=document.querySelector(t);return e?e.closest(`[role="dialog"]`)??e.closest(`form`)??e.closest(`.nH`)??null:null},u=()=>{let e=l();for(let t of n){let n=e?e.querySelector(t):document.querySelector(t);if(n)return n}return null},d=()=>{if(document.getElementById(o))return;let e=document.createElement(`style`);e.id=o,e.textContent=`
    @keyframes tonefit-spin { to { transform: rotate(360deg); } }
    @keyframes tonefit-pulse {
      0%, 100% { opacity: 0; }
      50%       { opacity: 1; }
    }

    .tonefit-toolbar-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      cursor: pointer;
      border-radius: 50%;
      margin: 0 2px;
      flex-shrink: 0;
      vertical-align: middle;
    }
    .tonefit-toolbar-btn:hover .tonefit-btn-bg {
      opacity: 1 !important;
      animation: none !important;
    }
    .tonefit-btn-bg {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-color: #DFD1FF;
      animation: tonefit-pulse 3.2s ease-in-out infinite;
      pointer-events: none;
    }
    .tonefit-btn-icon {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,document.head.appendChild(e)},f=`<svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1907 5.24809C9.84532 5.26572 9.69515 5.31979 9.53807 5.48313C9.48183 5.54162 9.05452 6.03457 8.58847 6.5786C6.87817 8.57506 5.10818 10.6382 5.05635 10.6958C4.97832 10.7823 4.98213 10.9666 5.06333 11.0323C5.12216 11.0799 5.19963 11.0809 8.37378 11.0744L11.624 11.0678L12.1948 10.7834C13.6018 10.0824 14.7924 9.69759 16.4184 9.41807C16.7608 9.35922 16.9464 9.3157 16.9892 9.2843C17.0241 9.25869 17.2736 8.99324 17.5436 8.69441C17.8137 8.39559 18.5614 7.5712 19.2052 6.86246C19.849 6.1537 20.3855 5.54537 20.3973 5.5106C20.4235 5.43383 20.3768 5.30691 20.3089 5.27059C20.2574 5.24302 10.7064 5.22177 10.1907 5.24809Z" fill="#7C4DFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.1448 10.5671C13.4908 11.0854 12.1646 11.7866 10.9927 12.7622C9.26293 14.2024 8.0407 16.1709 7.50869 18.3735C7.27539 19.3395 7.18335 20.1359 7.17336 21.2759L7.16747 21.9442L7.22698 21.9924C7.34309 22.0864 7.31965 22.1012 7.99417 21.506C9.17952 20.4601 10.7387 19.2582 11.8905 18.5024C12.1837 18.31 12.2111 18.2628 12.2507 17.8811C12.4212 16.2377 13.0228 14.4167 13.9015 12.8842C14.3708 12.0657 14.9935 11.1999 15.4831 10.6853C15.6323 10.5285 15.6578 10.4485 15.5578 10.4508C15.533 10.4514 15.3471 10.5037 15.1448 10.5671Z" fill="#7C4DFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3661 10.9808C16.3219 11.0001 16.2113 11.1116 16.1093 11.2398C14.9372 12.7125 14.099 14.3895 13.6806 16.0989C13.4359 17.0987 13.3417 17.7969 13.3119 18.8329C13.29 19.5901 13.2995 22.5869 13.3239 22.6639C13.354 22.7589 13.4293 22.7641 14.7672 22.7641C16.0458 22.7641 16.0702 22.7632 16.1359 22.7116L16.2027 22.659V18.949C16.2027 16.2991 16.2107 15.2159 16.2308 15.1583C16.2864 14.999 16.2383 15.0031 18.0292 15.0031C19.3791 15.0031 19.6668 14.9971 19.7237 14.9674C19.7614 14.9477 19.8834 14.825 19.995 14.6947C20.3108 14.3258 21.129 13.385 22.0774 12.3003C22.5539 11.7553 22.9566 11.2853 22.9724 11.2558C23.0187 11.1694 23.0059 11.0742 22.9389 11.0073L22.8767 10.9451L19.6602 10.9461C17.0386 10.9469 16.4293 10.9533 16.3661 10.9808Z" fill="#7C4DFF"/>
</svg>`,p=e=>{if(e.querySelector(`.${a}`))return;let t=e.querySelector(r);if(!t){console.error(`[ToneFit] 드롭다운 버튼을 찾지 못했습니다. 셀렉터:`,r);return}d();let n=document.createElement(`div`);n.className=a,n.title=`ToneFit으로 초안 생성`,n.innerHTML=`
    <span class="tonefit-btn-bg"></span>
    <span class="tonefit-btn-icon">${f}</span>
  `,n.addEventListener(`click`,e=>{e.stopPropagation(),chrome.runtime.sendMessage({type:`OPEN_SIDE_PANEL`})});let i=t.closest(`td`);if(i){let e=document.createElement(`td`);e.style.cssText=`vertical-align: middle; padding: 0;`,e.appendChild(n),i.insertAdjacentElement(`afterend`,e)}else t.insertAdjacentElement(`afterend`,n)},m=e=>e.closest(`[role="dialog"]`)??e.closest(`form`)??e.closest(`.nH`)??e;document.querySelectorAll(t).forEach(e=>{p(m(e))}),(()=>{let e=new WeakSet,n=t=>{let n=m(t);e.has(n)||(e.add(n),setTimeout(()=>p(n),400))};new MutationObserver(e=>{for(let r of e)for(let e of r.addedNodes)e instanceof HTMLElement&&(e.matches(t)&&n(e),e.querySelectorAll(t).forEach(n))}).observe(document.body,{childList:!0,subtree:!0})})();var h=()=>{if(!c()){console.error(`[ToneFit] 작성창을 찾을 수 없어 오버레이를 표시하지 않습니다`);return}if(document.getElementById(i))return;let e=l();if(!e){console.error(`[ToneFit] 작성창 컨테이너를 찾을 수 없습니다`);return}let t=e.style.position;getComputedStyle(e).position===`static`&&(e.style.position=`relative`);let n=document.createElement(`div`);n.id=i,n.setAttribute(`data-prev-position`,t),n.style.cssText=`
    position: absolute;
    inset: 0;
    z-index: 9999;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(1px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: not-allowed;
    border-radius: inherit;
  `;let r=document.createElement(`div`);r.style.cssText=`
    width: 28px;
    height: 28px;
    border: 3px solid rgba(99, 102, 241, 0.2);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: tonefit-spin 0.8s linear infinite;
  `,d(),n.appendChild(r),e.appendChild(n)},g=()=>{let e=document.getElementById(i);if(!e)return;let t=e.parentElement;if(t){let n=e.getAttribute(`data-prev-position`)??``;t.style.position=n}e.remove()},_=e=>{let n=document.querySelector(t);if(!n){console.error(`[ToneFit] 제목 입력창을 찾을 수 없습니다`);return}let r=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,`value`)?.set;r?r.call(n,e):n.value=e,n.dispatchEvent(new Event(`input`,{bubbles:!0})),n.dispatchEvent(new Event(`change`,{bubbles:!0}))},v=e=>{let t=u();if(!t){console.error(`[ToneFit] 본문 영역을 찾을 수 없습니다. 시도한 셀렉터:`,n);return}t.focus();let r=window.getSelection();if(r){let e=document.createRange();e.selectNodeContents(t),r.removeAllRanges(),r.addRange(e)}t.textContent=``;for(let n of e.split(`
`)){let e=document.createElement(`div`);n===``?e.appendChild(document.createElement(`br`)):e.appendChild(document.createTextNode(n)),t.appendChild(e)}t.dispatchEvent(new Event(`input`,{bubbles:!0}))},y=(e,t)=>{_(e),setTimeout(()=>v(t),50)},b=async(t,n)=>{let r=document.querySelector(e);if(!r){console.error(`[ToneFit] 편지쓰기 버튼을 찾을 수 없습니다`);return}r.click();let i=0;for(;i<3e3;)if(await s(100),i+=100,c()){await s(300),y(t,n);return}console.error(`[ToneFit] 작성창이 열리지 않았습니다 (3초 초과)`)};chrome.runtime.onMessage.addListener(e=>{if(e.type===`GENERATION_START`){h();return}if(e.type===`GENERATION_ERROR`){g();return}if(e.type===`INSERT_EMAIL`){g();let{subject:t,content:n}=e;c()?y(t,n):b(t,n)}});})()
