const fs = require('fs')
const path = require('path')

const apiDir = path.join(__dirname, '../src/api')
const importLine = "import { ensureAccessToken } from '@/utils/authSession'"
const blockPattern =
  /if \(!accessToken\) \{\s*throw new Error\('로그인이 필요합니다\.'\)\s*\}/g
const inlinePattern =
  /if \(!accessToken\) throw new Error\('로그인이 필요합니다\.'\)/g

for (const file of fs.readdirSync(apiDir)) {
  if (!file.endsWith('.js') || file === 'auth.js') continue

  const filePath = path.join(apiDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  content = content.replace(blockPattern, 'ensureAccessToken(accessToken)')
  content = content.replace(inlinePattern, 'ensureAccessToken(accessToken)')

  if (content === original) continue

  if (!content.includes(importLine)) {
    content = `${importLine}\n\n${content}`
  }

  fs.writeFileSync(filePath, content)
  console.log('updated', file)
}
