<script>
    import { onMount } from 'svelte';

    export let folder;
    export let language;
    export let defaultLanguage;
    export let cmsMode; // for next version - not used now     
    export let homePath;
    let prefix;

    let title={"pl": "aktualności", "en": "news"}
    let index = []
    let bgImgLocation;
    let commentDisclaimer = '%0D%0A%0D%0A' + encodeURI('Wysyłając komentarz akceptujesz warunki korzystania ze strony: https://otwartasiecrzeczy.org/legal.html');

    //let comments = {"2020-03-20": [{email: "x@y", date: "2020-03-21", text: "mój komentarz"}, {email: "aa@bb.cc", date: "2020-03-22", text: "mój 2 komentarz"}]};
    let comments = {};
    onMount(async () => {
        prefix = language === defaultLanguage ? '' : language + '_';
        if (cmsMode) {
            bgImgLocation = homePath + 'resources/jumbotron.png';
        } else {
            bgImgLocation = homePath + 'resources/jumbotron.png';
        }
        // get title for supported languages
        const tres = await cricketDocs.getJsonFile(prefix + folder + '/title.json');
        title = await tres;
        // get articles
        const res = await cricketDocs.getJsonFile(prefix + folder + '/index.json');
        index = await res;
        for (var i = 0; i < index.length; i++) {
            const c = await cricketDocs.getTextFile(prefix + folder + '/' + index[i].name);
            index[i].uid=index[i].name.substring(0,index[i].name.lastIndexOf('.'))
            index[i].content = await c;
        }
        index = index;
    });

    function getCommentsSize(id) {
        const cList = comments[id]
        if (typeof cList !== 'undefined' && typeof cList !== null) {
            return cList.length;
        } else {
            return 0;
        }
    }

    function getComments(id) {
        console.log("getComments " + id);
        const cList = comments[id]
        if (typeof cList !== 'undefined' && typeof cList !== null) {
            return cList;
        } else {
            return [];
        }
    }

</script>
<div
    style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url({bgImgLocation})">
    <div class="container text-center">
        <h1 class="title">{title.pl}</h1>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={folder+'/icon.png'} class="subpage_img">
        </div>
        <div class="col-md-9">
            {#each index as article}
            <div class="container">
                <a id="{article.uid}"></a>
                {@html article.content}
                {#if homePath==='/'}
                <hr class="comments">
                <div class="row comments">
                    <div class="col-4">
                        <a class="permalink" href="#{article.uid}" onclick="prompt('Naciśnij Ctrl + C żeby skopiować odnośnik do schowka','https://otwartasiecrzeczy.org{homePath}{folder}.html#{article.uid}'); return false;"><img src="resources/link.svg"/> Link do artykułu</a>
                    </div>
                    <div class="col-4">Komentarze: {getCommentsSize(article.uid)}</div>
                    <div class="col-4 text-right">
                        <a class="btn btn-sm btn-outline-secondary" role="button" 
                           href="mailto:comments@otwartasiecrzeczy.org?subject=ID:{article.uid}&body={commentDisclaimer}" 
                           target="_blank">Wyślij komentarz</a>
                    </div>
                </div>
                {#if getCommentsSize(article.uid)>0}
                {#each comments[article.uid] as comment}
                <div class="row comment-header">
                    <div class="col-12">{comment.date} <i>{comment.email}</i></div>
                </div>
                <div class="row comment">
                    <div class="col-12">{comment.text}</div>
                </div>
                {/each}
                {/if}
                {/if}
            </div>
            {/each}
        </div>
    </div>
</div>

<style>
    hr.content {
        color: lightgray !important;
        border: solid 1px !important;
        height: 0px !important;
    }
    hr.comments {
        color: lightgray !important;
        border: dotted 1px !important;
        height: 0px !important;
    }
    .title{
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin-bottom: 2rem;
    }
    .subpage_img {
        max-height:100px;
        max-width:222px;
        margin-bottom: 2rem;
    }
    a.permalink{
        color: black;
    }
    a.permalink:hover{
        text-decoration: none;
    }
    div.comments{
        margin-bottom: 1rem;
    }
    div.comment-header{
        font-size: small;
    }
    div.comment{
        font-size: small;
        margin-bottom: 0.7rem;
    }
</style>