<script>
    import { onMount } from 'svelte';

    export let folder;
    export let language;
    export let defaultLanguage;
    export let homePath;
    let prefix = 'content/'+(language === defaultLanguage ? '' : language + '_');

    let config = {
        "title": {
            "pl": "",
            "en": ""
        },
        "email": "",
        "siteUrl": "",
        "disclaimer": {
            "pl": "",
            "en": ""
        },
        "prompt": {
            "pl": "",
            "en": ""
        },
        "link": {
            "pl": "",
            "en": ""
        },
        "comments": {
            "pl": "",
            "en": ""
        },
        "send": {
            "pl": "",
            "en": ""
        }
    }
    let index = [{ "uid": "", "name": "", "isComment": false, "comments": [] }]
    let bgImgLocation;
    let commentDisclaimer = '';
    // commentsForOneArticle = [{email: "x@y", date: "2020-03-21", text: "mój komentarz"}, {email: "aa@bb.cc", date: "2020-03-22", text: "mój 2 komentarz"}];

    onMount(async () => {
        bgImgLocation = homePath + 'resources/jumbotron.png';
        loadContent()
    });
    async function loadContent() {
        // get news config
        try {
            config = await contentClient.getJsonFile(prefix + folder + '/config.json');
        } catch (err) {
            index = []
            return
        }
        commentDisclaimer = '%0D%0A%0D%0A' + encodeURI(config.disclaimer[language]);
        // get articles
        try {
            index = await contentClient.getJsonFile(prefix + folder + '/index.json');
        } catch (err) {
            index = []
        }
        let cnt;
        let cmt;
        for (var i = 0; i < index.length; i++) {
            index[i].uid = index[i].name.substring(0, index[i].name.lastIndexOf('.'))
            index[i].content = await contentClient.getTextFile(prefix + folder + '/' + index[i].name);
            if (index[i].isComment) {
                index[i].comments = await contentClient.getJsonFile(prefix + folder + '/' + index[i].uid + '.json');
            } else {
                index[i].comments = [];
            }
        }
        index = index;
    }
    function getLength(arr) {
        let l = 0;
        try {
            l = arr.length;
        } catch{

        }
        return l;
    }
    export function languageChanged(newLanguage) {
        language = newLanguage;
        prefix = 'content/'+(language === defaultLanguage ? '' : language + '_');
        loadContent();
    }
</script>
<div
    style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%), url({bgImgLocation})">
    <div class="container text-center">
        <h1 class="title">{config.title[language]}</h1>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-3 text-center">
            <img src={prefix+folder+'/icon.png'} class="subpage_img">
        </div>
        <div class="col-md-9">
            {#each index as {uid, name, content, comments}, idx}
            <div class="container">
                <a id="{uid}"></a>
                {@html content}
                {#if homePath==='/'}
                <hr class="comments">
                <div class="row comments">
                    <div class="col-4">
                        <a 
                        class="permalink" 
                        href="#{uid}" 
                        onclick="prompt('{config.prompt[language]}','{config.siteUrl}{homePath}{folder}.html#{uid}'); return false;"
                        ><img src="/resources/link.svg"/> {config.link[language]}</a>
                    </div>
                    <div class="col-4">{config.comments[language]}: {getLength(comments)}</div>
                    <div class="col-4 text-right">
                        <a class="btn btn-sm btn-outline-secondary" role="button" 
                           href="mailto:{config.email}?subject=ID:{uid}&body={commentDisclaimer}" 
                           target="_blank">{config.send[language]}</a>
                    </div>
                </div>
                {#if getLength(comments)>0}
                {#each comments as comment}
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