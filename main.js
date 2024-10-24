var lang = require("./lang.js");
var base64 = require("./base64js.min.js");

function supportLanguages() {
  return lang.allLanguages;
}

function translate(query, completion) {
  const reqText = query.text.trim();

  if (
    /^((25[0-5]|2[0-4]\d|[01]?[0-9][0-9]?)[\. ]){3}(25[0-5]|2[0-4]\d|[01]?[0-9][0-9]?)$/.test(
      reqText
    )
  ) {
    $http.get({
      url: "https://webapi-pc.meitu.com/common/ip_location?ip=" + reqText,
      header: {
        Host: "webapi-pc.meitu.com",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      },
      handler: function (res) {
        completion({
          result: {
            toDict: {
              word: "JSON",
              parts: [{ means: [JSON.stringify(res.data.data, undefined, 2)] }],
            },
          },
        });
      },
    });
    return;
  }

  if (/^(\{|\[)([\s\S]*)(\}|\])$/.test(reqText)) {
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
  }

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

  try {
    let date = parseDate(reqText);
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZoneName: "short",
    });

    completion({
      result: {
        toDict: {
          word: "Timestamp",
          parts: [{ means: [formatter.format(date)] }],
        },
      },
    });
    return;
  } catch (e) {}

  completion({
    error: {
      type: "unsupportedLanguage",
      message: "支持文本: JSON、Base64、Timestamp",
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

function parseDate(str) {
  if (/^\d{10}$/.test(str)) {
    return new Date(Number(str) * 1000);
  }
  if (/^\d{13}$/.test(str)) {
    return new Date(Number(str));
  }
  if (/^\d{19}$/.test(str)) {
    return new Date(Number(str.slice(0, 13)));
  }
  throw new Error("时间戳格式错误");
}
