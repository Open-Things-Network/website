<script>
    import { onMount } from 'svelte';

    export let title;
    export let icon;
    export let file;
    export let language;
    export let defaultLanguage;
    let content;
    let prefix;

    onMount(async () => {
        prefix=language===defaultLanguage?'':language+'_';
        const res = await fetch(prefix+file);
        content = await res.text();
    });
</script>

<div class="container section" style="margin-top: 2rem;">
    <center><h2><img src="{icon}" width="50px;" alt="{title}"/><br/>{title}</h2></center>
    <hr>
</div>
<div class="container">
    {@html content}
</div>

<style>
    hr {
        color: lightgray !important;
        border: solid 1px !important;
        height: 0px !important;
    }
</style>
