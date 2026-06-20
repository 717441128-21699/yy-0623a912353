export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/check/index',
    'pages/summary/index',
    'pages/patient-detail/index',
    'pages/tomorrow-todo/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00a0e9',
    navigationBarTitleText: '诊所每日自查',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#00a0e9',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日'
      },
      {
        pagePath: 'pages/check/index',
        text: '自查'
      },
      {
        pagePath: 'pages/summary/index',
        text: '小结'
      }
    ]
  }
})
