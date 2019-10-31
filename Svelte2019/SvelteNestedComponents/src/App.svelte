<script>
  import C1 from "./C1.svelte";
  export let name;
  export let thevars;
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<h1>Hi {name}!</h1>
<C1 v1={thevars.v2} />
