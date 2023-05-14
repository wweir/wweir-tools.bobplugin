var lang = require("./lang.js");
var base64 = require("./base64js.min.js");

function supportLanguages() {
  return lang.allLanguages;
}

function translate(query, completion) {
  try {
    const json = JSON.parse(query.text);
    let content = JSON.stringify(json, undefined, 2);

    completion({
      result: {
        toDict: {
          word: "json",
          parts: [{ means: [content] }],
        },
      },
    });
    return;
  } catch (e) {}

  try {
    const data = base64.toByteArray(query.text.replace(/\s+/g, ""));
    const content = map(data, function (byte) {
      return String.fromCharCode(byte);
    }).join("");

    completion({
      result: {
        toDict: {
          word: "base64",
          parts: [{ means: [content] }],
        },
      },
    });
  } catch (e) {}

  completion({
    error: {
      type: "unsupportedLanguage",
      message: "支持文本: JSON、Base64",
      // message: query.text.replace(/\s+/g, ""),
    },
  });
}

function map(arr, callback) {
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
