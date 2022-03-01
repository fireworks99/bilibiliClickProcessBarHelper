// parseInt("123") is necessary. If not, then the bug is coming.
window.player.seek(parseInt(sessionStorage.getItem("nextTime")));
