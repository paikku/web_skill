// 출장경비 앱의 "자기 데이터". SSO 서버가 아니라 이 앱이 소유한다.
// (데모라 in-memory. 실제로는 이 앱 전용 DB.)
export type Expense = {
  id: number;
  date: string;
  item: string;
  amount: number;
  userId: string;
};

const EXPENSES: Expense[] = [
  { id: 1, date: "2026-06-03", item: "KTX 왕복 (부산 공장)", amount: 118000, userId: "user-kim" },
  { id: 2, date: "2026-06-11", item: "숙박 1박", amount: 95000, userId: "user-kim" },
  { id: 3, date: "2026-06-20", item: "거래처 회의 식대", amount: 46000, userId: "user-lee" },
];

// 로그인 사용자 본인의 경비만 돌려준다 (identity 기준 필터링).
export function getExpenses(userId: string): Expense[] {
  return EXPENSES.filter((e) => e.userId === userId);
}
