<script>
  import C1 from "./C1.svelte";
  import Login from "./Login.svelte";
  export let name;
  export let thevars;
</script>

<style>
  h1 {
    margin: 10px 20px 30px 20px;
    font-size: 40px;
  }
</style>

<h1>Hi {name}!</h1>
<Login />
<C1 v1={thevars.v2} />
