// ==UserScript==
// @name         Extract Questions and Answers
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract questions and answers from the page and display them in a panel when "Search" or "获取列表" buttons are clicked. Share the list across tabs.
// @author       Your name
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function extractQuestionsAndAnswers() {
        let questionDivs = document.querySelectorAll('.answerOne');

        let questionAnswerList = [];

        questionDivs.forEach(questionDiv => {
            let question = questionDiv.querySelector('.answerQ div');
            let answerDiv = questionDiv.querySelector('.singleExplain');

            let questionText = question.textContent.trim();
            let correctAnswer = answerDiv.querySelector('.right').textContent.trim().replace('正确答案：', '');

            let answerOption = correctAnswer.charCodeAt(0) - 65; // Convert A, B, C, D to 0, 1, 2, 3
            let selectedAnswer = questionDiv.querySelector(`.itemOne:nth-child(${answerOption + 1}) .el-main`).textContent.trim();

            questionAnswerList.push(`${questionText} 对应答案:${selectedAnswer}`);
        });

        return questionAnswerList;
    }

    function createPanel() {
        let panel = document.createElement('div');
        panel.id = 'questionAnswerPanel';
        panel.style.position = 'fixed';
        panel.style.top = '50px';
        panel.style.right = '10px';
        panel.style.width = '300px';
        panel.style.height = '400px';
        panel.style.overflowY = 'scroll';
        panel.style.border = '1px solid #ccc';
        panel.style.backgroundColor = '#f9f9f9';
        panel.style.padding = '10px';
        panel.style.zIndex = '9999';

        let searchButton = document.createElement('button');
        searchButton.textContent = '搜索';
        searchButton.style.marginBottom = '10px';
        searchButton.onclick = function() {
            let questionAnswerList = extractQuestionsAndAnswers();
            localStorage.setItem('sharedQuestionAnswerList', JSON.stringify(questionAnswerList)); // Store the list in localStorage
            displayListFromStorage();
        };

        let getListButton = document.createElement('button');
        getListButton.textContent = '获取列表';
        getListButton.style.marginBottom = '10px';
        getListButton.onclick = function() {
            displayListFromStorage(); // Display the list from localStorage without re-extracting
        };

        panel.appendChild(searchButton);
        panel.appendChild(getListButton);
        document.body.appendChild(panel);

        function displayListFromStorage() {
            let storedList = localStorage.getItem('sharedQuestionAnswerList');
            if (storedList) {
                let questionAnswerList = JSON.parse(storedList);
                let listContainer = document.createElement('ul');
                questionAnswerList.forEach(item => {
                    let listItem = document.createElement('li');
                    listItem.textContent = item;
                    listContainer.appendChild(listItem);
                });
                panel.innerHTML = ''; // Clear previous content before appending the new list
                panel.appendChild(listContainer);
            } else {
                console.log('No shared question-answer list found in localStorage.');
            }
        }
    }

    createPanel();
})();