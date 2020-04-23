<script>
    import { onMount } from 'svelte';

    export let file;
    export let language;
    export let defaultLanguage;

    let content = '';
    let prefix = language === defaultLanguage ? '' : language + '_';

    onMount(async () => {
        loadContent()
    });
    async function loadContent() {
        let res = '';
        content = await contentClient.getTextFile(prefix + file);
    }
    export function languageChanged(newLanguage) {
        language = newLanguage
        prefix = language === defaultLanguage ? '' : language + '_';
        loadContent();
    }

</script>
<div class='jumbotron ft'>
    <div class='container'>
        <div class="row">
            {@html content}
        </div>
    </div>
</div>
<style>
    .ft {
        margin-top: 4rem;
        background-color: #404040;
        color: whitesmoke;
    }
</style>