<script>
    import { onMount } from 'svelte';
    import Navbar from "./components/Navbar.svelte";
    import Footer from "./components/Footer.svelte";
    import Jumbotron from "./components/Jumbotron.svelte";
    import Section from "./components/Section.svelte";
    import News from "./components/News.svelte";
    import Subpage from "./components/Subpage.svelte";

    export let language;
    export let defaultLanguage;
    export let devModePort;
    export let devMode = false;
    export let cmsMode;

    // child components which must be binded
    let navbar;
    let footer;

    let pageArticle =
            {
                title: '',
                summary: '',
                content: ''
            }

    let subpages = {};
    let path;
    let homePath;
    let pageType;
    let folderName;
    let prefix;

    onMount(async () => {
        path = window.location.pathname;
        devMode = window.origin.endsWith(':' + devModePort);
        if (!devMode && window.location.hostname !== 'localhost' && window.location.protocol !== "https:") {
            window.location.protocol = "https:";
        }
        pageType = window.localStorage.getItem("pageType");
        folderName = getFolderName(window.location.pathname);
        homePath = getRoot(path);
        //navbar.setHomePath(homePath);
        prefix = language === defaultLanguage ? '' : language + '_';
        cricketDocs.setCmsMode(cmsMode);
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
</script>

<main>
    <Navbar path={path} homePath={homePath} bind:this={navbar} language={language} defaultLanguage={defaultLanguage} cmsMode={cmsMode}/>
    {#if 'home'===pageType}
    <Jumbotron homePath={homePath}/>
    <Section idx="0" title="O nas" icon="sections/about.png" file="sections/about.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="1" title="Manifest" icon="sections/manifest.png" file="sections/manifest.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="2" title="Cele" icon="sections/goals.png" file="sections/goals.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="3" title="Zadania" icon="sections/tasks.png" file="sections/tasks.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="4" title="Udział w projektach" icon="sections/projects.png" file="sections/projects.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="5" title="Dołącz do nas" icon="sections/join.png" file="sections/join.html" language={language} defaultLanguage={defaultLanguage}/>
    <Section idx="6" title="Partnerzy" icon="sections/partners.png" file="sections/partners.html" language={language} defaultLanguage={defaultLanguage}/>
    {:else if 'multi'===pageType}
    <News homePath={homePath} folder={folderName} language={language} defaultLanguage={defaultLanguage} cmsMode={cmsMode}/>
    {:else if 'single'===pageType}
    <Subpage homePath={homePath} name={folderName} language={language} defaultLanguage={defaultLanguage} cmsMode={cmsMode}/>
    {/if}
    <Footer file="sections/footer.html" language={language} defaultLanguage={defaultLanguage} cmsMode={cmsMode}/>
</main>
