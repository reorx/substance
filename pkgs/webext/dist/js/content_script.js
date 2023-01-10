/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!********************************!*\
  !*** ./src/content_script.tsx ***!
  \********************************/

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        console.log("Receive color = " + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse("Change color to " + msg.color);
    }
    else {
        sendResponse("Color message is none.");
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudF9zY3JpcHQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQHN1YnN0YW5jZS93ZWJleHQvLi9zcmMvY29udGVudF9zY3JpcHQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChtc2csIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgaWYgKG1zZy5jb2xvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmUgY29sb3IgPSBcIiArIG1zZy5jb2xvcik7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbXNnLmNvbG9yO1xuICAgICAgICBzZW5kUmVzcG9uc2UoXCJDaGFuZ2UgY29sb3IgdG8gXCIgKyBtc2cuY29sb3IpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2VuZFJlc3BvbnNlKFwiQ29sb3IgbWVzc2FnZSBpcyBub25lLlwiKTtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==