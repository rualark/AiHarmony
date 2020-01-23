export function getUrlParam(par) {
  let url_string = window.location.href;
  let url = new URL(url_string);
  return url.searchParams.get(par);
}

export function urlNoParams() {
  return window.location.href.split('?')[0].replace('#', '');
}

export function getEnvironment() {
  if (urlNoParams().includes("/harmony-dev")) return "dev";
  else return "prod";
}
