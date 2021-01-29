"use strict";

import T   from './tool.js';
import md5 from 'blueimp-md5';

// link http:, https: or data:
function getNameByLink({link, extension, mimeTypeData, prefix}) {
  const name = generateName(link, prefix);
  const ext  = getFileExtension(link, extension, mimeTypeData);
  return ext ? [name, ext].join('.') : name;
}

function getNameByContent({content, extension, prefix}) {
  const name = generateName(content, prefix);
  const ext = extension;
  return ext ? [name, ext].join('.') : name;
}

function getFilename({storageInfo, assetName}) {
  return T.joinPath(storageInfo.assetFolder, assetName);
}

function getPath({storageInfo, assetName}) {
  if (storageInfo.assetRelativePath === '') {
    return assetName;
  } else {
    return [storageInfo.assetRelativePath, assetName].join('/');
  }
}

function calcInfo(link, storageInfo, mimeTypeData, prefix) {
  const assetName = getNameByLink({
    link: link,
    prefix: prefix,
    mimeTypeData: mimeTypeData
  });

  return {
    filename: getFilename({storageInfo, assetName}),
    path: getPath({storageInfo, assetName})
  }
}


/**
 * Generate asset name according to content
 *
 * @param {String} identifier
 *   Normally, it's a url
 *
 * @param {String} prefix - optional
 *   Use prefix to avoid asset name conflict.
 *   currently we use clipId as prefix.
 *
 * @return {String} the generated asset name
 *
 */
function generateName(identifier, prefix) {
  const parts = [];
  parts.push(md5(identifier))
  if (prefix) { parts.unshift(prefix); }
  return parts.join('-');
}

function getFileExtension(link, extension, mimeTypeData) {
  const {
    // mime type that get from http request.
    httpMimeType,
    // mime type that get from attribute of HTML tag.
    attrMimeType
  } = (mimeTypeData || {});
  try{
    let url = new URL(link);
    if (url.protocol === 'data:') {
      //data:[<mediatype>][;base64],<data>
      const mimeType = url.pathname.split(';')[0];
      return T.mimeType2Extension(mimeType);
    } else {
      // http OR https
      if (extension) { return extension }
      if (httpMimeType) {
        return T.mimeType2Extension(httpMimeType);
      } else {
        const ext = T.getUrlExtension(url.href)
        if(ext) {
          return ext;
        } else {
          if(attrMimeType) {
            return T.mimeType2Extension(attrMimeType);
          } else {
            return null;
          }
        }
      }
    }
  } catch(e) {
    // invalid link
    console.warn('mx-wc', e);
    return null;
  }
}

const Asset = {
  getNameByLink: getNameByLink,
  getNameByContent: getNameByContent,
  getFilename: getFilename,
  getPath: getPath,
  calcInfo: calcInfo,
}

export default Asset;
