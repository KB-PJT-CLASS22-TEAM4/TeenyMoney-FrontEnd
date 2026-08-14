const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '../pages/Parents')

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.name.endsWith('.vue')) acc.push(full)
  }
  return acc
}

for (const filePath of walk(base)) {
  let content = fs.readFileSync(filePath, 'utf8')
  if (!content.includes('.bottom-nav')) continue

  const before = content
  content = content.replace(
    /\n\/\*[^\n]*하단[^\n]*\*\/[\s\S]*?\.nav-item-active \.nav-label \{[\s\S]*?\}\n/g,
    '\n'
  )

  if (content !== before) {
    fs.writeFileSync(filePath, content)
    console.log('Cleaned CSS:', path.relative(base, filePath))
  }
}
