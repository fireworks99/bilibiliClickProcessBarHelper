// author: https://github.com/fireworks99/
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "id": "addTimeTag",
    "title": "添加时间标签",
    "contexts": ["page"],
    "documentUrlPatterns": ["*://*.bilibili.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener(function (data) {
  if(data.menuItemId === "addTimeTag") {

    //后台脚本可以访问所有WebExtension JavaScript APIS，但是他们不能直接访问网页的内容(而 content script 可以)
    // console.log(window);//undefined



    callContentScript({info: "background: addTimeTag"}, function (res) {
      console.log(res);
      let notifyOptions = {
        type: "basic",
        title: "B站小助手",
        iconUrl: "whiteIcon.png",
        message: "时间标签添加成功！",
        silent: true
      };
      chrome.notifications.create(new Date().getTime() + "AddSucceedNotify", notifyOptions);
    })

  }
})

function callContentScript(msg, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, res => {
      callback(res);
    })
  });
}

