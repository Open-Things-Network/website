<script>
    import { onMount } from 'svelte';

    export let path;
    export let homePath;
    export let language;
    export let defaultLanguage;
    export let cmsMode;

    let navlist =
    {
        "title":"",
        "logo":"",
        "elements":[
                {url: "/", label: {en: "Home", pl: "Home"}, target: ""}

            ]
    };
    onMount(async () => {
        if (cmsMode) {
            const res = await cricketDocs.getJsonFile(`navigation.json`);
            navlist = await res;
        }else{
            const res = await cricketDocs.getJsonFile(`navigation.json`);
            navlist = await res;
        }
        document.title=navlist.title;
    });

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
</style>