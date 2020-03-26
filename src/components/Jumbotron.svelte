<script>
    export let homePath;
    export let bgImgLocation=homePath+'resources/jumbotron.png';
</script>

<div class="jumbotron" style="background-image: linear-gradient(to bottom, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.5) 100%), url({bgImgLocation})">
    <div class="container text-center">
        <img src="resources/new_w_logo_horizontal_v1.svg" alt="logo" class = "logo_img">
    </div>
</div>

<style>
    .logo_img{
        width: 50%;
        align-content: center;
    }
</style>