const startBtnContainer = document.querySelector(".start_btn");
const createQuizBtn = document.querySelector("#create_quiz_button");
const createQuizBtnContainer = createQuizBtn.parentElement;
const quizEditorContainer = document.querySelector("#quiz_editor");
const backToQuizButton = document.querySelector("#back_to_quiz_button");
const downloadQuizButton = document.querySelector("#download_quiz_button");

// Helper function for animation easing.
function easeInOutSine(x)
{
    return -(Math.cos(3.14159 * x) - 1) / 2;
}

// Quiz editor class.
class QuizEditor
{
    constructor(questions)
    {
        this.questions = questions;
    }

    // Creates the corresponding number of question containers.
    fillQuestionList()
    {
        this.questions.forEach(question => {
            var questionContainer = document.querySelector("#que_num_1");
            if (question["numb"] > 1)
            {
                questionContainer = questionContainer.cloneNode(true);
                questionContainer.id = "que_num_" + question["numb"];
            }

            questionContainer.children[0].innerHTML =
                "Otázka: " + question["question"];
            quizEditorContainer.
                insertBefore(questionContainer, backToQuizButton);

            this.fillForm(
                document.querySelector("#" + questionContainer.id + " form"),
                question);
        });
    }

    // Assigns corresponding values to the form inputs.
    fillForm(formContainer, question)
    {
        var formInputs =
            Array.from(formContainer.children).filter(x => x.tagName == "INPUT");

        // Title
        formInputs[0].value = question["question"];

        // Options
        for (var i = 0; i < 4; i++)
            formInputs[i + 1].value = question["options"][i];

        // Answer
        var ansIndex =
            question["options"].findIndex(x => x == question["answer"]) + 1;
        formInputs[5].value = ansIndex;

        // Save Button
        var saveButton = formContainer.lastElementChild;
        saveButton.setAttribute("question-num", question["numb"]);
    }

    // Saves the edited question.
    saveQuestion(clickedButton)
    {
        var formContainer = clickedButton.parentElement;
        var formInputs =
            Array.from(formContainer.children).filter(x => x.tagName == "INPUT");

        // Index in the questions array.
        var index = parseInt(clickedButton.getAttribute("question-num")) - 1;

        // Question Title
        var title = formInputs[0].value;

        // Possible answers.
        var options = [
            formInputs[1].value,
            formInputs[2].value,
            formInputs[3].value,
            formInputs[4].value
        ];

        // Number of right answer.
        var answer = options[parseInt(formInputs[5].value) - 1];

        // Anti-Troll Safeguard.
        if (answer < 1)
            answer = 1;
        if (answer > 4)
            answer = 4;

        var prevTitle = this.questions[index]["question"];
        this.questions[index] = {
            "numb": index + 1,
            "question": title,
            "answer": answer,
            "options": options
        };

        questions = this.questions;
        if (title != prevTitle)
        {
            this.refreshQuestionTitle(
                formContainer.parentElement.parentElement,
                "Otázka: " + title
            );
        }
    }

    async refreshQuestionTitle(questionContainer, newTitle)
    {
        var title = questionContainer.firstElementChild;
        title.style.opacity = 0;
        await new Promise(x => setTimeout(x, 400));
        title.innerHTML = newTitle;
        title.style.opacity = 1;
    }
}


async function ShowQuizEditor()
{
    quizEditorContainer.style.display = "flex";
    backToQuizButton.style.display = "block";
    downloadQuizButton.style.display = "block";

    await new Promise(x => setTimeout(x, 10));

    startBtnContainer.style.opacity = 0;
    createQuizBtnContainer.style.opacity = 0;
    quizEditorContainer.classList.toggle("visible");
}

async function HideQuizEditor()
{
    startBtnContainer.style.opacity = 1;
    createQuizBtnContainer.style.opacity = 1;
    quizEditorContainer.classList.toggle("visible");
    window.scrollTo(0, 0);

    await new Promise(x => setTimeout(x, 400));

    quizEditorContainer.style.display = "none";
    backToQuizButton.style.display = "none";
    downloadQuizButton.style.display = "none";
}

function AddFormIconListeners()
{
    var formAccordionIcons = document.querySelectorAll('.form_open_icon');
    formAccordionIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            this.classList.toggle("active");

            var formContainer = this.previousElementSibling;
            if (formContainer.style.maxHeight)
            {
                formContainer.style.maxHeight = null;
                formContainer.style.marginTop = null;
            }
            else
            {
                formContainer.style.maxHeight = formContainer.scrollHeight + 'px';
                formContainer.style.marginTop = "1em";
            }

        }, false);
    });
}

function AddSaveButtonListeners(quizEditor)
{
    var saveButtons = document.querySelectorAll(".save_button");
    saveButtons.forEach(button => {
        button.addEventListener("click", function() {
            quizEditor.saveQuestion(this);
        })
    });
}

function ReadFilesList(fileName)
{
    var reader = new FileReader();
    reader.onload = function(progressEvent)
    {
        var lines = this.result.split("\n");
    }
    reader.readAsText(fileName);

    return lines;
}

createQuizBtn.onclick = () =>
{
    var quizEditor = new QuizEditor(questions);
    if (document.querySelectorAll(".question_form_container").length <= 1)
    {
        quizEditor.fillQuestionList();
        AddFormIconListeners();
        AddSaveButtonListeners(quizEditor);
    }
    ShowQuizEditor();
}

backToQuizButton.onclick = () =>
{
    HideQuizEditor();
}

downloadQuizButton.onclick = () =>
{
    var data = new FormData();
    var jsonString = JSON.stringify(questions);
    data.append('json', jsonString);

    var request = new XMLHttpRequest();
    request.open("POST", "../save_quiz.php", false);
    request.onload = function() {
        console.log(this.response);
    }
    request.send(data);

    var pathArray = window.location.pathname.split('/');
    console.log(pathArray[0] + "/site.zip");
    window.location.href = pathArray[0] + "/site.zip";
}