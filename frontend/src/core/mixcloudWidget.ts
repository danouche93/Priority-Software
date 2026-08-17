// Loads the Mixcloud Widget API script once and resolves with window.Mixcloud.
// https://www.mixcloud.com/developers/widget/
const WIDGET_SCRIPT_URL = 'https://widget.mixcloud.com/media/js/widgetApi.js'

export interface MixcloudWidgetEvent {
  on: (callback: () => void) => void
}

export interface MixcloudPlayerWidget {
  ready: Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  togglePlay: () => Promise<void>
  events: {
    play: MixcloudWidgetEvent
    pause: MixcloudWidgetEvent
    ended: MixcloudWidgetEvent
  }
}

export interface MixcloudGlobal {
  PlayerWidget: (iframe: HTMLIFrameElement) => MixcloudPlayerWidget
}

declare global {
  interface Window {
    Mixcloud?: MixcloudGlobal
  }
}

export function loadMixcloudWidgetApi(): Promise<MixcloudGlobal> {
  return new Promise((resolve, reject) => {
    if (window.Mixcloud) {
      resolve(window.Mixcloud)
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Mixcloud as MixcloudGlobal))
      existing.addEventListener('error', () => reject(new Error('Failed to load Mixcloud widget API.')))
      return
    }

    const script = document.createElement('script')
    script.src = WIDGET_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.Mixcloud as MixcloudGlobal)
    script.onerror = () => reject(new Error('Failed to load Mixcloud widget API.'))
    document.body.appendChild(script)
  })
}
