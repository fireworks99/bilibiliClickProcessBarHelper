chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.info === "background: addTimeTag") {
    addTimeTag();
  } else if(request.info === "popup: jump") {
    jump(request.url, request.pNum, request.tNum);
  }
  sendResponse("(content script)我滴任务完成了，啊哈哈哈~");
})

function addTimeTag() {

  let url = "https://www.bilibili.com" + window.location.pathname;
  let pNum = getPNum();
  let title = getTitle();
  let tNum = getTNum();

  let timeTag1 = {"url": url, "pNum": pNum, "title": title, "tNum": tNum};

  chrome.storage.sync.get(['timeTagList'], function(result) {
    if(JSON.stringify(result) === "{}") {
      chrome.storage.sync.set({"timeTagList": [timeTag1]}, function () {
        console.log("Storage finished!");
      })
    } else {
      result.timeTagList.push(timeTag1);
      chrome.storage.sync.set({"timeTagList": result.timeTagList}, function () {
        console.log("Storage finished!");
      })
    }
  });


  // content scripts 得到的是一个“干净的DOM视图”， 意味着：
  //   1. content scripts 不能看见页面脚本定义的javascript 变量。
  //   2. 如果一个页面脚本重定义了一个DOM内置属性，content scripts将获取到这个属性的原始版本，而不是重定义版本。
  // console.log(window.player);//undefined
  // useWebPagesVarsFunctions();
}

function getPNum() {
  let pNum = 1;
  let div = document.getElementById("multi_page");
  if(div != null) {
    // let lis = div.getElementsByClassName("on");
    let lis = div.getElementsByClassName("cur-list");
    if(lis.length > 0) {
      lis = lis[0].getElementsByClassName("on");
      if(lis.length > 0) {
        let ps = lis[0].getElementsByClassName("page-num");
        if(ps.length > 0) {
          let p = ps[0].innerHTML;
          pNum = parseInt(p.substr(1));
        } else {
          let spans = lis[0].getElementsByTagName("span");
          if(spans.length === 1) pNum = parseInt(spans[0].innerHTML);
        }
      }
    }
  }
  return pNum;
}

function getTitle() {
  let title;
  let ts = document.getElementsByClassName("tit");
  if(ts.length > 0) title = ts[0].innerHTML;
  else {
    ts = document.getElementById("player-title");
    if(ts) title = ts.innerHTML;
  }
  return title;
}

function getTNum() {
  let tNum;
  let times = document.getElementsByClassName('bilibili-player-video-time-now');
  if(times.length > 0) {
    let tStr = times[0].innerHTML;
    tNum = hms2s(tStr);
  } else {
    times = document.getElementsByClassName('squirtle-video-time-now');
    if(times.length > 0) {
      let tStr = times[0].innerHTML;
      tNum = hms2s(tStr);
    }
  }
  return tNum;
}

//function: hh:mm:ss to second
function hms2s(hms) {
  let s = hms.split(":");
  let ans = 0;
  for(let i = s.length - 1, j = 1; i >= 0; --i, j *= 60) {
    ans += parseInt(s[i]) * j;
  }
  return ans;
}


function jump(url, pNum, tNum) {
  let nowUrl = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
  let nowPNum = getPNum();

  if(nowUrl === url && nowPNum.toString() === pNum.toString() && window.location.pathname.substr(1, 7) !== "bangumi") {
    sessionStorage.setItem("nextTime", tNum.toString());
    useWebPagesVarsFunctions();
  } else {
    window.location.href = url + "?p=" + pNum + "&t=" + tNum;
  }
}

// content scripts 是运行在一个被称为 isolated world 的运行环境里，
// 和页面上的脚本互不干扰，因为不在一个运行环境里，所以也无法调用页面上脚本定义的方法
// 以下方法可以解决
function useWebPagesVarsFunctions() {
  let s = document.createElement('script');
  s.src = chrome.runtime.getURL('webPage.js');
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}
