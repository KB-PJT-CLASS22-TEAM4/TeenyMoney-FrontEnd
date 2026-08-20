import { watch } from 'vue'
import { useSseStore } from '@/stores/sse'

/**
 * 서버가 "화면이 낡았다"고 알려오면 이 화면의 데이터를 다시 부른다.
 *
 * useRefreshOnVisible(load)와 같은 모양이다. 둘은 서로를 대신하지 않는다 -
 * 이쪽은 앱을 보고 있는 동안 들어오는 변경을 받고, 저쪽은 연결이 끊겨 있던
 * 구간(백그라운드)을 돌아올 때 메운다.
 *
 *   useServerEvents(load)                     모든 변경에 반응
 *   useServerEvents(load, ['CONNECTION'])     그 이벤트에만 반응
 *
 * 타입을 지정하지 않는 쪽이 기본인 이유: 홈 화면처럼 여러 도메인을 한 번에 보여주는
 * 화면은 어차피 대부분의 이벤트에 반응해야 하고, 빗나간 이벤트로 조회가 한 번 더
 * 나가는 비용이 목록을 관리하는 비용보다 싸다. 화면을 이동시키는 것처럼 잘못 반응하면
 * 곤란한 곳에서만 타입을 좁힌다.
 */
export function useServerEvents(load, types = null) {
  const sseStore = useSseStore()

  watch(
    () => sseStore.lastEvent,
    (event) => {
      if (!event.type) return
      if (types && !types.includes(event.type)) return

      load()
    }
  )
}
