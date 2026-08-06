const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("PDF 생성 준비 중...");
const htmlPath = path.join(__dirname, 'youth_policy_bot_service_design.html');
const pdfPath = path.join(__dirname, 'youth_policy_bot_service_design.pdf');

// Edge 위치 찾기
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  execSync(cmd);
  console.log("PDF 생성 성공!", pdfPath);
} catch (e) {
  console.error("PDF 생성 실패:", e);
}
