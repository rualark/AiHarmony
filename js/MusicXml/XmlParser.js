export class XmlParser {
  constructor(txt) {
    if (window.DOMParser) {
      let parser = new DOMParser();
      this.xmlDoc = parser.parseFromString(txt, "text/xml");
      if (this.xmlDoc.getElementsByTagName("parsererror")[0]) {
        this.error = this.xmlDoc.getElementsByTagName("parsererror")[0].innerHTML;
      }
    } else // Internet Explorer
    {
      this.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      this.xmlDoc.async = false;
      this.xmlDoc.loadXML(txt);
    }
  }

  xpath(path, node=null) {
    let res = [];
    if (!node) node = this.xmlDoc;
    if (this.xmlDoc.evaluate) {
      let nodes = this.xmlDoc.evaluate(path, node, null, XPathResult.ANY_TYPE, null);
      let result = nodes.iterateNext();
      while (result) {
        res.push(result);
        result = nodes.iterateNext();
      }
    }
    return res;
  }

  xpathValues(path, node=null) {
    let res = [];
    if (!node) node = this.xmlDoc;
    if (this.xmlDoc.evaluate) {
      let nodes = this.xmlDoc.evaluate(path, node, null, XPathResult.ANY_TYPE, null);
      let result = nodes.iterateNext();
      while (result) {
        res.push(result.childNodes[0].nodeValue);
        result = nodes.iterateNext();
      }
    }
    return res;
  }

  xpathFirstValue(path, node=null) {
    if (!node) node = this.xmlDoc;
    if (this.xmlDoc.evaluate) {
      let nodes = this.xmlDoc.evaluate(path, this.xmlDoc, null, XPathResult.ANY_TYPE, null);
      let result = nodes.iterateNext();
      if (result) {
        return result.childNodes[0].nodeValue;
      }
    }
  }

  xpathFirstInner(path, node=null) {
    if (!node) node = this.xmlDoc;
    if (this.xmlDoc.evaluate) {
      let nodes = this.xmlDoc.evaluate(path, node, null, XPathResult.ANY_TYPE, null);
      let result = nodes.iterateNext();
      if (result) {
        return result.innerHTML;
      }
    }
  }
}
