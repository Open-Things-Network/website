<script>
    import { onMount } from 'svelte';

    export let folder;
    export let language;
    export let defaultLanguage;
    export let iconType;
    let prefix = language === defaultLanguage ? '' : language + '_';
    let index = [{ "name": "" }]
    let bgcolor = "white"

    onMount(async () => {
        loadContent()
    });
    async function loadContent() {
        // get articles
        try {
            index = await contentClient.getJsonFile(prefix + folder + '/index.json');
        } catch (err) {
            console.log(err)
            index = []
        }
        var parser = new DOMParser();
        for (var i = 0; i < index.length; i++) {
            index[i].content = await contentClient.getTextFile(prefix + folder + '/' + index[i].name);
            index[i].icon = prefix + folder + '/' + index[i].name.substring(0, index[i].name.lastIndexOf('.')) + '.' + iconType;
            var doc = parser.parseFromString(index[i].content, "text/html");
            try {
                index[i].title = doc.querySelector('article header title').innerHTML;
            } catch (ex) {
                index[i].title = index[i].name;
            }
        }
    }
    export function languageChanged(newLanguage) {
        language = newLanguage;
        prefix = language === defaultLanguage ? '' : language + '_';
        loadContent();
    }
</script>
{#each index as {name, title, content, icon}, idx}
<div class="section" style="padding-top: 2rem; padding-bottom: 2rem;">
    <div class="container">
        <center>
            <h2><img src="{icon}" width="50px;" alt="{title}" style="margin-bottom: 1rem;" /><br />{title}</h2>
        </center>
        <hr>
    </div>
    <div class="container">
        {@html content}
    </div>
</div>
{/each}
<style>
    hr {
        color: lightgray !important;
        border: solid 1px !important;
        height: 0px !important;
    }
    .section:nth-child(even) {
        background-color: #F8F8F8;
    }
</style>