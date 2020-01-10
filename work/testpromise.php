<script>
  console.log(1);
  let promise = new Promise(resolve => {
    throw Error("Error!");
    //setTimeout(() => resolve("resolved"), 1000);
  });
  console.log(2);
  promise.then(console.log, (err) => {
    console.log(err);
    throw err;
  }).then(console.log);
  console.log(3);

  function f() {
    console.log(arguments);
    let args = [].slice.call(arguments);
    console.log(args);
    console.log(args.concat(function (err, v) {}));
  }
  f(1, 2, 3);
</script>
