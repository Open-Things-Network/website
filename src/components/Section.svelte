<script>
    import { onMount } from 'svelte';

    export let title;
    export let icon;
    export let file;
    export let language;
    export let defaultLanguage;
    export let idx;
    let content;
    let prefix;
    let bgcolor = idx % 2 == 0 ? 'white' : '#f8f8f8';

    onMount(async () => {
        prefix = language === defaultLanguage ? '' : language + '_';
        const res = await fetch(prefix + file);
        content = await res.text();
    });
</script>
<div style="background: {bgcolor}; padding-top: 2rem; padding-bottom: 2rem;">
    <div class="container section">
        <center><h2><img src="{icon}" width="50px;" alt="{title}" style="margin-bottom: 1rem;"/><br/>{title}</h2></center>
        <hr>
    </div>
    <div class="container">
        {@html content}
    </div>
</div>

<style>
    hr {
        color: lightgray !important;
        border: solid 1px !important;
        height: 0px !important;
    }
</style>
