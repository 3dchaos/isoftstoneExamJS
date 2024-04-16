// ==UserScript==
// @name         提取题目数据（jQuery版本）
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  提取页面中的题目数据并写入 QuestionSet 类中
// @author       You
// @match        http://*/*
// @match        https://*/*
// @require      http://code.jquery.com/jquery-migrate-1.2.1.min.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	// 创建 QuestionSet 类
	class QuestionSet {
		constructor() {
			this.questions = [];
		}
		// 添加题目方法
		addQuestion(question, allAnswers, correctAnswers, wrongAnswers, yourAnswers) {
			this.questions.push({
				question: question,
				answer: {
					allAnswers: allAnswers,
					correctAnswers: correctAnswers,
					wrongAnswers: wrongAnswers,
					yourAnswers: yourAnswers,
				}
			});
		}
	}

	// 点击按钮时执行的函数
	function extractQuestions() {
		let questionSet = new QuestionSet();
		// 创建 QuestionSet 实例

		questionSet = getPageQuestion(questionSet);
		//数据保存本地
		localStorage.setItem("localquestionSet", JSON.stringify(questionSet));
	}

	function getPageQuestion(questionSet){
		// 遍历页面上所有题目的容器
		$('.answerOne').each(function() {
			// 获取题目字符串
			let questionString = $(this).find('.answerQ div').text().trim();
	
			// 获取所有答案
			let allAnswers = [];
			$(this).find('.itemOne .ABbj_Content').each(function() {
				allAnswers.push($(this).text().trim());
			});
	
			// 初始化你的答案数组
			let yourAnswers = getYourAnswers($(this));
	
			// 获取正确答案
			let correctAnswers = [];
	
			// 添加题目到 QuestionSet 实例中
			questionSet.addQuestion(questionString, allAnswers, correctAnswers, [], yourAnswers);
		});
		// 将 QuestionSet 实例保存在全局变量中，以便在控制台中使用
		panduan(questionSet);
		console.log('题目数据提取完毕，已保存在 questionSet 中。');
		return questionSet;
	}
	
	function getYourAnswers(questionContainer) {
		let yourAnswers = [];
		// 查找每个 .itemOne 元素，检查是否有 .sCircle 或 .sRect 子级
		questionContainer.find('.itemOne').each(function() {
			let hasSCircle = $(this).find('.sCircle').length > 0;
			let hasSRect = $(this).find('.sRect').length > 0;
			if (hasSCircle || hasSRect) {
				let yourAnswerText = $(this).find('.ABbj_Content').text().trim();
				yourAnswers.push(yourAnswerText);
			}
		});
		return yourAnswers;
	}
	
	function panduan(questionSet) {
		// 初始化计数器
		let arrdaan = [];
		// 遍历页面上所有的 .topicCircleA 元素
		$('.topicCircleA').each(function(index) {
			arrdaan = questionSet.questions[index].answer
			if ($(this).hasClass('active1')) {
				// 如果类中包含 active1
				arrdaan.correctAnswers = arrdaan.correctAnswers.concat(arrdaan.yourAnswers);
				arrdaan.correctAnswers= Array.from(new Set(arrdaan.correctAnswers));//去重
			} else if ($(this).hasClass('active2')) {
				// 如果类中包含 active2
                arrdaan.wrongAnswers = arrdaan.wrongAnswers.concat(arrdaan.yourAnswers);
				arrdaan.wrongAnswers= Array.from(new Set(arrdaan.wrongAnswers));//去重
			}
		});
	}



	function compquestion(questionSetOld,questionSet2) {
	// 大遍历传递的问题集
	$.each(questionSetOld.questions, function(indexOld, questionsOld) {
		// 小遍历页面问题集
		$.each(questionSet2.questions, function(index,questions2) {
			if (questionsOld.question === questions2.question){
				const ac = questionSetOld.questions[indexOld].answer.correctAnswers
				const aw = questionSetOld.questions[indexOld].answer.wrongAnswers
				const bc = questions2.answer.correctAnswers
				const bw = questions2.answer.wrongAnswers
				var bc1 = ac.concat(bc) //只能赋予新值,不能修老数组
				var bc1 = Array.from(new Set(bc1));//去重
				var bw1 = aw.concat(bw)
				var bw1 = Array.from(new Set(bw1));//去重
				questionSet2.questions[index].answer.correctAnswers = bc1
				questionSet2.questions[index].answer.wrongAnswers= bw1
				console.log("跨页题目匹配成功")
			}
		})
	});
	return questionSet2
	}


	function _tebupdate() {
		var questionSet2 = new QuestionSet();
		// 创建 QuestionSet 实例
		questionSet2 = getPageQuestion(questionSet2);

		// 在另一个标签页的油猴脚本中
		var questionSetring = localStorage.getItem("localquestionSet");
		// 确保对象存在
		var questionSetOld;
		if (questionSetring) {
		questionSetOld = JSON.parse(questionSetring);
		console.log("跨标签成功");
		} else {
		console.log("对象不存在");}
		// 对比两个对象
		questionSet2 = compquestion(questionSetOld,questionSet2)
		// 将 QuestionSet 实例保存在全局变量中，以便在控制台中使用
		window.questionSet2 = questionSet2;
		//数据保存本地
		localStorage.setItem("localquestionSet", JSON.stringify(questionSet2));
		}


	function _auto() {
		var questionSetring = localStorage.getItem("localquestionSet");	
		var questionSet;
		if (questionSetring) {
		questionSet = JSON.parse(questionSetring);
		console.log("跨标签成功");
		} else {
		console.log("对象不存在");}
		//获取问题
		var questionString = $('.questionContent p').text().trim();
		if (questionString) {
			console.log("题目是:"+questionString);
			var questionIndex = -1; // 初始化索引为-1，表示未找到
			// 遍历questionSet.questions数组
			$.each(questionSet.questions, function(a, question) {
				// 判断当前问题是否与questionString匹配
				if (question.question === questionString) {
					// 如果匹配成功，将索引a赋值给questionIndex，并结束循环
					questionIndex = a;
					var daan = autoAnswer (questionSet.questions[questionIndex].answer)
					console.log("推荐的答案是:"+daan);
					// 页面答案开始匹配
					$(".selectGroup label").each(function(index, element) {
						var answerContentText = $(element).find(".answerContent p").text();
						if (answerContentText === daan[0] ){
							$(".selectGroup label")[index].click();
							console.log("自动选中了:"+answerContentText);
						}
					});


					return false; // 退出循环
				}
			});
			} else {
			console.log("没有找到题目");}
		}
	function autoAnswer (answer) {
		if (answer.correctAnswers.length > 0) {
			return answer.correctAnswers;
		} else if (answer.wrongAnswers.length > 0) {


			// 使用 jQuery 的 each() 方法遍历 wrongAnswers 数组
			$.each(answer.wrongAnswers, function(index, value) {
				// 使用 jQuery 的 inArray() 方法检查 value 是否存在于 allAnswers 数组中
				var index = $.inArray(value, answer.allAnswers);
				// 如果存在，则使用 splice() 方法将其从 allAnswers 数组中移除
				if (index !== -1) {
					answer.allAnswers.splice(index, 1);
				}
			});
			return answer.allAnswers;


		} else {
			return answer.allAnswers;
		}
	}

	// 创建一个按钮
	const button = $('<button>重新创建题目</button>').css({
		position: 'fixed',
		top: '10px',
		right: '10px',
		zIndex: '9999'
	}).click(extractQuestions);
	// const panduanbut = $('<button>提取页面答案</button>').css({
	// 	position: 'fixed',
	// 	top: '50px',
	// 	right: '10px',
	// 	zIndex: '9999'
	// }).click(_update);
	const tebupdate = $('<button>跨标签更新</button>').css({
		position: 'fixed',
		top: '90px',
		right: '10px',
		zIndex: '9999'
	}).click(_tebupdate);
	const auto = $('<button>建议答案</button>').css({
		position: 'fixed',
		top: '130px',
		right: '10px',
		zIndex: '9999'
	}).click(_auto);

	// 将按钮添加到页面上
	$('body').append(button,tebupdate,auto);
})();