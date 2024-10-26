var lang = require("./lang.js");
var base64 = require("./base64.js");

function supportLanguages() {
  return lang.allLanguages;
}

function translate(query, completion) {
  const reqText = query.text.trim();

  switch (reqText) {
    case "ip":
      $http.get({
        url: "https://webapi-pc.meitu.com/common/ip_location",
        header: {
          Host: "webapi-pc.meitu.com",
          Accept: "application/json, text/plain, */*",
        },
        handler: function (res) {
          completion({
            result: {
              toDict: {
                word: "查询本机 IP 地址",
                parts: [
                  {
                    means: [JSON.stringify(res.data.data, undefined, 2)],
                  },
                ],
              },
            },
          });
        },
      });
      return;

    case "ts":
    case "now":
      const now = Date.now();
      completion({
        result: {
          toDict: {
            word: "当前时间戳",
            parts: [
              {
                means: [
                  Math.floor(now / 1000).toString(),
                  now.toString(),
                  Math.floor(now * 1_000_000).toString(),
                ],
              },
            ],
          },
        },
      });
      return;

    default:
      break;
  }
  if (/^base64\s+(.+)$/.test(reqText)) {
    completion({
      result: {
        toDict: {
          word: "base64 编码",
          parts: [
            {
              means: [base64.encode(reqText.replace(/^base64\s+/, ""))],
            },
          ],
        },
      },
    });
    return;
  }

  if (/(^\d{10}|\d{13}|\d{19}$)/.test(reqText)) {
    const ts =
      reqText.length === 10
        ? Number(reqText) * 1000
        : reqText.length === 13
        ? Number(reqText)
        : Number(reqText.substring(0, 13));
    completion({
      result: {
        toDict: {
          word: "时间戳",
          parts: [
            {
              means: [
                new Date(ts).toLocaleString("zh-CN", {
                  hour12: false,
                }),
              ],
            },
          ],
        },
      },
    });
    return;
  }

  if (
    /^((25[0-5]|2[0-4]\d|[01]?[0-9][0-9]?)[\. ]){3}(25[0-5]|2[0-4]\d|[01]?[0-9][0-9]?)$/.test(
      reqText
    )
  ) {
    $http.get({
      url:
        "https://webapi-pc.meitu.com/common/ip_location?ip=" +
        reqText.replace(/\s/g, "."),
      header: {
        Host: "webapi-pc.meitu.com",
        Accept: "application/json, text/plain, */*",
      },
      handler: function (res) {
        completion({
          result: {
            toDict: {
              word: "查询 IP 地址: " + reqText.replace(/\s/g, "."),
              parts: [
                {
                  means: [
                    JSON.stringify(
                      res.data.data[reqText.replace(/\s/g, ".")],
                      undefined,
                      2
                    ),
                  ],
                },
              ],
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
            word: "JSON 格式化",
            parts: [{ means: [content] }],
          },
        },
      });
      return;
    } catch (e) {}
  }

  if (base64.isValid(reqText)) {
    try {
      const text = base64.decode(reqText);
      completion({
        result: {
          toDict: {
            word: "Base64 解码",
            parts: [{ means: [text] }],
          },
        },
      });
      return;
    } catch (e) {}
  }

  completion({
    error: {
      type: "unsupportedLanguage",
      message:
        "支持文本: JSON、Base64、Timestamp、IP 地址\n支持命令:[ip / ts / now / base64 <text>]",
    },
  });
}
