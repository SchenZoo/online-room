import React from 'react';
import validDomains from './json/validDomains.json';

const linkRegex = new RegExp(
  `(https?://)?(www\\.)?[a-zA-Z0-9@:%._+~#=]{1,256}\\.(${validDomains.join(
    '|',
  )})+`,
  'i',
);

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

export function debounce(func: Function, wait: number, isImmediate = false) {
  let timeout: NodeJS.Timeout | null;
  return function (...args: any[]) {
    const later = () => {
      timeout = null;
      if (!isImmediate) {
        func(...args);
      }
    };
    const callNow = isImmediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = global.setTimeout(later, wait);
    if (callNow) {
      func(...args);
    }
  };
}

export function linkify(text: string, newTab = true) {
  if (!linkRegex.test(text)) return text;
  return text
    .split(' ')
    .map((word) =>
      linkRegex.test(word) ? (
        <a
          {...(newTab && { target: '_blank' })}
          href={word.includes('http') ? word.trim() : `https://${word.trim()}`}
        >
          {word}
        </a>
      ) : (
        word
      ),
    )
    .reduce((acc, word) => (acc.length ? [...acc, ' ', word] : [word]), []);
}

export const convertObjToFormData = (
  obj: Record<string, any>,
  formData = new FormData(),
  path = '',
) => {
  if (obj === undefined) return;

  for (const prop in obj) {
    const newPath = path ? `${path}[${prop}]` : prop;
    if (typeof obj[prop] !== 'object') {
      if (obj[prop] instanceof File) {
        const file: File = obj[prop];
        formData.append(newPath, file, file.name);
      } else {
        formData.append(newPath, obj[prop]);
      }
    } else if (obj[prop] === null) {
      formData.append(newPath, obj[prop]);
    } else {
      convertObjToFormData(obj[prop], formData, newPath);
    }
  }

  return formData;
};

export default {
  isTouchDevice,
  parseStringValue,
  ensureMediaPermissions,
  convertFormDataToJSONObject,
  convertObjToFormData,
  debounce,
  linkify,
};
