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

const COMPANY_LOGOS = [
  { keys: ['카카오뱅크', '카카오'], logo: kakaoLogo },
  { keys: ['토스뱅크', '토스'], logo: tossLogo },
  { keys: ['케이뱅크'], logo: kbankLogo },
  { keys: ['KB국민', '국민'], logo: kbLogo },
  { keys: ['NH농협', '농협'], logo: nhLogo },
  { keys: ['신한'], logo: shinhanLogo },
  { keys: ['삼성'], logo: samsungLogo },
  { keys: ['현대'], logo: hyundaiLogo },
  { keys: ['롯데'], logo: lotteLogo },
  { keys: ['우리'], logo: wooriLogo },
  { keys: ['하나'], logo: hanaLogo },
  { keys: ['기업비씨', '기업BC', 'IBK'], logo: ibkLogo },
  { keys: ['BC', '비씨'], logo: bcLogo },
  { keys: ['씨티'], logo: citiLogo },
  { keys: ['광주'], logo: gwangjuLogo },
  { keys: ['산업'], logo: kdbLogo },
  { keys: ['새마을'], logo: saemaulLogo },
  { keys: ['신협'], logo: shinhyupLogo },
  { keys: ['우체국'], logo: postLogo },
  { keys: ['저축'], logo: savingLogo },
  { keys: ['전북'], logo: jeonbukLogo },
  { keys: ['제주'], logo: jejuLogo },
  { keys: ['수협'], logo: suhyupLogo },
]

export const DEFAULT_PAYMENT_LOGO = defaultLogo

export function getCardCompanyLogo(cardCompany) {
  const name = String(cardCompany || '').trim()
  if (!name) return defaultLogo

  const matched = COMPANY_LOGOS.find(({ keys }) =>
    keys.some((key) => name.includes(key))
  )

  return matched?.logo || defaultLogo
}
