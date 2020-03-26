<script>
    import { onMount } from 'svelte';
    
    export let folder;
    export let language;
    export let defaultLanguage;
    
    let prefix;
    let config = {"title":"Title","index":[]}

    onMount(async () => {
        prefix=language===defaultLanguage?'':language+'_';
        const res = await fetch(prefix+folder+'/index.json');
        config = await res.json();
        for (var i = 0; i < config.index.length; i++) {
            const c = await fetch(prefix+folder+'/' + config.index[i].file);
            config.index[i].content = await c.text();
        }
        config=config;
    });
</script>
<div class="container text-center">
    <h1 class="title">{config.title.pl}</h1>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={folder+'/icon.png'}>
        </div>
        <div class="col-md-9">
            {#each config.index as article}
            <div class="text-container">
                <h3 class="page__main__title"><a id="{article.published}">{article.title}</a></h3>
                <hr>
                {@html article.content}
            </div>
            {/each}
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
        margin-top: 4rem;
        margin-bottom: 4rem;
    }
</style>
