<script>
    export let homePath;
    let bgImgLocation=homePath+'resources/jumbotron.png';
</script>

<div class="jumbotron" style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.5) 100%), url({bgImgLocation})">
    <div class="container text-center" style="padding:3rem;">
        <img src="resources/new_logo_horizontal_v3.svg" alt="logo" class = "logo_img">
    </div>
</div>

<style>
    .logo_img{
        width: 40%;
        align-content: center;
    }
</style>