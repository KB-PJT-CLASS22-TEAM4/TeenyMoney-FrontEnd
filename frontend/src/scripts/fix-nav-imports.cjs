const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '../pages/Parents')
const importLine = "import ParentBottomNav from '@/components/Parents/BottomNav.vue'\n"

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
  if (!content.includes('ParentBottomNav')) continue

  let changed = false

  if (!content.includes('import ParentBottomNav')) {
    content = content.replace(
      /<script setup>\r?\n/,
      `<script setup>\n${importLine}\n`
    )
    changed = true
  }

  if (content.includes('.bottom-nav')) {
    const next = content.replace(
      /\r?\n\/\*[^\n]*하단[^\n]*\*\/[\s\S]*?\.nav-item-active \.nav-label \{[\s\S]*?\}\r?\n/g,
      '\n'
    )
    if (next !== content) {
      content = next
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content)
    console.log('Fixed:', path.relative(base, filePath))
  }
}
