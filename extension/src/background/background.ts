/**
 * ToneFit Extension — Background Service Worker
 */

// ── 탭 이동 시 Side Panel 활성화 여부 제어 ───────────────────────────
// 아이콘 클릭은 manifest의 default_popup으로 처리 (action.onClicked 미사용)
// Gmail 탭에서만 아이콘 활성화 (badge 표시 등 UX 개선 용도)
// 실제 열기는 action.onClicked에서 처리하므로 enabled 제한 제거
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    const isGmail = tab.url?.startsWith('https://mail.google.com') ?? false;
    // 아이콘 활성/비활성
    if (isGmail) {
      chrome.action.enable(tabId).catch(() => {});
    } else {
      chrome.action.disable(tabId).catch(() => {});
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  const isGmail = tab.url?.startsWith('https://mail.google.com') ?? false;
  if (isGmail) {
    chrome.action.enable(tabId).catch(() => {});
  } else {
    chrome.action.disable(tabId).catch(() => {});
  }
});

// ── 패널 → Gmail 탭으로 메시지 중계 ─────────────────────────────────
//
// ⚠️ active + currentWindow 방식은 사이드 패널에 포커스가 있을 때
//    currentWindow가 Gmail 탭 창을 못 찾는 경우가 있음.
//    → Gmail URL로 직접 탭을 찾는 방식으로 변경.

const sendToGmailTab = (message: unknown) => {
  chrome.tabs.query({ url: 'https://mail.google.com/*' }, (tabs) => {
    if (tabs.length === 0) {
      console.error('[ToneFit BG] Gmail 탭을 찾을 수 없습니다');
      return;
    }
    // Gmail 탭이 여러 개면 전부 전송 (멀티탭 대응)
    for (const tab of tabs) {
      if (tab.id === null || tab.id === undefined) continue;
      chrome.tabs.sendMessage(tab.id, message).catch((err) => {
        console.error(
          '[ToneFit BG] content script 전달 실패 (tabId:',
          tab.id,
          ')',
          err.message
        );
      });
    }
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG' });
    return true;
  }

  // content script → 사이드 패널 열기
  if (message.type === 'OPEN_SIDE_PANEL') {
    const tabId = sender.tab?.id;
    if (tabId !== null && tabId !== undefined) {
      chrome.sidePanel.open({ tabId }).catch(console.error);
    }
    return true;
  }

  if (
    message.type === 'INSERT_EMAIL' ||
    message.type === 'GENERATION_START' ||
    message.type === 'GENERATION_ERROR'
  ) {
    sendToGmailTab(message);
    return true;
  }

  return true;
});
