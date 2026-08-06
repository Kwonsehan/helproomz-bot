const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Edge 패스
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = 'file:///' + path.join(__dirname, 'youth_policy_bot_service_design.html').replace(/\\/g, '/');
const pdfPath = path.join(__dirname, 'youth_policy_bot_service_design.pdf');

// edge headless 인쇄 명령어 실행
const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
execSync(cmd);
console.log("PDF 저장 완료:", pdfPath);
