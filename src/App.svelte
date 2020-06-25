<script>
    import { onMount } from 'svelte';
    import Navbar from "./components/Navbar.svelte";
    import Jumbotron from "./components/Jumbotron.svelte";
    import Sections from "./components/Sections.svelte";
    import News from "./components/News.svelte";
    import Subpage from "./components/Subpage.svelte";
    import Footer from "./components/Footer.svelte";

    export let languages=[];
    export let language;
    export let defaultLanguage;
    export let devModePort;
    export let devMode = false;
    export let cmsMode;

    // child components which must be binded
    let navbar;
    let news;
    let subpage;
    let footer;
    let sections;

    let path;
    let homePath;
    let pageType;
    let folderName;
    let queryLanguage;
    let index = []
    if(language==null || language==undefined){
        language=defaultLanguage;
    }
    let prefix = language === defaultLanguage ? '' : language + '_';
    if (languages.length>1 && "" !== window.localStorage.getItem("language")) {
        language = window.localStorage.getItem("language");
        prefix = language === defaultLanguage ? '' : language + '_';
        console.log("language:[" + language + "]");
    }

    onMount(async () => {
        path = window.location.pathname;
        queryLanguage = window.location.search
        if(queryLanguage.indexOf('?lang=')>-1){
            queryLanguage=queryLanguage.substring(queryLanguage.indexOf('?lang=')+6);
            if(queryLanguage.indexOf('&')>0){
                queryLanguage=queryLanguage.substring(0,queryLanguage.indexOf('&'));
            }
        }
        if(queryLanguage.length>0 && languages.includes(queryLanguage)){
            language=queryLanguage
            prefix = language === defaultLanguage ? '' : language + '_';
        }
        console.log("queryLanguage:"+queryLanguage);
        console.log("language:" + language);
        devMode = window.origin.endsWith(':' + devModePort);
        if (!devMode && window.location.hostname !== 'localhost' && window.location.protocol !== "https:") {
            window.location.protocol = "https:";
        }
        pageType = window.localStorage.getItem("pageType");
        folderName = getFolderName(window.location.pathname);
        homePath = getRoot(path);
        contentClient.setCmsMode(cmsMode);
    });

    function getFolderName(pathName) {
        if (pathName === '' || pathName === '/' || pathName.endsWith('index.html')) {
            return '';
        }
        if (pathName.endsWith('.html')) {
            return pathName.substring(pathName.lastIndexOf('/') + 1, pathName.lastIndexOf('.html'));
        }
    }
    function getRoot(pathName) {
        let pos;
        if (pathName.startsWith('/')) {
            pos = pathName.indexOf('/', 1);
        } else {
            pos = pathName.indexOf('/', 0);
        }
        if (pos > -1) {
            return pathName.substring(0, pos + 1);
        }
        return '/';
    }
    function handleSetLanguage(event) {
        language = event.detail.language
        prefix = language === defaultLanguage ? '' : language + '_';
        window.localStorage.setItem("language", language);
        if (typeof news !== 'undefined') {
            news.languageChanged(language);
        }
        if (typeof footer !== 'undefined') {
            footer.languageChanged(language);
        }
        if (typeof subpage !== 'undefined') {
            subpage.languageChanged(language);
        }
        if (typeof sections !== 'undefined') {
            sections.languageChanged(language);
        }
    }
</script>

<main>
    <Navbar path={path} homePath={homePath} bind:this={navbar} languages={languages} language={language}
        defaultLanguage={defaultLanguage} on:setLanguage={handleSetLanguage} />
    {#if 'home'===pageType}
        <Jumbotron homePath={homePath}/>
        <Sections folder="sections" iconType="png" language={language} defaultLanguage={defaultLanguage} bind:this={sections}/>
    {:else if 'multi'===pageType}
        <News homePath={homePath} folder={folderName} language={language} defaultLanguage={defaultLanguage} bind:this={news}/>
    {:else if 'single'===pageType}
        <Subpage homePath={homePath} name={folderName} language={language} defaultLanguage={defaultLanguage} bind:this={subpage}/>
    {/if}
    <Footer file="sections/footer.html" language={language} defaultLanguage={defaultLanguage} bind:this={footer}/>
</main>