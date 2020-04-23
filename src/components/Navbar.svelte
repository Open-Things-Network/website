<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let path;
    export let homePath;
    export let languages;
    export let language;
    export let defaultLanguage;

    let navlist =
    {
        "title": "",
        "logo": "",
        "elements": [
            { url: "/", label: { en: "Home", pl: "Home" }, target: "" }

        ]
    };
    onMount(async () => {
        navlist =  await contentClient.getJsonFile(`navigation.json`);
        document.title = navlist.title;
    });
    function handleLang(x) {
        dispatch('setLanguage', {
            language: x
        })
    }

</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        {#if !(path===homePath || path===homePath+'index.html')}
        <img class="mr-auto" src="{navlist.logo}" alt="logo">
        {/if}
        <button class="navbar-toggler ml-auto" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <ul class="navbar-nav ml-auto">
                {#each navlist.elements as element}
                <a class="nav-item nav-link ml-auto mycolor" 
                   href={element.url==='/'?homePath:element.url} 
                   target={element.target}>{element.label[language]}</a>
                {/each}
                {#if languages.length>1}
                {#each languages as lang}
                {#if lang!==language}
                    <a class="nav-item nav-link ml-auto mycolor" 
                    on:click={() => handleLang(lang)}><img class="flag" alt={lang} src={'resources/flags/'+lang+'.svg'}></a>
                {/if}
                {/each}
                {/if}
            </ul>

        </div>
    </div>
</nav>
<style>
    nav img{
        width: 125px;
    }
    a.nav-item{
        font-size: large;
    }
    .flag{
        width: 1.6rem; 
        border-width: 1px; 
        border-color: lightgray;
        border-style: solid;
    }
</style>