import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const { context = {} } = github;
const { pull_request, head_commit } = context.payload;

const trelloCardIdPattern = core.getInput('trello-card-id-pattern', { required: false }) || /trello.com\/c\/([\w\d]+)/g;
const trelloApiKey = core.getInput('trello-api-key', { required: true });
const trelloAuthToken = core.getInput('trello-auth-token', { required: true });
const trelloBoardId = core.getInput('trello-board-id', { required: true });
const trelloCardAction = core.getInput('trello-card-action', { required: true });
const trelloListNameCommit = core.getInput('trello-list-name-commit', { required: false });
const trelloListNamePullRequestOpen = core.getInput('trello-list-name-pr-open', { required: false });
const trelloListNamePullRequestClosed = core.getInput('trello-list-name-pr-closed', { required: false });

function getCardNumbers(message) {
  console.log(`getCardNumber('${message}')`);
  console.log(`Trello ID match pattern "${trelloCardIdPattern}"`)
  let matches = message && message.length > 0 ? Array.from(message.matchAll(trelloCardIdPattern), match => match[1]) : [];
  return matches && matches.length > 0 ? [...new Set(matches)] : null;
}

function getAllCardNumbers(message, branch) {
  const cardBranch = getCardNumbers(message);
  const cardMessage = getCardNumbers(branch);
  if (cardBranch == null || cardMessage == null) {
    console.log("PR title or branch name does not meet the guidelines");
    return new Set();
  }
  return new Set([...cardBranch, ...cardMessage]);
}

async function getCard(card) {
  console.log(`getCard(${card})`);
  if (card && card.length > 0) {
    let url = `https://trello.com/1/cards/${card}?fields=shortLink`;
    console.log("Url is ", url);
    return await axios.get(url, { 
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

async function getListOnBoard(board, list) {
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
  return await axios.post(url, {
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
  return await axios.post(url, {
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
    return await axios.put(url, {
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
  let cardNumbers = getCardNumbers(message);

  if (!cardNumbers) {
    return;
  }

  cardNumbers.forEach(async cardNumber => {
    let card = await getCard(cardNumber);
    if (card && card.length > 0) {
      if (trelloCardAction && trelloCardAction.toLowerCase() == 'attachment') {
        await addAttachmentToCard(card, url);
      }
      else if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
        await addCommentToCard(card, user, message, url);
      }
      if (trelloListNamePullRequestClosed && trelloListNamePullRequestClosed.length > 0) {
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