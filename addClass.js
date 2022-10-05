let newClass = document.getElementById("newClass");
let errorText = document.getElementById("errorText");

function addNewClass() {
    classStrings = newClass.value.split("\n");

    if (classStrings.length >= 16) {
        //If the formatting for copy/paste is correct

        errorText.innerHTML = "";

        classList.push(new Class(classStrings));
    } else {
        //There must be at least 16 lines to match the proper formatting
        addClassError();
    }
}

function addClassError() {
    errorText.innerHTML = "Error: formatting not recognized";
}