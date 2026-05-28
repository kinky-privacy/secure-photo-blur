import { render } from 'preact'
import { App } from './app'
import { I18nProvider } from './i18n'
import { UpdateBanner } from './components/update-banner'
import './index.css'

// Static pre-render content lives inside #app for crawlers / no-JS.
// Clear it before mounting so Preact starts from a clean container.
const root = document.getElementById('app')!
root.innerHTML = ''

render(
  <I18nProvider>
    <App />
    <UpdateBanner />
  </I18nProvider>,
  root,
)
