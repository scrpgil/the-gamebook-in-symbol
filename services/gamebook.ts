export type RawNumberingAddress = [string, string];
export interface NumberingAddress {
  text: string;
  address: string;
  type?: string;
}
export const decodeNumberingAddress = (
  rawNumberingAddress: RawNumberingAddress[],
): NumberingAddress[] => {
  let numberingAddressArray: NumberingAddress[] = [];

  for (const raw of rawNumberingAddress) {
    numberingAddressArray.push({
      text: raw[0],
      address: raw[1],
    });
  }
  return numberingAddressArray;
};

export const replaceNumberingAnchor = (value: string): string => {
  if (!value) {
    return value;
  }
  value = value.replace(/</g, '&lt;');
  var regexp_url = /「([0-9]*)」/g; // ']))/;
  var regexp_makeLink = (_: any, url: string, ___: any, ____: string) => {
    const hash = window.location.pathname + '?address=' + url;
    return `「<a href="${hash}">${url}</a>」`;
  };
  return value.replace(regexp_url, regexp_makeLink);
};

export const createRegistAddressMessage = (text: string, address: string) => {
  return `["${text}","${address}"]`;
};
