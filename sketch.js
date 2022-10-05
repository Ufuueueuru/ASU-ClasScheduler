let canvas;

let shelfScroll = 0;
let shelfHeight = 80;
let shelfWidth = 0;

let calendar;
let numDays = 5;
let startDay = 1;

function setup() {
    canvas = createCanvas(windowWidth - 310, windowHeight);
    shelfWidth = width * 2 / 5;

    canvas.parent("canvas");

    calendar = {
        startTime: 6,//6 AM
        endTime: 20,//8 PM
        height: height / 7,
        scroll: 0
    }
}

function draw() {
    background(255);
    cursor(ARROW);

    stroke(50);
    strokeWeight(1);
    for (let i = 0.6; i < (numDays + 0.5); i++) {
        let x = shelfWidth + 10 + i * (width - shelfWidth - 20) / (numDays + 0.5);
        line(x, 0, x, height);
    }
    let totalHours = calendar.endTime - calendar.startTime;
    for (let u = 1; u < totalHours; u++) {
        line(shelfWidth + 10, u * calendar.height + calendar.scroll, width - 10, u * calendar.height + calendar.scroll);
    }
    noStroke();

    for (let i = 0; i < classList.length; i++) {
        classList[i].drawShelf(0, i * shelfHeight + shelfScroll, shelfWidth);//Shelf items
        classList[i].drawCalendar();
    }

    fill(150, 150, 150, 100);
    noStroke();
    let calendarStart = shelfWidth + 10;
    let calendarWidth = width - shelfWidth - 20;
    rect(calendarStart, 0, calendarWidth, 20);
    fill(50, 50, 0, 100);
    let days = ["Sunday", "Monday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = startDay; i < numDays + 1; i++) {
        text(days[i], calendarStart + (i + 0.6 - startDay) * calendarWidth / (numDays + 0.5), 15);
    }
    fill(0);
    for (let i = calendar.startTime; i < calendar.endTime; i++) {
        let currentHours = i;
        let currentApm = "AM";
        if (timeMode === 0) {
            if (currentHours > 11) {
                currentApm = "PM";
                if (currentHours > 12)
                    currentHours -= 12;
            }
            if (currentHours === 24) {
                currentHours = 12;
                currentApm = "AM";
            }
        }
        text(currentHours + ":00 " + currentApm, shelfWidth + 15, (i - calendar.startTime) * calendar.height + 10 + calendar.scroll);
    }

    let shelfPercent = min(1, height / classList.length / shelfHeight);//The percentage of the shelf that you can see at once
    let calendarPercent = min(1, height / totalHours / calendar.height);

    //Shelf and calendar scrollbar
    fill(150);
    noStroke();
    rect(shelfWidth, 0, 10, height);
    rect(width - 10, 0, 10, height);
    fill(200);
    if (mouseX > shelfWidth && mouseX < shelfWidth + 10 && mouseY > -shelfScroll * min(1, height / classList.length / shelfHeight) && mouseY < -shelfScroll * min(1, height / classList.length / shelfHeight) + height * height / classList.length / shelfHeight)
        fill(180);
    rect(shelfWidth + 2, -shelfScroll * shelfPercent, 6, height * shelfPercent, 5);
    fill(200);
    if (mouseX > width - 10 && mouseX < width && mouseY > -calendar.scroll * min(1, height / totalHours / calendar.height) && mouseY < -calendar.scroll * min(1, height / totalHours / calendar.height) + height * height / totalHours / calendar.height)
        fill(180);
    rect(width - 8, -calendar.scroll * calendarPercent, 6, height * calendarPercent, 5);

    if (mouseX >= shelfWidth + 10 && mouseX < shelfWidth + 15)
        cursor(MOVE);
}

function windowResized() {
    resizeCanvas(windowWidth - 310, windowHeight);

    calendar.height = height / 7;
}

function mouseWheel(event) {

    if (mouseX > 0 && mouseX < shelfWidth) {
        shelfScroll -= event.delta / 2;
        shelfScroll = constrain(shelfScroll, (-height + min(height, height * min(1, height / classList.length / shelfHeight))) / min(1, height / classList.length / shelfHeight), 0);
    }
    if (mouseX > shelfWidth + 10 && mouseX < width) {
        let totalHours = calendar.endTime - calendar.startTime;
        calendar.scroll -= event.delta / 2;
        calendar.scroll = constrain(calendar.scroll, (-height + min(height, height * min(1, height / totalHours / calendar.height))) / min(1, height / totalHours / calendar.height), 0);
    }

}

let draggingWheel = false;
let draggingShelf = false;
let draggingCalendar = false;

function mousePressed() {
    if (mouseX > shelfWidth && mouseX < shelfWidth + 10 && mouseY > -shelfScroll * min(1, height / classList.length / shelfHeight) && mouseY < -shelfScroll * min(1, height / classList.length / shelfHeight) + height * height / classList.length / shelfHeight) {
        draggingWheel = true;
    }
    if (mouseX > shelfWidth + 10 && mouseX < shelfWidth + 15) {
        draggingShelf = true;
    }
    let totalHours = calendar.endTime - calendar.startTime;
    if (mouseX > width - 10 && mouseX < width && mouseY > -calendar.scroll * min(1, height / totalHours / calendar.height) && mouseY < -calendar.scroll * min(1, height / totalHours / calendar.height) + height * height / totalHours / calendar.height) {
        draggingCalendar = true;
    }
}

function mouseReleased() {
    draggingWheel = false;
    draggingShelf = false;
    draggingCalendar = false;
}

function mouseDragged() {
    if (draggingWheel) {
        shelfScroll -= (mouseY - pmouseY) / min(1, height / classList.length / shelfHeight);
        shelfScroll = constrain(shelfScroll, (-height + min(height, height * min(1, height / classList.length / shelfHeight))) / min(1, height / classList.length / shelfHeight), 0);
    }
    if (draggingShelf) {
        shelfWidth += mouseX - pmouseX;
        let lower = width / 3;
        let upper = width * 5 / 9;
        shelfWidth = constrain(shelfWidth, lower, upper);
        if (lower > upper) {
            shelfWidth = width * 2 / 5;
        }
    }
    if (draggingCalendar) {
        let totalHours = calendar.endTime - calendar.startTime;
        calendar.scroll -= (mouseY - pmouseY) / min(1, height / totalHours / calendar.height);
        calendar.scroll = constrain(calendar.scroll, (-height + min(height, height * min(1, height / totalHours / calendar.height))) / min(1, height / totalHours / calendar.height), 0);
    }
}

function mouseClicked() {
    for (let i in classList) {
        classList[i].checkMark(0, i * shelfHeight + shelfScroll);
    }
}