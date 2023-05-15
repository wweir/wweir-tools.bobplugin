var lang = require("./lang.js");
var base64 = require("./base64js.min.js");

function supportLanguages() {
  return lang.allLanguages;
}

function translate(query, completion) {
  const reqText = query.text.trim();

  try {
    const json = JSON.parse(reqText);
    let content = JSON.stringify(json, undefined, 2);

    completion({
      result: {
        toDict: {
          word: "JSON",
          parts: [{ means: [content] }],
        },
      },
    });
    return;
  } catch (e) {}

  if (isBase64(reqText)) {
    const data = base64.toByteArray(reqText);
    const content = base64Map(data, function (byte) {
      return String.fromCharCode(byte);
    }).join("");

    completion({
      result: {
        toDict: {
          word: "Base64",
          parts: [{ means: [content] }],
        },
      },
    });
    return;
  }

  completion({
    error: {
      type: "unsupportedLanguage",
      message: "支持文本: JSON、Base64",
    },
  });
}

function isBase64(str) {
  const regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
  return regex.test(str);
}

function base64Map(arr, callback) {
  const res = [];
  let kValue, mappedValue;

  for (let k = 0, len = arr.length; k < len; k++) {
    if (typeof arr === "string" && !!arr.charAt(k)) {
      kValue = arr.charAt(k);
      mappedValue = callback(kValue, k, arr);
      res[k] = mappedValue;
    } else if (typeof arr !== "string" && k in arr) {
      kValue = arr[k];
      mappedValue = callback(kValue, k, arr);
      res[k] = mappedValue;
    }
  }
  return res;
}
