export function getUrlParam(par) {
  let url_string = window.location.href;
  let url = new URL(url_string);
  console.log(par, url.searchParams.get(par));
  return url.searchParams.get(par);
}
