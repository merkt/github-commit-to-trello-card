/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 426:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 300:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 619:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(619);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nccwpck_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(426);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nccwpck_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(300);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__nccwpck_require__.n(_actions_github__WEBPACK_IMPORTED_MODULE_2__);




const { context = {} } = _actions_github__WEBPACK_IMPORTED_MODULE_2__;
const { pull_request, head_commit } = context.payload;

const trelloCardIdPattern = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-card-id-pattern', { required: false }) || /trello.com\/c\/(.+)\)/g;
const trelloApiKey = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-api-key', { required: true });
const trelloAuthToken = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-auth-token', { required: true });
const trelloBoardId = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-board-id', { required: true });
const trelloCardAction = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-card-action', { required: true });
const trelloListNameCommit = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-list-name-commit', { required: true });
const trelloListNamePullRequestOpen = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-list-name-pr-open', { required: false });
const trelloListNamePullRequestClosed = _actions_core__WEBPACK_IMPORTED_MODULE_1__.getInput('trello-list-name-pr-closed', { required: false });

function getCardNumbers(message) {
  console.log(`getCardNumber(${message})`);
  console.log(`Trello ID match pattern ${trelloCardIdPattern}`)
  let matches = message && message.length > 0 ? Array.from(message.matchAll(trelloCardIdPattern), match => match[1]) : [];
  return matches && matches.length > 0 ? matches : null;
}

function getAllCardNumbers(message, branch) {
  const cardBranch = getCardNumbers(message);
  const cardMessage = getCardNumbers(branch);
  if (cardBranch == null || cardMessage == null) {
    throw new Error("PR title or branch name does not meet the guidelines");
  }
  return new Set([...cardBranch, ...cardMessage]);
}

async function getCard(card) {
  console.log(`getCard(${card})`);
  if (card && card.length > 0) {
    let url = `https://trello.com/1/cards/${card}?fields=shortLink`;
    console.log("Url is ", url);
    return await axios__WEBPACK_IMPORTED_MODULE_0__.get(url, { 
      params: { 
        key: trelloApiKey, 
        token: trelloAuthToken 
      }
    }).then(response => {
      return response.data.id;
    }).catch(error => {
      console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
      return null;
    });
  }

  return null;
}

async function F(board, list) {
  console.log(`getListOnBoard(${board}, ${list})`);
  let url = `https://trello.com/1/boards/${board}/lists`
  return await axios.get(url, { 
    params: { 
      key: trelloApiKey, 
      token: trelloAuthToken 
    }
  }).then(response => {
    let result = response.data.find(l => l.closed == false && l.name == list);
    return result ? result.id : null;
  }).catch(error => {
    console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
    return null;
  });
}

async function addAttachmentToCard(card, link) {
  console.log(`addAttachmentToCard(${card}, ${link})`);
  let url = `https://api.trello.com/1/cards/${card}/attachments`;
  return await axios__WEBPACK_IMPORTED_MODULE_0__.post(url, {
    key: trelloApiKey,
    token: trelloAuthToken, 
    url: link
  }).then(response => {
    return response.status == 200;
  }).catch(error => {
    console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
    return null;
  });
}

async function addCommentToCard(card, user, message, link) {
  console.log(`addCommentToCard(${card}, ${user}, ${message}, ${link})`);
  let url = `https://api.trello.com/1/cards/${card}/actions/comments`;
  return await axios__WEBPACK_IMPORTED_MODULE_0__.post(url, {
    key: trelloApiKey,
    token: trelloAuthToken, 
    text: `${user}: ${message} ${link}`
  }).then(response => {
    return response.status == 200;
  }).catch(error => {
    console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
    return null;
  });
}

async function moveCardToList(board, card, list) {
  console.log(`moveCardToList(${board}, ${card}, ${list})`);
  let listId = await getListOnBoard(board, list);
  if (listId && listId.length > 0) {
    let url = `https://api.trello.com/1/cards/${card}`;
    return await axios__WEBPACK_IMPORTED_MODULE_0__.put(url, {
      key: trelloApiKey,
      token: trelloAuthToken, 
      idList: listId
    }).then(response => {
      return response && response.status == 200;
    }).catch(error => {
      console.error(url, `Error ${error.response.status} ${error.response.statusText}`);
      return null;
    });
  }       
  return null;
}

async function handleHeadCommit(data) {
  console.log("handleHeadCommit", data);
  let url = data.url;
  let message = data.message;
  let user = data.author.name;
  let cardsNumbers = getCardNumbers(message);
  cardsNumbers.forEach(async cardNumber => {
    let card = await getCard(cardNumber);
    if (card && card.length > 0) {
      if (trelloCardAction && trelloCardAction.toLowerCase() == 'attachment') {
        await addAttachmentToCard(card, url);
      }
      else if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
        await addCommentToCard(card, user, message, url);
      }
      if (message.match(regexPullRequest) && trelloListNamePullRequestClosed && trelloListNamePullRequestClosed.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNamePullRequestClosed);
      }
      else if (trelloListNameCommit && trelloListNameCommit.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNameCommit);
      }
    }
  });
}

async function handlePullRequest(data) {
  console.log("handlePullRequest", data);
  let url = data.html_url || data.url;
  let message = data.title;
  let user = data.user.name;
  let branch = data.title;
  let cardsNumbers = getAllCardNumbers(message, branch);
  cardsNumbers.forEach(async cardNumber => {
    let card = await getCard(cardNumber);
    
    if (card && card.length > 0) {
      if (trelloCardAction && trelloCardAction.toLowerCase() == 'attachment') {
        await addAttachmentToCard(card, url);
      }
      else if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
        await addCommentToCard(card, user, message, url);
      }
      if (data.state == "open" && trelloListNamePullRequestOpen && trelloListNamePullRequestOpen.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNamePullRequestOpen);
      }
      else if (data.state == "closed" && trelloListNamePullRequestClosed && trelloListNamePullRequestClosed.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNamePullRequestClosed);
      }
    }
  });
}

async function run() {
  if (head_commit && head_commit.message) {
    handleHeadCommit(head_commit)
  }
  else if (pull_request && pull_request.title) {
    handlePullRequest(pull_request)
  }
};

run()
})();

module.exports = __webpack_exports__;
/******/ })()
;