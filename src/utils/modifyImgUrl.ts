/**
 * 根据七牛云CDN自动处理图片参数，全局修改图片地址，添加参数。
 * @param url 图片地址
 * @param option
 * @returns
 */
function modifyImgUrl(
  url: string,
  option: {
    width: number;
    height: number;
    quality: number;
    webp: boolean;
  }
) {
  let params = [];
  const { width, height, quality, webp } = option;
  if (width && height) params.push(`w/${width}/h/${height}`);
  if (quality) params.push(`q/${quality}`);
  // 低版本 iOS 不支持 webp，前端要判断。
  if (webp && getIOSMainVersion() > 14) params.push("format/webp");
  if (params.length) {
    return url + "?imageView2/2/" + params.join("/");
  }
  return url;
}

function getIOSMainVersion() {
  try {
    // 示例：Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 AliApp(TB/9.12.5.3) WindVane/8.7.0 UT4Aplus/0.0.4 1125x2436 WK
    const IOSSystemVersion = navigator.userAgent.match(
      /iPhone OS (\d+)_(\d+)_?(\d+)?/
    );
    return Number(IOSSystemVersion?.[1]);
  } catch (e) {
    return 0;
  }
}

// 这里添加的后缀规则是通过七牛云新建的样式规则实现的。
function modifyUrlWithWebp(url: string) {
  return url + "-wp.webp";
}
