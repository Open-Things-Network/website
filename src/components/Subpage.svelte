<script>
    import { onMount } from 'svelte';

    export let name;
    export let language;
    export let defaultLanguage;
    export let cmsMode;
    export let homePath;

    let title = 'title';
    let content = '';
    let prefix;
    let subpages;
    let bgImgLocation;

    onMount(async () => {
        prefix = language === defaultLanguage ? '' : language + '_';
        if (cmsMode) {
            bgImgLocation = homePath + 'resources/jumbotron.png';
            const doc = await cricketDocs.getJsonFile(prefix + 'subpages/' + name + '.html');
            title = doc.title;
            content = doc.content;
        } else {
            bgImgLocation = homePath + 'resources/jumbotron.png';
            const res = await cricketDocs.getJsonFile(prefix + 'subpages/index.json');
            subpages = await res;
            const res2 = await cricketDocs.getTextFile(prefix + 'subpages/' + name + '.html');
            content = await res2;
            try {
                title = subpages[name].title.pl;
            } catch (ex) {
                title = name;
            }
        }
    });
</script>
<div style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url({bgImgLocation})">
    <div class="container text-center">
        <h1 class="title">{title}</h1>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={'subpages/'+name+'.png'} class="subpage_img">
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
    .title{
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin-bottom: 2rem;
    }
    .subpage_img {
        max-height:100px;
        max-width:222px;
        margin-bottom: 2rem;
    }
</style>
