<script>
    import { onMount } from 'svelte';


    export let subpages;
    export let name;
    export let language;
    export let defaultLanguage;

    let title;
    let content;
    let prefix;

    onMount(async () => {
        prefix=language===defaultLanguage?'':language+'_';
        const res = await fetch(prefix+'subpages/' + name + '.html');
        content = await res.text();
        try {
            title = subpages[name].title.pl;
        } catch (ex) {
            title = name;
        }
    });
</script>
<div class="container text-center">
    <h1 class="title">{title}</h1>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={'subpages/'+name+'.png'}>
        </div>
        <div class="col-md-9">
            {@html content}
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
