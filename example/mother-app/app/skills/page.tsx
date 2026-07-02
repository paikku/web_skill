import { getIntegrationSkills, MANIFESTS } from "@/lib/manifests";

const COLUMNS = [
  ["hasSso", "1. SSO"],
  ["hasIframeTab", "2. iframe 탭"],
  ["hasIframeAuthIntegration", "2-1. iframe 인증 통합"],
  ["hasWebComponents", "3. Web Component"],
  ["hasWebComponentAuthIntegration", "3-1. WC 인증 통합"],
] as const;

// Manifest 해석 결과: 각 Sub App이 어떤 Skill을 선언했는지 한눈에 본다.
export default function SkillsPage() {
  return (
    <div>
      <h1 className="page-title">Integration Skill Matrix</h1>
      <table className="matrix">
        <thead>
          <tr>
            <th>Sub App</th>
            {COLUMNS.map(([, label]) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MANIFESTS.map((m) => {
            const skills = getIntegrationSkills(m);
            return (
              <tr key={m.appId}>
                <td className="name">
                  {m.appName}
                  <br />
                  <small style={{ color: "#94a3b8" }}>{m.ownerTeam}</small>
                </td>
                {COLUMNS.map(([key, label]) => (
                  <td key={label}>{skills[key] ? "✅" : "—"}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
