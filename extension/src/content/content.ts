/**
 * ToneFit Extension — Gmail Content Script
 *
 * 역할:
 * - GENERATION_START: 작성창 오버레이 표시 (직접 입력 차단)
 * - GENERATION_ERROR: 오버레이 제거
 * - INSERT_EMAIL: 오버레이 제거 + 제목/본문 주입
 * - 작성창이 없으면 편지쓰기 버튼 클릭 후 열리면 주입
 * - Gmail 작성창 툴바에 ToneFit 아이콘 버튼 삽입
 */

const DEBUG = false; // 디버그 로그 확인 시 true로 변경

// Gmail SPA 내비게이션으로 스크립트가 중복 주입되는 것을 방지
if ((window as Window & { __tonefit_injected?: boolean }).__tonefit_injected) {
  throw new Error('[ToneFit] content script already injected — skipping');
}
(window as Window & { __tonefit_injected?: boolean }).__tonefit_injected = true;

// ── Gmail DOM 셀렉터 ──────────────────────────────────────────────

const COMPOSE_BTN_SELECTOR = 'div[gh="cm"]';
const SUBJECT_SELECTOR = 'input[name="subjectbox"]';

/** 본문 영역: 여러 Gmail 버전 대응, 작성창 내 첫 번째 매칭 우선 */
const BODY_SELECTORS = [
  'div[aria-label="메일 본문"]',
  'div[aria-label="Message Body"]',
  'div[aria-label="본문"]',
  'div[g_editable="true"]',
  'div[contenteditable="true"].Am',
  'div[contenteditable="true"].editable',
  'div.Am.Al.editable',
];

/**
 * 보내기 드롭다운(▼) 버튼: 이 버튼 우측에 ToneFit 아이콘 삽입
 * 한국어·영어·data-tooltip·Gmail 내부 클래스 모두 대응
 */
const SEND_DROPDOWN_SELECTORS = [
  '[data-tooltip*="더 많은 보내기"]',
  '[data-tooltip*="보내기 옵션 더보기"]',
  '[data-tooltip*="More send options"]',
  '[data-tooltip*="Schedule send"]',
  '[aria-label*="더 많은 보내기"]',
  '[aria-label*="More send options"]',
  '.gU.T-I', // Gmail internal dropdown class
].join(', ');

const OVERLAY_ID = 'tonefit-overlay';
const TOOLBAR_BTN_CLASS = 'tonefit-toolbar-btn';
const STYLES_ID = 'tonefit-styles';

// ── 유틸 ─────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isComposeOpen = (): boolean => !!document.querySelector(SUBJECT_SELECTOR);

/**
 * 작성창 컨테이너 반환 (오버레이 부모로 사용)
 * subject input에서 가장 가까운 [role="dialog"] 또는 form으로 찾음
 */
const getComposeContainer = (): HTMLElement | null => {
  const subjectEl = document.querySelector<HTMLElement>(SUBJECT_SELECTOR);
  if (!subjectEl) return null;

  return (
    subjectEl.closest<HTMLElement>('[role="dialog"]') ??
    subjectEl.closest<HTMLElement>('form') ??
    subjectEl.closest<HTMLElement>('.nH') ??
    null
  );
};

/** 작성창 내에서 본문 영역 탐색 */
const getBodyElement = (): HTMLElement | null => {
  const container = getComposeContainer();

  for (const selector of BODY_SELECTORS) {
    const el = container
      ? container.querySelector<HTMLElement>(selector)
      : document.querySelector<HTMLElement>(selector);
    if (el) return el;
  }
  return null;
};

// ── 스타일 주입 ───────────────────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById(STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = `
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
    .tonefit-toolbar-btn.tonefit-panel-open .tonefit-btn-bg {
      opacity: 1 !important;
      animation: none !important;
    }
    .tonefit-btn-icon {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  document.head.appendChild(style);
};

// ── 툴바 버튼 주입 ────────────────────────────────────────────────

const TONEFIT_SVG = `<svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1907 5.24809C9.84532 5.26572 9.69515 5.31979 9.53807 5.48313C9.48183 5.54162 9.05452 6.03457 8.58847 6.5786C6.87817 8.57506 5.10818 10.6382 5.05635 10.6958C4.97832 10.7823 4.98213 10.9666 5.06333 11.0323C5.12216 11.0799 5.19963 11.0809 8.37378 11.0744L11.624 11.0678L12.1948 10.7834C13.6018 10.0824 14.7924 9.69759 16.4184 9.41807C16.7608 9.35922 16.9464 9.3157 16.9892 9.2843C17.0241 9.25869 17.2736 8.99324 17.5436 8.69441C17.8137 8.39559 18.5614 7.5712 19.2052 6.86246C19.849 6.1537 20.3855 5.54537 20.3973 5.5106C20.4235 5.43383 20.3768 5.30691 20.3089 5.27059C20.2574 5.24302 10.7064 5.22177 10.1907 5.24809Z" fill="#7C4DFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.1448 10.5671C13.4908 11.0854 12.1646 11.7866 10.9927 12.7622C9.26293 14.2024 8.0407 16.1709 7.50869 18.3735C7.27539 19.3395 7.18335 20.1359 7.17336 21.2759L7.16747 21.9442L7.22698 21.9924C7.34309 22.0864 7.31965 22.1012 7.99417 21.506C9.17952 20.4601 10.7387 19.2582 11.8905 18.5024C12.1837 18.31 12.2111 18.2628 12.2507 17.8811C12.4212 16.2377 13.0228 14.4167 13.9015 12.8842C14.3708 12.0657 14.9935 11.1999 15.4831 10.6853C15.6323 10.5285 15.6578 10.4485 15.5578 10.4508C15.533 10.4514 15.3471 10.5037 15.1448 10.5671Z" fill="#7C4DFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3661 10.9808C16.3219 11.0001 16.2113 11.1116 16.1093 11.2398C14.9372 12.7125 14.099 14.3895 13.6806 16.0989C13.4359 17.0987 13.3417 17.7969 13.3119 18.8329C13.29 19.5901 13.2995 22.5869 13.3239 22.6639C13.354 22.7589 13.4293 22.7641 14.7672 22.7641C16.0458 22.7641 16.0702 22.7632 16.1359 22.7116L16.2027 22.659V18.949C16.2027 16.2991 16.2107 15.2159 16.2308 15.1583C16.2864 14.999 16.2383 15.0031 18.0292 15.0031C19.3791 15.0031 19.6668 14.9971 19.7237 14.9674C19.7614 14.9477 19.8834 14.825 19.995 14.6947C20.3108 14.3258 21.129 13.385 22.0774 12.3003C22.5539 11.7553 22.9566 11.2853 22.9724 11.2558C23.0187 11.1694 23.0059 11.0742 22.9389 11.0073L22.8767 10.9451L19.6602 10.9461C17.0386 10.9469 16.4293 10.9533 16.3661 10.9808Z" fill="#7C4DFF"/>
</svg>`;

/**
 * Gmail 작성창 툴바에 ToneFit 버튼 삽입
 * 보내기 버튼 바로 우측에 위치
 */
const injectToolbarButton = (composeEl: HTMLElement) => {
  // 이미 삽입된 경우 스킵
  if (composeEl.querySelector(`.${TOOLBAR_BTN_CLASS}`)) return;

  // ▼ 드롭다운 버튼 탐색
  const dropdownBtn = composeEl.querySelector<HTMLElement>(
    SEND_DROPDOWN_SELECTORS
  );
  if (!dropdownBtn) {
    console.error(
      '[ToneFit] 드롭다운 버튼을 찾지 못했습니다. 셀렉터:',
      SEND_DROPDOWN_SELECTORS
    );
    return;
  }

  injectStyles();

  const btn = document.createElement('div');
  btn.className = TOOLBAR_BTN_CLASS;
  btn.title = 'ToneFit으로 초안 생성';
  btn.innerHTML = `
    <span class="tonefit-btn-bg"></span>
    <span class="tonefit-btn-icon">${TONEFIT_SVG}</span>
  `;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
  });

  // Gmail 툴바는 table 기반 — 부모 <td> 뒤에 새 <td>로 삽입
  const parentCell = dropdownBtn.closest('td');
  if (parentCell) {
    const td = document.createElement('td');
    td.style.cssText = 'vertical-align: middle; padding: 0;';
    td.appendChild(btn);
    parentCell.insertAdjacentElement('afterend', td);
  } else {
    // table 구조가 아닌 경우 fallback
    dropdownBtn.insertAdjacentElement('afterend', btn);
  }
  if (DEBUG) console.error('[ToneFit] 툴바 버튼 삽입 완료 (드롭다운 우측)');
};

/**
 * subject input을 기준으로 작성창 루트 반환
 */
const getComposeRootFromSubject = (subjectEl: HTMLElement): HTMLElement =>
  subjectEl.closest<HTMLElement>('[role="dialog"]') ??
  subjectEl.closest<HTMLElement>('form') ??
  subjectEl.closest<HTMLElement>('.nH') ??
  subjectEl;

/**
 * MutationObserver로 Gmail 작성창 열림 감지 → 버튼 자동 삽입
 * subject input이 DOM에 추가되는 시점 기준 (role="dialog"보다 신뢰도 높음)
 */
const observeComposeWindows = () => {
  const injectedRoots = new WeakSet<HTMLElement>();

  const tryInjectFromSubject = (subjectEl: HTMLElement) => {
    const root = getComposeRootFromSubject(subjectEl);
    if (injectedRoots.has(root)) return;
    injectedRoots.add(root);
    setTimeout(() => injectToolbarButton(root), 400);
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches(SUBJECT_SELECTOR)) {
          tryInjectFromSubject(node);
        }
        node
          .querySelectorAll<HTMLElement>(SUBJECT_SELECTOR)
          .forEach(tryInjectFromSubject);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

// 이미 열려있는 작성창에도 삽입
const injectIntoExistingComposes = () => {
  document.querySelectorAll<HTMLElement>(SUBJECT_SELECTOR).forEach((el) => {
    const root = getComposeRootFromSubject(el);
    injectToolbarButton(root);
  });
};

// 초기화
injectIntoExistingComposes();
observeComposeWindows();

// ── 오버레이 ─────────────────────────────────────────────────────

const showOverlay = () => {
  if (!isComposeOpen()) {
    console.error(
      '[ToneFit] 작성창을 찾을 수 없어 오버레이를 표시하지 않습니다'
    );
    return;
  }
  if (document.getElementById(OVERLAY_ID)) return;

  const container = getComposeContainer();
  if (!container) {
    console.error('[ToneFit] 작성창 컨테이너를 찾을 수 없습니다');
    return;
  }

  const prevPosition = container.style.position;
  const computedPosition = getComputedStyle(container).position;
  if (computedPosition === 'static') {
    container.style.position = 'relative';
  }

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('data-prev-position', prevPosition);
  overlay.style.cssText = `
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
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 28px;
    height: 28px;
    border: 3px solid rgba(99, 102, 241, 0.2);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: tonefit-spin 0.8s linear infinite;
  `;

  injectStyles();
  overlay.appendChild(spinner);
  container.appendChild(overlay);
  if (DEBUG)
    console.error(
      '[ToneFit] 오버레이 표시 완료',
      container.tagName,
      container.className
    );
};

const removeOverlay = () => {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return;

  const container = overlay.parentElement;
  if (container) {
    const prevPosition = overlay.getAttribute('data-prev-position') ?? '';
    container.style.position = prevPosition;
  }

  overlay.remove();
};

// ── 이메일 주입 ───────────────────────────────────────────────────

const injectSubject = (subject: string) => {
  const subjectEl = document.querySelector<HTMLInputElement>(SUBJECT_SELECTOR);
  if (!subjectEl) {
    console.error('[ToneFit] 제목 입력창을 찾을 수 없습니다');
    return;
  }
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(subjectEl, subject);
  } else {
    subjectEl.value = subject;
  }
  subjectEl.dispatchEvent(new Event('input', { bubbles: true }));
  subjectEl.dispatchEvent(new Event('change', { bubbles: true }));
};

/** 서명 요소를 재귀적으로 제거한 본문 텍스트 반환 */
const getBodyTextWithoutSignature = (bodyEl: HTMLElement): string => {
  const clone = bodyEl.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      '.gmail_signature, .gmail_signature_prefix, [data-smartmail="gmail_signature"]'
    )
    .forEach((el) => el.remove());
  return Array.from(clone.children)
    .map((child) => (child as HTMLElement).innerText.replace(/\n+$/, ''))
    .join('\n');
};

const injectBody = (content: string) => {
  const bodyEl = getBodyElement();
  if (!bodyEl) {
    console.error(
      '[ToneFit] 본문 영역을 찾을 수 없습니다. 시도한 셀렉터:',
      BODY_SELECTORS
    );
    return;
  }

  bodyEl.focus();

  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(bodyEl);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // innerHTML로 한 번에 주입 — textContent + appendChild 루프는
  // Gmail mutation observer가 각 div를 재처리해 \n이 누적됨
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  bodyEl.innerHTML = content
    .split('\n')
    .map((line) =>
      line === '' ? '<div><br></div>' : `<div>${escapeHtml(line)}</div>`
    )
    .join('');
  bodyEl.dispatchEvent(new Event('input', { bubbles: true }));
  if (DEBUG) console.error('[ToneFit] 본문 주입 완료');
};

const injectEmail = (subject: string, content: string) => {
  injectSubject(subject);
  setTimeout(() => injectBody(content), 50);
};

const openComposeAndInject = async (subject: string, content: string) => {
  const composeBtn = document.querySelector<HTMLElement>(COMPOSE_BTN_SELECTOR);
  if (!composeBtn) {
    console.error('[ToneFit] 편지쓰기 버튼을 찾을 수 없습니다');
    return;
  }

  composeBtn.click();

  const MAX_WAIT = 3000;
  const INTERVAL = 100;
  let elapsed = 0;

  while (elapsed < MAX_WAIT) {
    await wait(INTERVAL);
    elapsed += INTERVAL;
    if (isComposeOpen()) {
      await wait(300);
      injectEmail(subject, content);
      return;
    }
  }

  console.error('[ToneFit] 작성창이 열리지 않았습니다 (3초 초과)');
};

// ── 메시지 수신 ───────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GENERATION_START') {
    showOverlay();
    return;
  }

  if (message.type === 'GENERATION_ERROR') {
    removeOverlay();
    return;
  }

  if (message.type === 'INSERT_EMAIL') {
    removeOverlay();
    const { subject, content } = message as {
      type: string;
      subject: string;
      content: string;
    };

    if (isComposeOpen()) {
      injectEmail(subject, content);
    } else {
      openComposeAndInject(subject, content);
    }
    return;
  }

  if (message.type === 'PANEL_OPENED') {
    document
      .querySelectorAll<HTMLElement>(`.${TOOLBAR_BTN_CLASS}`)
      .forEach((btn) => btn.classList.add('tonefit-panel-open'));
    return;
  }

  if (message.type === 'PANEL_CLOSED') {
    document
      .querySelectorAll<HTMLElement>(`.${TOOLBAR_BTN_CLASS}`)
      .forEach((btn) => btn.classList.remove('tonefit-panel-open'));
    return;
  }

  if (message.type === 'GET_EMAIL_CONTENT') {
    const bodyEl = getBodyElement();
    const subjectEl = document.querySelector<HTMLInputElement>(
      'input[name="subjectbox"]'
    );
    sendResponse({
      content: bodyEl ? getBodyTextWithoutSignature(bodyEl) : '',
      subject: subjectEl?.value ?? '',
    });
    return true;
  }
});
