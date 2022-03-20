import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;
import { createApp, h } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import '@/style.scss';

const app = createApp({ render: () => h(App) }).use(router);
app.mount('#app');

export default app;
