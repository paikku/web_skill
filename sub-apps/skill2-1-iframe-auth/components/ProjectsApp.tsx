"use client";

import { useState } from "react";
import type { SubAppUser } from "@/lib/auth";

type Project = { id: number; title: string; saving: number; owner: string };

// 기능별 권한은 Sub App이 관리한다:
// COST_SAVING_VIEW → 목록 조회 / COST_SAVING_EDIT → 과제 등록.
// 프론트에서 버튼을 숨기더라도 최종 검증은 backend(FastAPI)가 한다.
export function ProjectsApp({
  user,
  projects: initial,
  permissions,
}: {
  user: SubAppUser;
  projects: Project[];
  permissions: string[];
}) {
  const [projects, setProjects] = useState(initial);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const canEdit = permissions.includes("COST_SAVING_EDIT");

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, saving: Number(saving) || 0 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(`❌ ${res.status}: ${data.message ?? "실패"}`);
      return;
    }
    setProjects((prev) => [...prev, data]);
    setTitle("");
    setSaving("");
    setMessage("✅ 등록되었습니다.");
  }

  return (
    <div>
      <div className="app-header">
        <h1>
          💰 원가절감 과제
          <span className="badge">{user.name}</span>
          <span className="badge">{permissions.join(", ") || "권한 없음"}</span>
        </h1>
        <a className="btn ghost" href="/auth/logout">
          로그아웃
        </a>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>과제명</th>
              <th>절감액</th>
              <th>담당</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.saving.toLocaleString()}원</td>
                <td>{p.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <b>과제 등록 (COST_SAVING_EDIT 필요)</b>
        {!canEdit && (
          <div className="info-msg">
            ⚠️ 현재 사용자는 EDIT 권한이 없습니다. 등록을 시도하면 backend가
            403을 반환하는 것을 확인해보세요.
          </div>
        )}
        <form className="create-form" onSubmit={createProject}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="과제명"
            required
          />
          <input
            value={saving}
            onChange={(e) => setSaving(e.target.value)}
            placeholder="절감액(원)"
          />
          <button className="btn" type="submit">
            등록
          </button>
        </form>
        {message && <div className="error-msg">{message}</div>}
      </div>
    </div>
  );
}
