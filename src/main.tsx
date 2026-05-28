import { render } from 'preact'
import { App } from './app'
import { I18nProvider } from './i18n'
import { UpdateBanner } from './components/update-banner'
import './index.css'

render(
  <I18nProvider>
    <App />
    <UpdateBanner />
  </I18nProvider>,
  document.getElementById('app')!,
)
