<script>
    import { onMount } from 'svelte';

    export let name;
    export let language;
    export let defaultLanguage;
    export let homePath;

    let title = 'title';
    let content = '';
    let prefix = 'content/'+(language === defaultLanguage ? '' : language + '_');
    let bgImgLocation = homePath + 'resources/jumbotron.png';

    onMount(async () => {
        loadContent();
    });
    async function loadContent() {
        content = await contentClient.getTextFile(prefix + 'subpages/' + name + '.html');
        var parser = new DOMParser();
        var doc = parser.parseFromString(content, "text/html");
        try {
            title = doc.querySelector('article header title').innerHTML;
        } catch (ex) {
            title = name;
        }
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
    hr {
        color: lightgray !important;
        border: solid 1px !important;
        height: 0px !important;
    }

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