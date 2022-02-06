export const getQueryVariable = (url: string, variable: string): string => {
  try {
    const rawParams: string = new URL(url).search;
    const params: URLSearchParams = new URLSearchParams(rawParams);
    params.get(variable);
    let ret: string = '';
    if (params.get(variable)) {
      ret = String(params.get(variable));
    }
    return ret;
  } catch (e) {
    return '';
  }
};
export const sanitize = (str: string) => {
  if (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  } else {
    return str;
  }
};

export const replaceImage = (str: string): string => {
  if (!str) {
    return str;
  }
  // var regexp_url = /&gt;&gt;([0-9]*)/g; // ']))/;
  var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+).(png|jpg|jpeg|gif))/g;
  var regexp_makeLink = (_: any, url: string, ___: any, ____: string) => {
    const hash = url;
    // `<a target="_blank" href="${hash}">>>${url}</a>`;
    return (
      '<a class="autolink-image-wrapper" target="_blank" href="' +
      hash +
      '"><img class="autolink-image" style="max-width:100px; max-height: 100px;" src="' +
      hash +
      '"/></a>'
    );
  };
  return str.replace(regexp_url, regexp_makeLink);
};

export const replaceAnchor = (value: string): string => {
  if (!value) {
    return value;
  }
  value = value.replace(/</g, '&lt;');
  var regexp_url = /&gt;&gt;([0-9]*)/g; // ']))/;
  var regexp_makeLink = (_: any, url: string, ___: any, ____: string) => {
    const hash = '?id=' + url;
    return `<a target="_blank" href="${hash}">>>${url}</a>`;
  };
  return value.replace(regexp_url, regexp_makeLink);
};
