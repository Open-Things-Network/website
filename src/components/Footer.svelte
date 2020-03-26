<script>
    import { onMount } from 'svelte';

    export let file;
    export let language;
    export let defaultLanguage;
    
    let content = '';
    let prefix;
    
    onMount(async() => {
        prefix=language===defaultLanguage?'':language+'_';
        const res = await fetch(prefix+file);
        content = await res.text();
    });

</script>
<div class='jumbotron ft'>
    <div class='container'>
        <div class="row">
            {@html content}
        </div>
    </div>
</div>
<style>
    .ft{
        margin-top: 4rem;
        background-color: #404040;
        color: whitesmoke;
    }
</style>