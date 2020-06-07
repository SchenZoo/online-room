function isTouchDevice(): boolean {
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  let mq = function (query: string) {
    return window.matchMedia(query).matches;
  };

  if ('ontouchstart' in window || 'DocumentTouch' in window) {
    return true;
  }

  const query = ['(', prefixes.join('touch-enabled),('), 'ncoded', ')'].join(
    '',
  );
  return mq(query);
}

export const parseStringValue = (value: any) =>
  /^\d+$/.test(value)
    ? +value
    : /^(true|false)$/.test(value)
    ? JSON.parse(value)
    : value;

export function convertFormDataToJSONObject(formData: FormData) {
  const obj: any = {};
  formData.forEach((val, key) => {
    const isArray = key.includes('[]') || key.includes('files');

    if (isArray) {
      const newKey = key.split('[]')[0];
      if (!obj[newKey]) obj[newKey] = [];
      obj[newKey].push(parseStringValue(val));
    } else {
      obj[key] = parseStringValue(val);
    }
  });
  return obj;
}

function ensureMediaPermissions() {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices.every((device) => !(device.deviceId && device.label)),
    )
    .then((shouldAskForMediaPermissions) => {
      if (shouldAskForMediaPermissions) {
        return navigator.mediaDevices
          .getUserMedia({ audio: true, video: true })
          .then((mediaStream) =>
            mediaStream.getTracks().forEach((track) => track.stop()),
          );
      }
    });
}

export default {
  isTouchDevice,
  parseStringValue,
  ensureMediaPermissions,
  convertFormDataToJSONObject,
};
