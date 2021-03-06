import {
  callAppHook,
  callPageHook
} from '../plugins/util'

import {
  setPullDownRefreshPageId
} from 'uni-platform/service/api/ui/pull-down-refresh'

export default function initOn (on, {
  getApp,
  getCurrentPages
}) {
  function onError (err) {
    callAppHook(getApp(), 'onError', err)
  }

  function onPageNotFound (page) {
    callAppHook(getApp(), 'onPageNotFound', page)
  }

  function onPullDownRefresh (args, pageId) {
    const page = getCurrentPages().find(page => page.$page.id === pageId)
    if (page) {
      setPullDownRefreshPageId(pageId)
      callPageHook(page, 'onPullDownRefresh')
    }
  }

  function callCurrentPageHook (hook, args) {
    const pages = getCurrentPages()
    if (pages.length) {
      callPageHook(pages[pages.length - 1], hook, args)
    }
  }

  function createCallCurrentPageHook (hook) {
    return function (args) {
      callCurrentPageHook(hook, args)
    }
  }

  function onAppEnterBackground () {
    callAppHook(getApp(), 'onHide')
    callCurrentPageHook('onHide')
  }

  function onAppEnterForeground () {
    callAppHook(getApp(), 'onShow')
    callCurrentPageHook('onShow')
  }

  function onWebInvokeAppService ({
    name,
    arg
  }, pageId) {
    if (name === 'postMessage') {
      // TODO 小程序后退、组件销毁、分享时通知
    } else {
      uni[name](arg)
    }
  }

  const routeHooks = {
    navigateTo () {
      callCurrentPageHook('onHide')
    },
    navigateBack () {
      callCurrentPageHook('onShow')
    }
  }

  function onAppRoute ({
    type
  }) {
    const routeHook = routeHooks[type]
    routeHook && routeHook()
  }

  on('onError', onError)
  on('onPageNotFound', onPageNotFound)

  if (__PLATFORM__ !== 'h5') { // 后续有时间，h5 平台也要迁移到 onAppRoute
    on('onAppRoute', onAppRoute)
  }

  on('onAppEnterBackground', onAppEnterBackground)
  on('onAppEnterForeground', onAppEnterForeground)

  on('onPullDownRefresh', onPullDownRefresh)

  on('onTabItemTap', createCallCurrentPageHook('onTabItemTap'))
  on('onNavigationBarButtonTap', createCallCurrentPageHook('onNavigationBarButtonTap'))

  on('onNavigationBarSearchInputChanged', createCallCurrentPageHook('onNavigationBarSearchInputChanged'))
  on('onNavigationBarSearchInputConfirmed', createCallCurrentPageHook('onNavigationBarSearchInputConfirmed'))
  on('onNavigationBarSearchInputClicked', createCallCurrentPageHook('onNavigationBarSearchInputClicked'))

  on('onWebInvokeAppService', onWebInvokeAppService)
}
