import App from './App.svelte';

let app = new App({
    target: document.body,
    props: {
        devModePort: '5000',
        defaultLanguage: 'pl',
        languages:['pl','en'],
        language: 'pl',
        cmsMode: false
    }
});

export default app;