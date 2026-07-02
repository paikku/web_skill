"use client";

import { useEffect, useState } from "react";

type Expense = { id: number; date: string; item: string; amount: number };

// 이 앱의 "자기 API"(/api/expenses)에서 데이터를 가져와 그린다.
// SSO는 identity만 줬고, 업무 데이터(경비)는 이 앱이 소유·제공한다.
export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => (r.ok ? r.json() : []))
      .then(setExpenses)
      .catch(() => setExpenses([]));
  }, []);

  if (expenses === null) return <p>경비 내역 불러오는 중...</p>;

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <table>
      <thead>
        <tr>
          <th>일자</th>
          <th>항목</th>
          <th style={{ textAlign: "right" }}>금액</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{e.date}</td>
            <td>{e.item}</td>
            <td style={{ textAlign: "right" }}>{e.amount.toLocaleString()}원</td>
          </tr>
        ))}
        <tr>
          <td colSpan={2}>
            <b>합계</b>
          </td>
          <td style={{ textAlign: "right" }}>
            <b>{total.toLocaleString()}원</b>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
