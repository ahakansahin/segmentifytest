document.addEventListener("DOMContentLoaded", function () {
    const questions = document.querySelector('.questions');
    const results = document.querySelector('.results');
    const subTitle = document.querySelector(".sub-title");
    const questionText = document.querySelector(".question__text");
    const questionOptions = document.querySelector(".question__options")
    const options = document.querySelectorAll(".question__options .item");
    const bottomButtonBack = document.querySelector('.button-back');
    const bottomButtonNext = document.querySelector('.button-next');
    const middleButtonBack = document.querySelector('.back-button');
    const middleButtonNext = document.querySelector('.next-button');
    const questionStepCounter = document.querySelector('.questions .step-counter');
    const productsStepCounter = document.querySelector('.results .step-counter');
    const productImage = document.querySelector('.product-image img');
    const productName = document.querySelector('.product-name');
    const productOldPrice = document.querySelector('.product-old-price-number');
    const productNewPrice = document.querySelector('.product-new-price-number');
    const productCurrencies = document.querySelectorAll('.product-currency');

    let stepNo = 0;
    let selectedAnswersTexts = [];
    let selectedAnswersIndexNo = [];
    let selectedCategoryNo;
    let selectedSteps;
    let filteredResult;
    let filteredResultProductIndex = 0;

    fetch('questions.json')
        .then(response => response.json())
        .then(questionsData => {

            function addClickEventToChild(child, index) {
                child.addEventListener("click", function () {
                    if (!child.classList.contains("selected")) {
                        Array.from(questionOptions.children).forEach((item, ind) => {
                            if (selectedAnswersIndexNo[stepNo] != null && selectedAnswersIndexNo[stepNo] == ind) {
                                item.classList.remove("selected");
                            }
                        })
                        if (stepNo == 0) selectedCategoryNo = index;
                        child.classList.add("selected")

                        selectedAnswersTexts[stepNo] = child.textContent;
                        console.log(selectedAnswersTexts)
                        selectedAnswersIndexNo[stepNo] = index;
                        bottomButtonNext.classList.remove('not-selectable');
                    }


                });
            }

            options.forEach((option, index) => {
                addClickEventToChild(option, index);
            });


            bottomButtonNext.addEventListener("click", function () {
                nextQuestion();
            });
            bottomButtonBack.addEventListener("click", function () {
                backQuestion();
            });
            middleButtonNext.addEventListener("click", function () {
                nextProduct();
            });
            middleButtonBack.addEventListener("click", function () {
                backProduct();
            });

            function nextQuestion() {
                stepNo++;
                if (!bottomButtonNext.classList.contains("not-selectable")) bottomButtonNext.classList.add("not-selectable");
                if (bottomButtonBack.classList.contains("not-selectable")) bottomButtonBack.classList.remove("not-selectable");

                if (stepNo == 3) {
                    questions.classList.add('hide');
                    results.classList.remove('hide');
                    results.classList.add('loading');
                    handleResults();
                    return
                }

                newQuestion();
                stepCounterForQuestion(stepNo);


            }

            function backQuestion() {
                stepNo--;
                if (bottomButtonNext.classList.contains("not-selectable")) bottomButtonNext.classList.remove("not-selectable");
                if (!bottomButtonBack.classList.contains("not-selectable") && stepNo == 0) bottomButtonBack.classList.add("not-selectable");

                oldQuestion();
                stepCounterForQuestion(stepNo);

            }

            function newQuestion() {
                selectedSteps = questionsData[selectedCategoryNo].steps;
                let selectedStep = selectedSteps[stepNo];
                subTitle.innerText = selectedStep.subtitle;
                questionText.innerText = selectedStep.title;

                questionOptions.classList.forEach(classItem => {
                    if (classItem.includes("custom")) questionOptions.classList.remove(classItem);
                })

                questionOptions.classList.add(`custom-${selectedStep.type}`);

                questionOptions.innerHTML = "";
                selectedStep.answers.forEach((opt, index) => {
                    //I write like that to prevent some security issues
                    let element = `<div class="item custom-${selectedStep.type}"></div>`;
                    questionOptions.insertAdjacentHTML("beforeend", element);
                    if (selectedStep.type == "color") {
                        questionOptions.lastElementChild.style.backgroundColor = opt;
                        questionOptions.lastElementChild.innerText = opt;
                    } else if (selectedStep.type == "price") {
                        questionOptions.lastElementChild.innerText = `€ ${opt}`;
                    } else {
                        questionOptions.lastElementChild.innerText = opt;
                    }
                    addClickEventToChild(questionOptions.lastElementChild, index);
                });





            }

            function oldQuestion() {
                selectedSteps = questionsData[selectedCategoryNo].steps;
                let selectedStep = selectedSteps[stepNo];
                subTitle.innerText = selectedStep.subtitle;
                questionText.innerText = selectedStep.title;
                questionOptions.classList.forEach(classItem => {
                    if (classItem.includes("custom")) questionOptions.classList.remove(classItem);
                })

                questionOptions.classList.add(`custom-${selectedStep.type}`);

                questionOptions.innerHTML = "";
                selectedStep.answers.forEach((opt, index) => {
                    //I write like that to prevent some security issues
                    let element;
                    if (selectedAnswersIndexNo[stepNo] == index) {
                        element = `<div class="item custom-${selectedStep.type} selected"></div>`;
                    } else {
                        element = `<div class="item custom-${selectedStep.type}"></div>`;
                    }
                    questionOptions.insertAdjacentHTML("beforeend", element);
                    if (selectedStep.type == "color") {
                        questionOptions.lastElementChild.style.backgroundColor = opt;
                        questionOptions.lastElementChild.innerText = opt;
                    } else if (selectedStep.type == "price") {
                        questionOptions.lastElementChild.innerText = `€ ${opt}`;
                    } else {
                        questionOptions.lastElementChild.innerText = opt;
                    }
                    addClickEventToChild(questionOptions.lastElementChild, index);
                });
            }

            function handleResults() {
                let priceAnswer = selectedAnswersTexts[2].replace(/\€/g, "");
                let priceArray = [];
                let lowPrice = 0;
                let highPrice = 99999999999;
                if (priceAnswer.includes("+")) {
                    priceArray = priceAnswer.split("+");
                    highPrice = priceArray[0];
                } else {
                    priceArray = priceAnswer.split("-");
                    lowPrice = priceArray[0];
                    highPrice = priceArray[1];

                }
                fetch('products.json')
                    .then(response => response.json())
                    .then(productsData => {

                        var clearCategory = `${selectedAnswersTexts[0].trim()}`;
                        var clearColor = `${selectedAnswersTexts[1].trim().toLowerCase()}`;
                        filteredResult = productsData.filter(function (obj) {
                            var hasCategory = obj.category[0].includes(clearCategory);
                            var hasColor = obj.colors.includes(clearColor);
                            var hasPriceLow = obj.price > lowPrice;
                            var hasPriceHigh = obj.price < highPrice;
                            return hasCategory && hasColor && hasPriceLow && hasPriceHigh;
                        });

                        results.classList.remove('loading');

                        if (filteredResult.length > 0) {
                            getProduct();

                            for(let i=0; i<filteredResult.length; i++){
                                var elm = `<div class="step"></div>`;
                                productsStepCounter.insertAdjacentHTML("beforeend", elm);
                            }
                            
                            productsStepCounter.firstElementChild.classList.add('activated');

                        } else {
                            results.innerHTML = "No Product Found";
                            results.classList.add('no-product')
                        }

                    })
            }

            function nextProduct() {
                
                filteredResultProductIndex++;
                if (middleButtonBack.classList.contains("not-selectable")) middleButtonBack.classList.remove("not-selectable");

                if (filteredResultProductIndex == filteredResult.length-1) {
                    if (!middleButtonNext.classList.contains("not-selectable")) middleButtonNext.classList.add("not-selectable");
                }

                stepCounterForProduct(filteredResultProductIndex);
                getProduct();

            }

            function backProduct() {
                filteredResultProductIndex--;
                if (middleButtonNext.classList.contains("not-selectable")) middleButtonNext.classList.remove("not-selectable");

                if (filteredResultProductIndex == 0) {
                    if (!middleButtonBack.classList.contains("not-selectable")) middleButtonBack.classList.add("not-selectable");
                }

                stepCounterForProduct(filteredResultProductIndex);
                getProduct();

            }

            function getProduct() {
                productImage.src = filteredResult[filteredResultProductIndex].image;
                productName.innerText = filteredResult[filteredResultProductIndex].name;

                productCurrencies.forEach(currency => {
                    currency.innerText = filteredResult[filteredResultProductIndex].currency;
                });

                productOldPrice.innerText = filteredResult[filteredResultProductIndex].oldPrice;
                productNewPrice.innerText = filteredResult[filteredResultProductIndex].price;
            }

            function stepCounterForQuestion(stp) {
                for (let i = 0; i <= 2; i++) {
                    if (questionStepCounter.children[i].classList.contains('activated')) {
                        questionStepCounter.children[i].classList.remove('activated')
                    }
                }
                for (let i = 0; i <= stp; i++) {
                    if (!questionStepCounter.children[i].classList.contains('activated')) {
                        questionStepCounter.children[i].classList.add('activated')
                    }
                }

            }
            function stepCounterForProduct(ind) {
                for (let i = 0; i < filteredResult.length; i++) {
                    if (productsStepCounter.children[i].classList.contains('activated')) {
                        productsStepCounter.children[i].classList.remove('activated')
                    }
                }
                for (let i = 0; i <= ind; i++) {
                    if (!productsStepCounter.children[i].classList.contains('activated')) {
                        productsStepCounter.children[i].classList.add('activated')
                    }
                }

            }

        });







});







