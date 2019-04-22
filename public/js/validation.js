
const {error} = Qs.parse(location.search, {ignoreQueryPrefix: true});
console.log(error);
if(error) swal("Error", error, "error");