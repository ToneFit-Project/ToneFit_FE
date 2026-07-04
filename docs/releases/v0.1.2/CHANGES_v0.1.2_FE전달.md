# v0.1.0 → v0.1.2 변경 명세 (FE 전달용 · 스토어 제출 기준)

> **받는 분**: FE 오경민님
> **작성**: PM 김성식 / Claude QA · 2026-07-05
> **한 줄 요약**: 회신 버튼이 무조건 "대화가 길어 정리하기 어려워요"로 죽던 버그의 근본 수정. **바뀐 곳은 딱 두 파일, 실질 로직은 content.ts 회신 분기 한 구간**입니다.
>
> ⚠️ **중요 — 이 버전의 정체**: 스토어에 올라가는 v0.1.2는 v0.1.0 배포 번들(`content.ts-DtcBb9kq.js`)을 **직접 패치한 빌드**입니다 (소스 빌드 아님). 따라서 **소스(content.ts)에 이 문서대로 포팅한 뒤 그 소스로 v0.1.3을 빌드해야 소스↔배포가 다시 일치**합니다. 포팅 전까지 소스 레포에는 v0.1.2에 해당하는 코드가 존재하지 않습니다.

---

## 0. 바뀐 파일 전체 목록 (이게 전부입니다)

| # | 파일 | 바뀐 것 | 안 바뀐 것 |
|---|---|---|---|
| 1 | `manifest.json` | `version`: `0.1.0` → `0.1.2` | 나머지 전부 (name·description·권한·리소스 동일) |
| 2 | `assets/content.ts-DtcBb9kq.js` (소스: `extension/src/content/content.ts`) | **회신 분기 한 구간** (아래 ①~⑥) | 비회신 경로 전부 — 생성/교정 버튼, 40자 스냅샷, 본문 주입, INSERT_EMAIL. **바이트 diff로 단일 구간 변경 확인됨** |

디버그 플래그(`var e=!1`)는 v0.1.0 그대로 꺼져 있습니다 (중간 내부 빌드에서 켰다가 릴리즈에서 원복 — 발신자 정보 콘솔 노출 방지, FUNC-Rep-13 취지).

---

## 1. 무엇이 문제였나 (v0.1.0, 30초 요약)

회신 버튼 클릭 시 content.ts가:

- `.gmail_quote` **통짜 텍스트**를 body 1건으로 추출 — 중첩 인용(스레드 전체 역사) + attribution + 서명 전부 포함
- detached `cloneNode`에 `innerText`를 사용 → 스펙상 textContent로 동작 → **Gmail이 `⋯`로 접어둔 숨김 인용까지 글자 수에 포함**
- 그 합산에 **1,000자 게이트** → 사실상 모든 실제 스레드에서 API 호출 전 차단 (Network 요청 0건)
- `mails[]`는 배열인데 항상 1건 → BE 메일별 파이프라인(FUNC-Rep-02/03/04) 무의미

## 2. 어떻게 고쳤나 — 위치별 변경 ①~⑥

전부 **회신 게이트 블록 안** (`if (quoteEl || trimmedToggle || /^(Re:|RE:|답장:)/.test(subject))` — 이 게이트 조건 자체는 무변경).

### ① [신설] 헬퍼 2개 — tfText / tfSplit

`innerText` 대신 쓰는 블록 인지 텍스트 추출기 + 중첩 인용을 메일 단위로 분리하는 스플리터. **아래 코드를 그대로 이식하면 됩니다.**

```js
/** 블록 인지 텍스트 추출 — detached 노드용 innerText 대체.
 *  STYLE/SCRIPT/TITLE/NOSCRIPT 스킵, BR·블록태그 경계→\n, nbsp→공백, \n 3연속→2개 */
const tfText = (root) => {
  let out = '';
  const BLOCK = /^(DIV|P|LI|TR|TD|BLOCKQUOTE|H[1-6]|PRE|TABLE|UL|OL|SECTION|ARTICLE|HEADER|FOOTER)$/;
  const walk = (nd) => {
    if (nd.nodeType === 3) { out += nd.textContent; return; }
    if (nd.nodeType !== 1) return;
    const tg = nd.tagName;
    if (tg === 'STYLE' || tg === 'SCRIPT' || tg === 'TITLE' || tg === 'NOSCRIPT') return;
    if (tg === 'BR') { out += '\n'; return; }
    const bl = BLOCK.test(tg);
    if (bl && out && !out.endsWith('\n')) out += '\n';
    for (const c of nd.childNodes) walk(c);
    if (bl && out && !out.endsWith('\n')) out += '\n';
  };
  walk(root);
  return out.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
};

/** 중첩 gmail_quote를 레벨별 하강하며 최근 maxMails건 분리. 반환: 최신 우선 [{sender, body}] */
const tfSplit = (rootQuote, maxMails) => {
  const SIG = '.gmail_signature,[data-smartmail="gmail_signature"]';
  const acc = [];
  let cur = rootQuote;
  while (cur && acc.length < maxMails) {
    // 발신자: attr이 "이 레벨 소속"인지 closest로 검증 (깊은 레벨 attr 훔쳐오기 방지)
    const attrEl = cur.querySelector('.gmail_attr');
    const ownAttr = attrEl && attrEl.closest('.gmail_quote') === cur ? attrEl : null;
    const sender = ownAttr ? (ownAttr.textContent || '').trim().replace(/\s+/g, ' ') : '발신자 미상';
    // 본문 컨테이너: ★반드시 직계(:scope >)★ — 자손 검색이면 Fwd/모바일 인용에서 오결합
    const bq = cur.matches && cur.matches('blockquote')
      ? cur
      : cur.querySelector(':scope > blockquote.gmail_quote');
    if (bq) {
      // 표준 레벨: 하위 인용/attr/서명 제거 → 이 메일 본문만
      const clone = bq.cloneNode(true);
      clone.querySelectorAll('.gmail_quote,.gmail_attr,' + SIG).forEach(x => x.remove());
      const body = tfText(clone);
      if (body) acc.push({ sender, body });
      cur = bq.querySelector('.gmail_quote');            // 더 오래된 레벨로 하강
    } else {
      // 비표준 레벨(전달 Fwd/모바일/타 클라이언트): 남은 전체를 병합 1건으로 보존 후 종료.
      // ★하위 .gmail_quote 제거 금지★ — 제거+중단 조합이면 메일이 조용히 소실됨
      const clone = cur.cloneNode(true);
      const a2 = clone.querySelector('.gmail_attr');
      if (a2 && a2.closest('.gmail_quote') === clone) a2.remove();
      clone.querySelectorAll(SIG).forEach(x => x.remove());
      const body = tfText(clone);
      if (body) acc.push({ sender, body });
      cur = null;
    }
  }
  return acc;
};
```

### ② [교체] 추출 — 통짜 1건 → 최근 3건 분리 (+ ⑤ uet 폴백 동일 적용, ⑥ try/catch)

**BEFORE (v0.1.0)**:

```js
let sender = '발신자 미상', body = '';
if (quoteEl) {
  sender = quoteEl.querySelector('.gmail_attr')?.innerText?.trim() ?? '발신자 미상';
  const clone = quoteEl.cloneNode(true);
  clone.querySelector('.gmail_attr')?.remove();              // ⚠️ 첫 attr 하나만 제거
  body = clone.innerText.trim() || quoteEl.innerText.trim(); // ⚠️ 통짜 + detached innerText
} else { /* uet 폴백도 동일하게 통짜 innerText */ }
```

**AFTER (v0.1.2)**:

```js
let mails = [];
try {                                                        // ⑥ 신설: 조용한 실패 방지
  if (quoteEl) mails = tfSplit(quoteEl, 3);                  // ② 본선
  else {
    const uet = container.querySelector('input[name="uet"]');
    if (uet?.value) {
      const q = new DOMParser().parseFromString(uet.value, 'text/html').querySelector('.gmail_quote');
      if (q) mails = tfSplit(q, 3);                          // ⑤ uet 폴백도 동일 분리
    }
  }
} catch (err) {
  sendError('REPLY_EXTRACT_ERROR');                          // 미매핑 코드 → generic 에러 화면
  return;
}
if (!mails.length) { sendError(noQuote ? 'REPLY_NO_QUOTE' : 'REPLY_EMPTY'); return; } // 판별식 무변경
```

### ③ [교체] 게이트 — 합산 1,000자 → **최신 메일 단독 10,000자**

**BEFORE**: `if (body.length > 1000) → REPLY_TOO_LONG` (스레드 합산 기준)
**AFTER**:

```js
if (mails[0].body.length > 10_000) { sendError('REPLY_TOO_LONG'); return; }   // 최신 메일 "단독"
if (!/[가-힣]/.test(mails[0].body)) { sendError('REPLY_NON_KOREAN'); return; } // 한국어 판정도 최신 메일 기준
```

근거: API 명세서 v0.57 — 요청 필드 `body` 최대 **10,000자/건**, 서버 정본 게이트는 정리 후 합산 20,000자(`CONTENT_TOO_LONG`). **v0.1.0의 1,000자는 스펙에 없는 자체 발명**이었고 이번 버그의 증폭기였습니다. (실사례: 리멤버 견적 메일 단건 1,335자 — 1,000자 게이트에서 오차단, 10,000자에서 정상 통과)

### ④ [교체] 전송 — 1건 → 최근 3건 **시간순**

**BEFORE**: `mails: [{sender, body}]` (통짜 1건)
**AFTER**:

```js
sendMessage({ type: 'OPEN_SIDE_PANEL_REPLY',
  mails: mails.slice().reverse(),    // tfSplit은 최신 우선 → [과거→최신]으로 뒤집어 전송
  subject });                        // subject 로직 무변경
```

순서 계약 (3중 확정): 명세 v0.57 p.17 "시간순(오래된→최신), **마지막 요소 = 답장 누른 메일**" + BE 코드 `senders.get(senders.size()-1)` + 실 Gemini E2E에서 초안이 마지막 원소 발신자 앞으로 작성됨.

---

## 3. 포팅 시 반드시 지킬 것 (하나라도 빠지면 버그 재현)

1. **게이트는 `10_000` (10,000자/건)** — 1,000으로 옮기면 리멤버 케이스(1,335자) 오차단이 정식 배포에서 재현됩니다. PR 체크리스트에 `grep 10_000` 넣기.
2. **`:scope > blockquote.gmail_quote` 직계 한정** — 자손 검색(`querySelector('blockquote.gmail_quote')`)이면 Fwd/모바일 인용에서 sender-body 미스매치 + 본문 소실. *적대 검증에서 실제로 잡혔던 결함.*
3. **비표준 레벨 폴백에서 하위 `.gmail_quote` 제거 금지** — 병합 보존이 v0.1.0 대비 무손실 보장. *역시 실제로 잡혔던 결함.*
4. **detached clone에 `innerText` 금지** — tfText 사용 (숨김 텍스트 포함 + 줄바꿈 소실 방지, jsdom 테스트도 이래야 가능).
5. **게이트·한국어 판정은 `mails[0]`(최신)에만** — 합산에 걸면 3건 분리가 무의미.
6. **전송은 시간순(최신이 배열 마지막)** — 뒤집으면 BE가 가장 오래된 메일에 답장을 씁니다.
7. attr 소속 검증(`closest('.gmail_quote') === cur`) 생략 금지 — 깊은 레벨 attr 오귀속 방지.

## 4. 검증 근거 (전부 실측)

- **오프라인**: jsdom 픽스처 23/23 (3/5중첩·단일·style태그 2,400자 제외·서명·빈인용·attr누락·blockquote엣지·게이트 시뮬) + 적대 픽스처(Fwd/모바일/구형/Outlook, 본문 소실 0·오귀속 0)
- **적대 검증**: 3에이전트 — 스코프 충돌 0(vm 하니스), **비회신 경로 바이트 무변경**(diff 단일 구간), Gmail 변형 결함 2건 발견→수정→재검증
- **BE 계약**: 로컬 구동(ToneFit_BE) 계약 테스트 **27/27 PASS** — 순서·10,000/20,000자 게이트·MailCleaner 호환(클린 분리·병합 tail 모두 정상 처리)·MAIL_READ·작성 호출
- **실 Gemini E2E**: 요약 5.6s / 파악 5.2s(recipient CLIENT·high, 질문 전부 최신 메일에서 추출) / 작성 13.1s(마지막 원소 발신자 수신 초안) / NOT_KOREAN 판정 ✓
- **크롬 실기동**: 픽플리 스레드 2건 분리(436·468자) 정상, 리멤버 단건 1,335자 분리 정상

## 5. 스토어 등록 체크 (이번 제출)

- [x] 제출 아티팩트: `dist_v0.1.2_internal.zip` (manifest 0.1.2, key 필드 없음, description 원문)
- [x] 디버그 로그 OFF (`var e=!1` — v0.1.0 동일)
- [ ] **제출한 zip을 그대로 팀 드라이브/릴리즈에 보관** (스토어 배포본=검증본 증빙)
- [ ] **소스 따라잡기(오경민님)**: 이 문서대로 content.ts 포팅 → v0.1.3 소스 빌드 → 소스↔배포 재일치. 그때까지 v0.1.2 소스는 레포에 없음 — org 레포에 릴리즈 태그/노트로 이 문서 링크 남기기
- [ ] (권고) mails 순서·10,000자 게이트를 성민우님과 API 명세에 명문화 완료 확인
