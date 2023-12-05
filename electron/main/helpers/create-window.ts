import { screen, BrowserWindow, BrowserWindowConstructorOptions, Rectangle } from 'electron'
import Store from 'electron-store'
import { join } from 'path'

export default (windowName: string, options: BrowserWindowConstructorOptions): BrowserWindow => {
  const key = 'window-state'
  const name = `window-state-${windowName}`
  const store = new Store({ name })
  const defaultSize: Rectangle = <Rectangle>{
    width: options.width,
    height: options.height
  }
  let state = {}
  let win: BrowserWindow

  const restore = (): Rectangle => <Rectangle>store.get(key, defaultSize)

  const getCurrentPosition = () => {
    const position = win.getPosition()
    const size = win.getSize()
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1]
    }
  }

  const windowWithinBounds = (windowState: Rectangle, bounds: Rectangle) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    )
  }

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2
    })
  }

  const ensureVisibleOnSomeDisplay = (windowState: Rectangle) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds)
    })
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults()
    }
    return windowState
  }

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition())
    }
    //store.set(key, state)
  }

  state = ensureVisibleOnSomeDisplay(restore())

  const browserOptions: BrowserWindowConstructorOptions = {
    ...options,
    ...state,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  }
  win = new BrowserWindow(browserOptions)

  win.on('close', saveState)

  return win
}
