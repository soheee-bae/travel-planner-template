# Figma Make — V1 제주 커플 여행 플래너

아래 프롬프트를 Figma Make에 그대로 붙여 넣으면 된다.
앱에 이미 있는 기능(홈/플래너/리스트/비용/준비/메모 + CRUD)을 3스크린 초안에 합친 버전이다.

로그인·공유·여행 카드 목록은 **V2**이므로 화면에 넣지 않는다.

---

```
Create a cute mobile-first web app design for a couple's Jeju travel planner (one trip only — boyfriend's birthday trip). The overall style should feature minimal flat illustrations with bold, dark rounded outlines and a friendly cartoon vibe. Use a soft pastel color palette including a cream background (#FFF8EE), pastel tangerine (#FF9F43), baby blue (#A8D8EA), and soft pink (#FFB4C8). All UI elements, such as buttons, cards, and input fields, must have large rounded corners (24–32px) with no sharp edges. Use a bold, rounded sans-serif font (Korean-friendly, similar to Jua / rounded Gothic).

This is NOT a multi-trip dashboard. There is no login, no share/invite, no trip card list. The app opens directly into this one Jeju trip.

Please design 6 screens (390×844 mobile):

1) Home (개요)
- Header: cute tangerine character illustration (mascot), trip title from the database, subtitle from companions.
- Prominent D-Day counter for the trip start / birthday trip (large number, "D-9" style).
- Small weather widget (Jeju, temperature + sunny icon) — visual only.
- Flight ticket UI with dashed perforation line (Gimpo → Jeju, date/time, airline).
- Stay card: hotel name, check-in/out nights, address.
- Bottom tab bar (6 tabs, always visible): 홈 · 플래너 · 리스트 · 비용 · 준비 · 메모. Active = 홈.

2) Planner (플래너)
- Daily itinerary with a vertical timeline connecting location cards.
- Day chips at top: Day 1 / Day 2 / Day 3.
- Each location card: number badge, name, time, tag chips (카페/식당), duration.
- Between cards: travel time chips — car 🚗 with minutes, walk 🚶 with minutes.
- Map thumbnail area (rounded) at top of the day.
- Add place (+) button at bottom of timeline.
- Long-press hint: "길게 누르면 다른 Day로 옮길 수 있어요" (selection mode visual: checkmarks on cards + Day 1/2/3 assign chips).
- Bottom tab bar, active = 플래너.

3) Places list (리스트)
- Search field + filter chips (전체 / 카페 / 식당 / 관광).
- Soft rounded place cards with emoji, name, address, tags.
- Empty-ish footer with "장소 추가" pill button.
- Bottom tab bar, active = 리스트.

4) Budget (비용)
- Donut chart (우리 / 남자친구 split).
- Summary: 총 비용, 1인당, 더치페이 정산 문장.
- Category rows (숙소 / 교통 / 식비 / 관광 / 기타) with amounts.
- Expense cards: title, payer avatar, amount, category.
- "+ 비용 추가" button.
- Bottom tab bar, active = 비용.

5) Checklist (준비)
- Packing / prep list with soft rounded checkbox cards.
- Progress bar at top (e.g. 4/12 완료) with tangerine fill.
- Category sections (항공 / 숙소 / 짐싸기 / 예약) as pill headers.
- Some items checked with strikethrough.
- "+ 항목 추가" and category add.
- Bottom tab bar, active = 준비.

6) Memo (메모)
- Soft lined note paper / sticky note cards.
- Large rounded textarea look.
- Bottom tab bar, active = 메모.

Also design these overlays (same style):
- Bottom sheet (not centered modal) for Add/Edit: Stay, Transport, Place, Expense, Checklist item. Large inputs, dashed date fields, tangerine primary button, ghost cancel.
- Edit screens reuse the same sheet with prefilled values + 삭제 (soft pink / outline) at the bottom.

Do NOT include: login, social login, share button, invite link, trip card grid, desktop sidebar, hamburger menu.
```
