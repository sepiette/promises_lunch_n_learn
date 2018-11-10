"use strict";

function createResolvedPromise(numSecs) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve({ message: "resolved after " + numSecs + " seconds." });
    }, numSecs * 1000);
  });
}

function createRejectedPromise(numSecs) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject({ message: "rejected after " + numSecs + " seconds." });
    }, numSecs * 1000);
  });
}

//Timer stuff
function startTimer(sec, numSecs) {
  setTimeout(function () {
    document.getElementById('timeCapsule').textContent = sec + " sec.";
    sec++;
    if (sec <= numSecs) startTimer(sec, numSecs);
  }, 1000);
}

function resetTimer() {
  document.getElementById('timeCapsule').textContent = "0 sec.";
}
/****************************** BASIC PROMISES *********************************************************** */
function handleArrayResolve(values) {
  values.forEach(function (value) {
    var listItem = document.createElement('li');
    var text = document.createTextNode(value.message);
    listItem.className = 'list-item-good';
    listItem.appendChild(text);

    document.getElementById('all-promise-results').appendChild(listItem);
  });
}

function handleObjectResolve(value) {
  var listItem = document.createElement('li');
  var text = document.createTextNode(value.message);
  listItem.className = 'list-item-good';
  listItem.appendChild(text);

  document.getElementById('all-promise-results').appendChild(listItem);
}

function handleReject(reason) {
  var listItem = document.createElement('li');
  var text = document.createTextNode(reason.message);
  listItem.className = 'list-item-bad';
  listItem.appendChild(text);
  document.getElementById('all-promise-results').appendChild(listItem);
}

/** Expect resolve once all promises finish */
function runAllWithResolved() {
  startTimer(1, 4);

  var promiseArr = [];

  promiseArr.push(createResolvedPromise(1));
  promiseArr.push(createResolvedPromise(4));
  promiseArr.push(createResolvedPromise(2));

  var handleAllPromises = Promise.all(promiseArr);
  handleAllPromises.then(handleArrayResolve, handleReject);
}

/** Expect Failure after 4 seconds */
function runAllWithReject() {
  startTimer(1, 4);
  var promiseArr = [];

  promiseArr.push(createResolvedPromise(1));
  promiseArr.push(createResolvedPromise(4));
  promiseArr.push(createRejectedPromise(2));

  var handleAllPromises = Promise.all(promiseArr);
  handleAllPromises.then(handleArrayResolve, handleReject);
}
/**
 * Expect first promise that resolves to be the only value
 */
function runRaceWithResolve() {
  startTimer(1, 4);
  var promiseArr = [];

  promiseArr.push(createResolvedPromise(3));
  promiseArr.push(createResolvedPromise(4));
  promiseArr.push(createResolvedPromise(2));

  var handleAllPromises = Promise.race(promiseArr);
  handleAllPromises.then(handleObjectResolve, handleReject);
}

/**
 * Expect rejection to be caught first
 */
function runRaceWithReject() {
  startTimer(1, 4);
  var promiseArr = [];

  promiseArr.push(createResolvedPromise(3));
  promiseArr.push(createResolvedPromise(4));
  promiseArr.push(createRejectedPromise(1));

  var handleAllPromises = Promise.race(promiseArr);
  handleAllPromises.then(handleObjectResolve, handleReject);
}

/**
 * Expect promise to resolve with promise of 2 seconds
 */
function runRaceWithRejectAndResolve() {
  startTimer(1, 4);
  var promiseArr = [];

  promiseArr.push(createRejectedPromise(3));
  promiseArr.push(createResolvedPromise(2));
  promiseArr.push(createResolvedPromise(4));

  var handleAllPromises = Promise.race(promiseArr);
  handleAllPromises.then(handleObjectResolve, handleReject);
}

/** EVENT LISTENERS */
var buttons = document.getElementsByTagName('button');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', resetTimer);
}
document.getElementById('promise-all-success-runner').addEventListener('click', runAllWithResolved);
document.getElementById('promise-all-fail-runner').addEventListener('click', runAllWithReject);
document.getElementById('promise-race-success-runner').addEventListener('click', runRaceWithResolve);
document.getElementById('promise-race-fail-runner').addEventListener('click', runRaceWithReject);
document.getElementById('promise-race-success-mixed-runner').addEventListener('click', runRaceWithRejectAndResolve);

/************************* ASYNC / AWAIT ******************************************************* */
/** count to 2 dependent on value of first promise */
function appendListItem(val) {
  var listItem = document.createElement('li');
  var text = document.createTextNode(val.message + " - Value: " + val.value);
  listItem.className = 'list-item';
  listItem.appendChild(text);
  document.getElementById('all-promise-results').appendChild(listItem);
}

function callBackHell() {
  startTimer(1, 2);

  return new Promise(function (resolve, reject) {
    resolve({ value: 1, message: "Promise 1" });
  }).then(function (data) {
    appendListItem(data);
    return new Promise(function (resolve, reject) {
      resolve({ value: data.value + 1, message: "Promise 2" });
    }).then(function (data) {
      appendListItem(data);
    });
  });
}

/** use Async/Await to count to 2 */

async function add1(val) {
  var sum = val + 1;
  var message = "Promise " + sum;
  var obj = { value: sum, message: message };
  return obj;
}

async function countToTwo() {
  var val1 = await add1(0);
  appendListItem(val1);
  var val2 = await add1(val1.value);
  appendListItem(val2);
}

/** Async Errors */
async function throwError() {
  throw { message: "YOU DIDN'T HANDLE ME" };
}

/** function explicitly handles error thrown by promise */
function handleWithPromise() {
  return new Promise(function (resolve, reject) {
    throw { message: "A Handled Error" };
  }).catch(function (e) {
    var listItem = document.createElement('li');
    var text = document.createTextNode(e.message);
    listItem.className = 'list-item-good';
    listItem.appendChild(text);
    document.getElementById('all-promise-results').appendChild(listItem);
  });
}

/** function incorrectly handles error */
async function functionFailsToCatch() {
  var data = await throwError();
  //None of this will run
  var listItem = document.createElement('li');
  var text = document.createTextNode("" + data);
  listItem.className = 'list-item-good';
  listItem.appendChild(text);
  document.getElementById('all-promise-results').appendChild(listItem);
}

/** Function properly handles thrown error */
async function functionCatchesError() {
  try {
    await throwError();
  } catch (e) {
    // var listItem = document.createElement('li');
    // var text = document.createTextNode(`I was properly handled`);
    // listItem.className = 'list-item-good';
    // listItem.appendChild(text);
    // document.getElementById('all-promise-results').appendChild(listItem);
  }
  var listItem = document.createElement('li');
  var text = document.createTextNode("I was properly handled");
  listItem.className = 'list-item-good';
  listItem.appendChild(text);
  document.getElementById('all-promise-results').appendChild(listItem);
}

/** mixin of both promise and async/await syntax */
async function functionCatchesErrorMixin() {
  var data = await throwError().catch(function (e) {
    var listItem = document.createElement('li');
    var text = document.createTextNode("I was properly handled with a mixed promise and async/await syntax!");
    listItem.className = 'list-item-good';
    listItem.appendChild(text);
    document.getElementById('all-promise-results').appendChild(listItem);
  });
}

document.getElementById('promise-callback-hell').addEventListener('click', callBackHell);
document.getElementById('async-count2').addEventListener('click', countToTwo);
document.getElementById('promise-error').addEventListener('click', handleWithPromise);
document.getElementById('async-error').addEventListener('click', functionFailsToCatch);
document.getElementById('async-handled-error').addEventListener('click', functionCatchesError);
document.getElementById('async-handled-mixin').addEventListener('click', functionCatchesErrorMixin);
