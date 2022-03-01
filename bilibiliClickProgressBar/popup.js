console.log("load!");

let ls = document.getElementById("list");

ls.onclick = function (e) {
  e = e || window.event;
  let url, pNum, tNum;
  if(e.target.parentNode.className === "close") {
    url = e.target.parentNode.parentNode.getElementsByClassName("url")[0].innerHTML;
    pNum = e.target.parentNode.parentNode.getElementsByClassName("pNum")[0].innerHTML;
    tNum = e.target.parentNode.parentNode.getElementsByClassName("tNum")[0].innerHTML;
    console.log(url + " " + pNum + " " + tNum);
  }
  if(e.target.className === "tag") {
    url = e.target.getElementsByClassName("url")[0].innerHTML;
    pNum = e.target.getElementsByClassName("pNum")[0].innerHTML;
    tNum = e.target.getElementsByClassName("tNum")[0].innerHTML;
  }
  else if(e.target.className === "pNum" ||
      e.target.className === "tNum" ||
      e.target.className === "title" ||
      e.target.className === "close") {
    url = e.target.parentNode.getElementsByClassName("url")[0].innerHTML;
    pNum = e.target.parentNode.getElementsByClassName("pNum")[0].innerHTML;
    tNum = e.target.parentNode.getElementsByClassName("tNum")[0].innerHTML;
  }

  if(e.target.parentNode.className === "close" || e.target.className === "close") {
    chrome.storage.sync.get(['timeTagList'], function(result) {

      if(result !== undefined && result.timeTagList !== undefined) {
        for (let i = 0; i < result.timeTagList.length; i++) {
          if(result.timeTagList[i].url === url &&
              result.timeTagList[i].pNum.toString() === pNum &&
              result.timeTagList[i].tNum.toString() === hms2s(tNum).toString()) {
            result.timeTagList.splice(i, 1);
            break;
          }
        }
        chrome.storage.sync.set({"timeTagList": result.timeTagList}, function () {
          console.log("Remove Storage finished!");
          if(e.target.parentNode.className === "close") e.target.parentNode.parentNode.remove();
          else e.target.parentNode.remove();
        })
      }

    });
  } else {
    callContentScript({url, pNum, tNum: hms2s(tNum), info: "popup: jump"}, function (res) {
      console.log(res);
    })
  }

}

chrome.storage.sync.get(['timeTagList'], function(result) {

  if(result !== undefined && result.timeTagList !== undefined) {

    for(let i = 0; i < result.timeTagList.length; ++i) {
      let li = document.createElement("li");
      li.setAttribute("class", "tag");

      let stdTNum = s2hms(result.timeTagList[i].tNum);

      liAppendSpan(li, "url", result.timeTagList[i].url);
      liAppendSpan(li, "title", result.timeTagList[i].title);
      liAppendSpan(li, "pNum", result.timeTagList[i].pNum);
      liAppendSpan(li, "tNum", stdTNum);
      liAppendSpan(li, "close", '<img src="close.svg"/>');

      ls.appendChild(li);
    }
  }

  console.log("Caught you! timeTag.")
});

function liAppendSpan(li, name, value) {
  let span = document.createElement("span");
  span.setAttribute("class", name);
  if(name === "url") span.style.display = "none";
  span.innerHTML = value;
  li.appendChild(span);
}

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

//function: second to hh:mm:ss
function s2hms(ss) {
  let s = parseInt(ss);
  let hour = 0;
  let min = 0;
  let result;
  if(s >= 3600) {
    hour = Math.floor(s / 3600);
    min = Math.floor((s - hour * 3600) / 60);
    s = (s - hour * 3600) % 60;
    result = `${hour.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }else if (s < 3600 && s >= 60) {
    min = Math.floor(s / 60);
    s = s % 60;
    result = `${min.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }else {
    result = `${min.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }
  return result;
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
