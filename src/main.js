import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { ElCollapseTransition } from 'element-plus'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/base.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const app = createApp(App)
app.component(ElCollapseTransition.name)
app.use(ElementPlus, {
    locale: zhCn,
})
app.mount('#app')


