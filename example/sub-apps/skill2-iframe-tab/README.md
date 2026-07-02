# Skill 2 — iframe 탭 제공 옵션 (인증 통합 없음)

포트 3002, 가상 앱 "Legacy Report". 로그인도, postMessage도, 위젯도, 자기 API도 없다.
Mother App 탭 안에 iframe으로 표시될 전체 화면 URL 하나만 제공하면 끝이다.

## 파일 구성

```text
app/
├─ page.tsx     iframe에 그대로 노출될 전체 화면 (인증 코드 0줄)
├─ layout.tsx
└─ globals.css
```

## 구현 방식

- Sub App은 **평범한 전체 화면 하나**만 만든다. 통합을 위한 특별한 코드가 없다.
- Mother App이 Manifest의 `iframeTab` 선언을 보고 `<iframe src>`로 그린다:

  ```ts
  iframeTab: {
    enabled: true,
    url: "http://localhost:3002",
    allowedOrigin: "http://localhost:3002",  // postMessage/보안 기준 origin
    sandbox: ["allow-scripts", "allow-same-origin", "allow-forms"]
  }
  ```

- Mother App 쪽 렌더링은 `mother-app/components/IframeTab.tsx`가 담당하며,
  이 앱은 그 존재조차 몰라도 된다(느슨한 결합).

## 체감 포인트

Mother App 로그인 여부와 무관하게 탭 내용이 항상 보인다. 다섯 앱 중 코드가 가장 적다.
