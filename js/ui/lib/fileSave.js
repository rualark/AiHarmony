export function fileSave(filename, data, type) {
  let blob = new Blob([data], {type: type});
  if(window.navigator.msSaveOrOpenBlob) {
    console.log('var1');
    window.navigator.msSaveBlob(blob, filename);
  }
  else{
    console.log('var2');
    let elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

export function getDataUrl(data, type) {
  let blob = new Blob([data], {type: type});
  return window.URL.createObjectURL(blob);
}
