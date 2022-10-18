let classList = [];
let timeMode = 0;//0 is 12-hour, 1 is 24-hour

function createClassList(arr) {
    let temp = [];
    for (let i in arr) {
        temp.push(new Class("", false));
        for (let u in arr[i]) {
            temp[i][u] = arr[i][u];
            if (typeof temp[i][u] === "object") {
                for (let j in arr[i][u]) {
                    if (typeof temp[i][u][j] === "object") {
                        for (let o in arr[i][u][j]) {
                            if (arr[i][u][j][o].hours !== undefined && arr[i][u][j][o].minutes !== undefined && arr[i][u][j][o].apm !== undefined) {
                                temp[i][u][j][o] = new Time(arr[i][u][j][o].hours, arr[i][u][j][o].minutes, arr[i][u][j][o].apm);
                            }
                        }
                    }
                }
            }
        }
    }

    return temp;
}

class Time {
    constructor(hours, minutes, apm) {
        this.hours = hours;
        this.milHours = hours;
        if ((apm.toLowerCase() === "pm" && hours !== 12) || (apm.toLowerCase() === "am" && hours === 12)) {
            this.milHours += 12;
        }
        this.minutes = minutes;

        this.apm = apm;
    }

    minutesPercent() {
        return this.minutes / 60;
    }

    toString() {
        if (timeMode === 0)
            return this.hours + ":" + (this.minutes >= 10?this.minutes:"0" + this.minutes) + " " + this.apm;
        return this.milHours + ":" + this.minutes;
    }
}

function nextLine(str, pointer) {
    let check = "";
    do {
        pointer++;
        check = str[pointer].replace(/\s+/g, '');
    } while (check === "");
    return pointer;
}

class Class {
    constructor(str=[], printErrors=true) {
        //Takes the formatted string and creates an object representing that class information

        try {
            this.darken = false;

            let pointer = 0;

            let course = str[pointer].split(" ");
            this.subject = course[0];
            this.subjectNum = parseInt(course[1]);

            pointer = nextLine(str, pointer);
            this.name = str[pointer];

            pointer = nextLine(str, pointer);
            this.id = parseInt(str[pointer]);

            pointer = nextLine(str, pointer);
            this.instructors = str[pointer].split(", ");

            this.days = [];
            pointer = nextLine(str, pointer);
            while (/^Th|Su|[MTWFS]/y.test(str[pointer])) {
                this.days.push(str[pointer].split(" "));
                pointer = nextLine(str, pointer);
            }

            this.times = [];
            let start = pointer;
            let timeCount = 0;
            while (/\d+:\d+ [AaPp][Mm]/.test(str[pointer])) {
                timeCount++;
                pointer = nextLine(str, pointer);
            }
            pointer = start;
            let startTimes = [];
            for (let i = 0; i < timeCount / 2; i++) {
                let nums = str[pointer].match(/\d+/g);
                let apm = str[pointer].match(/[pPaA][mM]/)[0];
                let startTime = new Time(parseInt(nums[0]), parseInt(nums[1]), apm);

                startTimes.push(startTime);
                
                pointer = nextLine(str, pointer);
            }
            let endTimes = [];
            for (let i = 0; i < timeCount / 2; i++) {
                let nums = str[pointer].match(/\d+/g);
                let apm = str[pointer].match(/[pPaA][mM]/)[0];
                let endTime = new Time(parseInt(nums[0]), parseInt(nums[1]), apm);
                endTimes.push(endTime);

                pointer = nextLine(str, pointer);
            }
            for (let i = 0; i < startTimes.length; i++) {
                this.times.push([startTimes[i], endTimes[i]]);
            }

            this.campus = [];
            this.locationName = [];
            this.locationNumber = [];
            while (/\w+ - \w+/y.test(str[pointer])) {
                this.campus.push(str[pointer].substring(0, str[pointer].indexOf("-") - 1));
                let location = str[pointer].substring(str[pointer].indexOf("-") + 1);
                this.locationName.push(location.match(/[a-zA-Z]+/)[0]);
                if (/\d+/.test(location)) {
                    this.locationNumber.push(parseInt(location.match(/\d+/)[0]));
                } else {
                    this.locationNumber.push("");
                }
                pointer = nextLine(str, pointer);
            }

            this.dates = [];
            this.sessions = [];
            while (/\d+\/\d+ - \d+\/\d+/.test(str[pointer])) {
                this.dates.push(str[pointer]);
                if (/(?<=\()\w(?=\))/.test(str[pointer]))
                    this.sessions.push(str[pointer].match(/(?<=\()\w(?=\))/)[0]);
                pointer = nextLine(str, pointer);
            }
            //pointer--;

            let tempNums = str[pointer].match(/\d+/g);
            this.units = [];
            let tempArray = this.units;
            tempNums.forEach((i) => { tempArray.push(parseInt(i)); });

            pointer = nextLine(str, pointer);
            let seats = str[pointer].split(" ");
            this.openSeats = parseInt(seats[0]);
            this.totalSeats = parseInt(seats[2]);

            //Variables that are used for choosing classes
            this.timeSelected = 0;//Which time to display
            this.checked = true;
        } catch (error) {
            if (printErrors) {
                console.log(error);
                addClassError();
            }
        }
        /*
            MAT 243
            Discrete Mathematical Structures
            70922
            Oleksandr Lytvak

            M W

            3:00 PM

            4:15 PM

            Tempe - LIBC3

            8/18 - 12/2 (C)
            3
            2 of 70
        */
    }

    checkMark(x, y) {
        let unit = shelfWidth / 11;
        let size = 20;
        if (mouseX > x + unit - size / 2 && mouseX < x + unit + size / 2 && mouseY > y + shelfHeight / 2 - size / 2 && mouseY < y + shelfHeight / 2 + size / 2) {
            this.checked = !this.checked;
        }
    }

    hoverDelete(x, y) {
        let unit = shelfWidth / 11;
        let size = 20;

        let trashX = x + unit - size * 1.1;
        let trashY = y + shelfHeight / 2;

        let trashLeft = trashX - size / 3;
        let trashRight = trashX + size / 3;
        let trashTop = trashY - size / 3;
        let trashDown = trashY + size / 3;

        if (mouseX > trashLeft && mouseX < trashRight && mouseY > trashTop && mouseY < trashDown) {
            return true;
        }
        return false;
    }

    drawShelf(x, y, width) {//   ||\\\||\\||
        textAlign(LEFT);
        textSize(12);

        fill(255);
        this.darken = mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + shelfHeight;
        if (this.darken) {
            fill(200);
        }
        stroke(0);
        rect(x, y, width, shelfHeight);

        let unit = shelfWidth / 11;

        fill(255, 198, 39);
        stroke(0);
        let size = 20;
        rect(x + unit - size/2, y + shelfHeight / 2 - size/2, size, size);//Check mark box
        if (this.checked) {
            stroke(140, 29, 64);
            strokeWeight(5);
            line(x + unit - size / 2, y + shelfHeight / 2, x + unit, y + shelfHeight / 2 + size / 3);
            line(x + unit, y + shelfHeight / 2 + size / 3, x + unit + size / 2, y + shelfHeight / 2 - size / 2);
            strokeWeight(1);
        }

        
        let trashX = x + unit - size * 1.1;
        let trashY = y + shelfHeight / 2;

        let trashLeft = trashX - size / 3;
        let trashRight = trashX + size / 3;
        let trashTop = trashY - size / 3;
        let trashDown = trashY + size / 3;
        noStroke();
        fill(150, 150, 150, 200);
        if (mouseX > trashLeft && mouseX < trashRight && mouseY > trashTop && mouseY < trashDown) {
            rect(trashX - size / 2.5, trashY - size / 2.5, size * 2 / 2.5, size * 2 / 2.5);//Delete box
        }

        strokeWeight(3.5);
        stroke(140, 29, 64);
        bezier(trashX - size / 3, trashY - size / 3, trashX, trashY - size / 2, trashX, trashY - size / 2, trashX + size / 3, trashY - size / 3);
        line(trashX - size / 3.1, trashY, trashX - size / 3.2, trashY + size / 3);//Left trash line
        line(trashX, trashY - size / 8, trashX, trashY + size / 2.7);//Middle trash line
        line(trashX + size / 3.1, trashY, trashX + size / 3.2, trashY + size / 3);//Right trash line
        strokeWeight(1);
        

        fill(0);
        noStroke();
        text(this.subject + this.subjectNum + "\n" + this.name + "\n" + this.id, x + 2 * unit, y + shelfHeight / 2 - 36, 3 * unit);

        let instructors = this.instructors + "";
        if (this.instructors.length > 3) {
            instructors = this.instructors[0] + ", " + this.instructors[1] + ", " + this.instructors[2] + "...";
        }
        text(instructors, x + 5 * unit, y + shelfHeight / 2 - 36, 2 * unit);

        if (this.days.length > 0) {//TODO fix this conditional, it's bad
            text(this.days[this.timeSelected] + "\n" + this.times[this.timeSelected][0] + " - " + this.times[this.timeSelected][1] + "\n" + this.campus + " - " + this.locationName + this.locationNumber, x + 7 * unit, y + shelfHeight / 2 - 36, 2 * unit);

            let units = this.units[0];
            if (this.units.length > 1)
                units += " - " + this.units[1];
            text(this.dates[this.timeSelected] + "\n" + units + "\n" + this.openSeats + " of " + this.totalSeats, x + 9 * unit, y + shelfHeight / 2 - 36, 2 * unit)
        }
    }

    drawCalendar() {
        if (this.checked && this.days.length > 0) {
            noStroke();
            let hour = this.times[this.timeSelected][0].milHours;
            let timeHeight = this.times[this.timeSelected][1].milHours - hour + this.times[this.timeSelected][1].minutesPercent() - this.times[this.timeSelected][0].minutesPercent();
            let y = (this.times[this.timeSelected][0].minutesPercent() + hour) * calendar.height - calendar.startTime * calendar.height + calendar.scroll;
            let timeWidth = (width - shelfWidth - 20) / (numDays + 0.5);
            let days = { "Su": 0, "M": 1, "T": 2, "W": 3, "Th": 4, "F": 5, "Sa": 6 };
            for (let i = 0; i < this.days[this.timeSelected].length; i++) {
                if (i >= startDay-1) {
                    let x = shelfWidth + 10 + (days[this.days[this.timeSelected][i]] + 0.6 - startDay) * (width - shelfWidth - 20) / (numDays + 0.5);
                    fill(90, 180, 120);
                    if (this.darken)
                        fill(80, 160, 110);
                    rect(x, y, timeWidth, calendar.height * timeHeight, 10);
                    fill(0);
                    text(this.name + "\n" + this.times[this.timeSelected][0] + " - " + this.times[this.timeSelected][1], x, y + 10, timeWidth/*, calendar.height * timeHeight*/);
                }
            }
        }
        
        
    }
}

function saveList() {
    localStorage.setItem("classList", JSON.stringify(classList));
}
function loadList() {
    classList = createClassList(JSON.parse(localStorage.getItem("classList")));
}