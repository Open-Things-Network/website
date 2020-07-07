<script>
    import { onMount } from 'svelte';

    export let name;
    export let language;
    export let defaultLanguage;
    export let homePath;

    let title = 'title';
    let published = '';
    let content = '';
    let prefix = 'content/'+(language === defaultLanguage ? '' : language + '_');
    let bgImgLocation = homePath + 'resources/jumbotron.png';
    let converter = new showdown.Converter({ tables: true, extensions: ['bootstrap'] });

    onMount(async () => {
        loadContent();
    });
    async function loadContent() {
        content = await contentClient.getTextFile(prefix + 'subpages/' + name + '.md');
        if (content.startsWith('# ')) {
            title = content.substring(2, content.indexOf('## '))
            if (title.indexOf('//') > 0) {
                published=title.substring(title.indexOf('//')+2).trim()
                title = title.substring(0, title.indexOf('//')).trim()
            }
            content = content.substring(content.indexOf('## '))
        }
        content = converter.makeHtml(content);
    }
    export function languageChanged(newLanguage) {
        language = newLanguage;
        prefix = 'content/'+(language === defaultLanguage ? '' : language + '_');
        loadContent();
    }
</script>
<div
    style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url({bgImgLocation})">
    <div class="container text-center">
        <h1 class="title">{title}</h1>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={'content/subpages/'+name+'.png'} class="subpage_img">
        </div>
        <div class="col-md-9">
            {@html content}
        </div>
    </div>
</div>

<style>
    .title {
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin-bottom: 2rem;
    }
    .subpage_img {
        max-height: 100px;
        max-width: 222px;
        margin-bottom: 2rem;
    }
</style>