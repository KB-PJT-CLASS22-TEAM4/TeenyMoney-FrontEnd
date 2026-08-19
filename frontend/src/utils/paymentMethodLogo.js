import defaultLogo from '@/assets/logo.svg'
import kbLogo from '@/assets/card-issuers/kb.png'
import shinhanLogo from '@/assets/card-issuers/shinhan.png'
import samsungLogo from '@/assets/card-issuers/samsung.png'
import hyundaiLogo from '@/assets/card-issuers/hyundai.png'
import lotteLogo from '@/assets/card-issuers/lotte.png'
import wooriLogo from '@/assets/card-issuers/woori.png'
import hanaLogo from '@/assets/card-issuers/hana.png'
import nhLogo from '@/assets/card-issuers/nh.png'
import bcLogo from '@/assets/card-issuers/bc.png'
import kakaoLogo from '@/assets/card-issuers/kakao.png'
import tossLogo from '@/assets/card-issuers/toss.png'
import citiLogo from '@/assets/card-issuers/citi.png'
import ibkLogo from '@/assets/card-issuers/ibk.png'
import kbankLogo from '@/assets/card-issuers/kbank.png'
import postLogo from '@/assets/card-issuers/post.png'
import saemaulLogo from '@/assets/card-issuers/saemaul.png'
import shinhyupLogo from '@/assets/card-issuers/shinhyup.png'
import jeonbukLogo from '@/assets/card-issuers/jeonbuk.png'
import jejuLogo from '@/assets/card-issuers/jeju.png'
import gwangjuLogo from '@/assets/card-issuers/gwangju.png'
import suhyupLogo from '@/assets/card-issuers/suhyup.png'
import kdbLogo from '@/assets/card-issuers/kdb.png'
import savingLogo from '@/assets/card-issuers/saving.png'

/*
 * 토스페이먼츠 카드사 코드
 * https://docs.tosspayments.com/codes/org-codes
 */
const CARD_COMPANIES = [
  { codes: ['3K'], names: ['기업비씨', '기업bc', 'ibk_bc', 'ibk'], logo: ibkLogo },
  { codes: ['46'], names: ['광주은행', '광주', 'gwangjubank'], logo: gwangjuLogo },
  { codes: ['71'], names: ['롯데카드', '롯데', 'lotte'], logo: lotteLogo },
  { codes: ['30'], names: ['산업은행', '산업', 'kdbbank'], logo: kdbLogo },
  { codes: ['31'], names: ['bc카드', 'bccard', 'bc'], logo: bcLogo },
  { codes: ['51'], names: ['삼성카드', '삼성', 'samsung'], logo: samsungLogo },
  { codes: ['38'], names: ['새마을금고', '새마을', 'saemaul'], logo: saemaulLogo },
  { codes: ['41'], names: ['신한카드', '신한', 'shinhan'], logo: shinhanLogo },
  { codes: ['62'], names: ['신협', 'shinhyeop'], logo: shinhyupLogo },
  { codes: ['36'], names: ['씨티카드', '씨티', 'citi'], logo: citiLogo },
  { codes: ['33', 'W1'], names: ['우리카드', '우리bc', '우리', 'woori'], logo: wooriLogo },
  { codes: ['37'], names: ['우체국예금보험', '우체국', 'post'], logo: postLogo },
  { codes: ['39'], names: ['저축은행', '저축', 'savingbank'], logo: savingLogo },
  { codes: ['35'], names: ['전북은행', '전북', 'jeonbukbank'], logo: jeonbukLogo },
  { codes: ['42'], names: ['제주은행', '제주', 'jejubank'], logo: jejuLogo },
  { codes: ['15'], names: ['카카오뱅크', 'kakaobank'], logo: kakaoLogo },
  { codes: ['3A'], names: ['케이뱅크', 'kbank'], logo: kbankLogo },
  { codes: ['24'], names: ['토스뱅크', 'tossbank'], logo: tossLogo },
  { codes: ['21'], names: ['하나카드', '하나', 'hana'], logo: hanaLogo },
  { codes: ['61'], names: ['현대카드', '현대', 'hyundai'], logo: hyundaiLogo },
  { codes: ['11'], names: ['kb국민카드', '국민카드', '국민', 'kookmin'], logo: kbLogo },
  { codes: ['91'], names: ['nh농협카드', '농협카드', '농협', 'nonghyeop'], logo: nhLogo },
  { codes: ['34'], names: ['수협은행', '수협', 'suhyeop'], logo: suhyupLogo },
]

const BY_CODE = new Map()
const BY_NAME = new Map()

CARD_COMPANIES.forEach((company) => {
  company.codes.forEach((code) => {
    BY_CODE.set(code.toUpperCase(), company.logo)
  })
  company.names.forEach((name) => {
    BY_NAME.set(name.toLowerCase(), company.logo)
  })
})

export function extractLeadingDigits(value) {
  const raw = String(value || '').replace(/[^\d*Xx]/g, '')
  let digits = ''

  for (const char of raw) {
    if (char === '*' || char === 'X' || char === 'x') break
    digits += char
  }

  return digits
}

export function getCardCompanyCodeFromNumber(value) {
  const digits = extractLeadingDigits(value)
  if (digits.length < 6) return ''
  return digits.slice(4, 6)
}

function findLogoByCompanyName(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  const codeHit = BY_CODE.get(raw.toUpperCase())
  if (codeHit) return codeHit

  const normalized = raw.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')
  if (!normalized) return null

  const exact = BY_NAME.get(normalized)
  if (exact) return exact

  const aliases = [...BY_NAME.entries()].sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [name, logo] of aliases) {
    if (name.length < 2) continue
    if (normalized.includes(name)) return logo
  }

  return null
}

export function getPaymentMethodLogo(payment, cardNumber = '') {
  const numberHint =
    cardNumber ||
    payment?.cardNumber ||
    payment?.maskedCardNumber ||
    payment?.bin ||
    payment?.cardBin ||
    ''

  const issuerCode = getCardCompanyCodeFromNumber(numberHint)
  if (issuerCode) {
    const fromBin = BY_CODE.get(issuerCode.toUpperCase())
    if (fromBin) return fromBin
  }

  const fromName = findLogoByCompanyName(
    payment?.cardCompany ||
    payment?.issuer ||
    payment?.cardIssuer ||
    payment?.bankName ||
    payment?.accountBank ||
    payment?.accountBankName
  )

  return fromName || defaultLogo
}

export const DEFAULT_PAYMENT_LOGO = defaultLogo
