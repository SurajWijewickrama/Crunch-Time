import "./style.css";

/////////////////////////////////////////////////////////
// Events Class

class Events {
  name; //name of the function
  description; //description
  fixed;
  constructor(name, description = "", fixed) {
    this.name = name;
    this.description = description;
    this.fixed = fixed;
  }
  changeName(newName) {
    this.name = newName;
  }
}
// fixed event on the day
class FixedEvent extends Events {
  startTime;
  endTime;
  constructor(name, description = "", fixed, startTime, endtime) {
    super(name, description, fixed);
    this.startTime = startTime;
    this.endTime = endtime;
  }
}
// events that you can do anypoint of the day (tasks)
class DynamicEvent extends Events {
  duration;
  constructor(name, description = "", fixed, duration) {
    super(name, description, fixed);
    this.duration = duration;
  }
}
// Accounts
class Account {
  fullName;
  userName;
  Id;
  generalSleepTime;
  eventList = [];
  constructor(
    fullName,
    userName,
    generalSleepTime,
    wakeUpTime,
    eventList = []
  ) {
    this.fullName = fullName;
    this.userName = userName;
    this.generalSleepTime = generalSleepTime;
    this.wakeUpTime = wakeUpTime;
    this.eventList = eventList;
  }
  getUserName() {
    return this.userName;
  }
  getFullName() {
    return this.fullName;
  }
  getEventList() {
    return this.eventList;
  }
  addNewEvent(event) {
    this.eventList.push(event);
  }
  getSleepTimeHours() {
    const hours = Number.parseInt(this.generalSleepTime.split(":")[0]);
    return hours;
  }
  getSleepTimeMinutes() {
    const minutes = Number.parseInt(this.generalSleepTime.split(":")[1]);
    return minutes;
  }
}
///////////////////////////////selectors////////////////
const welcText = document.querySelector(".welcome");
//home, nav, login elements
const nav = document.querySelector("nav");
const userName = document.querySelector("#name");
const loginButton = document.querySelector(".login_button");
const logoutButton = document.querySelector(".logout_button");
const signInButton = document.querySelector(".signin_button");
const loginForm = document.querySelector(".login--form");
const topText = document.querySelector(".top");
//sign in form elements
const signinForm = document.querySelector(".signin--form");
const submitButton = document.querySelector(".signin--submit");
const fullNameInput = document.querySelector("#fullname");
const userNameInput = document.querySelector("#username");
const sleepTimeInput = document.querySelector("#sleeptime");
const wakeUpTimeInput = document.querySelector("#waketime");

// content elements
const outerDiv = document.querySelector(".outer");
const statusBar = document.querySelector(".status_bar");
const timeLeft = document.querySelector(".timeleft");
const subContent = document.querySelector(".subcontent");
const startUp = document.querySelector(".startup");
// day view elements
const nowRow = document.querySelector(".now");
const sleepRow = document.querySelector(".sleeptime");
let eventRows = document.querySelectorAll(".event.row");
let events = document.querySelector(".events");
const addNewEvent = document.querySelector(".new--event");
//display elements
const display = document.querySelector(".display");
const newEventForm = document.querySelector(".newEvent--form");
const EventDetails = document.querySelector(".details");
// newEventForm
const createButton = document.querySelector(".newEvent_button");
let fixedtoggle = document.querySelector(".fixed--toggle");
const fixedTimeInput = document.querySelector(".eventfixed");
const dynamicTimeInput = document.querySelector(".dynamic");

/////////////// --- App class --------////////////////////////////////
class App {
  now;
  accountList = [];
  activeAcc;
  #timerTick;
  nightOwl;
  optimizedEvent = [];
  constructor() {
    // this.loggedIn();
    let now = new Date();
    this.home();
    this.accountList =
      this.getfromLocal() != undefined ? this.getfromLocal() : [];
    // console.log(this.getfromLocal() ? this.getfromLocal() : []);
    loginButton.addEventListener("click", this.#login.bind(this));
    signInButton.addEventListener("click", this.#showSignIn.bind(this));
    logoutButton.addEventListener("click", this.#logout.bind(this));
    eventRows.forEach((element) => {
      element.addEventListener("click", this.#eventRowClick.bind(this));
    });
    addNewEvent.addEventListener("click", this.#newEventDisplay.bind(this));
    fixedtoggle.addEventListener("change", this.#changeFormToFixed.bind(this));
    createButton.addEventListener("click", this.#sumbitNewEvent.bind(this));
  }
  #showSignIn() {
    this.signingIn();
    submitButton.addEventListener("click", this.#signIn.bind(this));
  }
  getAcclist() {
    return this.accountList;
  }
  #signIn(e) {
    e.preventDefault();
    const fullName = fullNameInput.value;
    const userName = userNameInput.value;
    const sleepTime = sleepTimeInput.value;
    const wakeUpTime = wakeUpTimeInput.value;
    if (!(fullName && userName)) {
      alert("input field missing, signup failed");
      this.home();
      fullNameInput.value = userNameInput.value = "";
      return;
    }

    const newAcc = new Account(fullName, userName, sleepTime, wakeUpTime);
    // JSON.parse(localStorage.getItem("acclist"));
    if (wakeUpTime && sleepTime) {
      if (toMinutes(wakeUpTime) > toMinutes(sleepTime)) {
        newAcc.eventList.push(
          new FixedEvent("sleep", "sleep", true, sleepTime, wakeUpTime)
        );
        this.nightOwl = true;
      } else {
        newAcc.eventList.push(
          new FixedEvent("sleep", "sleep", true, sleepTime, "24:00")
        );
        newAcc.eventList.push(
          new FixedEvent("sleep", "sleep", true, "00:00", wakeUpTime)
        );
        this.nightOwl = false;
      }
    }
    this.accountList.push(newAcc);
    this.saveACCInLocal();

    alert(`Hello!, ${fullName},your acc was succefully created`);
    fullNameInput.value = userNameInput.value = "";
    this.home();
  }
  #login(e) {
    e.preventDefault();
    this.activeAcc = null;
    this.accountList = this.getfromLocal();
    if (this.accountList) {
      this.accountList.forEach((acc) => {
        acc.getUserName().toLowerCase() == userName.value.toLowerCase()
          ? (this.activeAcc = acc)
          : console.log();
      });
    }
    if (this.activeAcc) {
      welcText.innerHTML = "Hello, <br>" + this.activeAcc.getFullName();
      this.nightOwl =
        this.activeAcc.wakeUpTime > this.activeAcc.sleepTime ? true : false;
      this.loggedIn();
      this.#renderEvents();
      this.#setTimes();
    }
    if (!this.activeAcc) {
      userName.value = "";
      alert("Invalid User name");
    }
  }
  #logout(e) {
    console.log(e.target);
    if (this.activeAcc != null) {
      this.activeAcc = null;
      userName.value = "";
      this.home();
      clearTimeout(this.timer);
    }
    events.innerHTML = "";
    this.saveACCInLocal();
  }
  saveACCInLocal() {
    localStorage.setItem(`acclist`, JSON.stringify(this.accountList));
  }
  getfromLocal() {
    if (JSON.parse(localStorage.getItem("acclist"))) {
      return JSON.parse(localStorage.getItem("acclist")).map(
        (acc) =>
          new Account(
            acc.fullName,
            acc.userName,
            acc.generalSleepTime,
            acc.wakeUpTime,
            acc.eventList
          )
      );
    }
    return undefined;
  }
  #setTimes() {
    // console.log(this.activeAcc);
    this.tick();
    setInterval(this.tick.bind(this), 60000);
  }
  #renderEvents() {
    events.innerHTML = "";
    this.optimizedEvent = this.sortEvents(this.activeAcc);
    const heightPerHour = window.innerWidth > 600 ? 50 : 35;
    this.optimizedEvent.forEach((el, i) => {
      let html = "";
      if (el.fixed) {
        //////setting height to each event///////
        const heightElement =
          (this.timedifference(
            el.endTime.split(":")[0],
            el.endTime.split(":")[1],
            el.startTime.split(":")[0],
            el.startTime.split(":")[1]
          )[3] /
            60) *
          heightPerHour;
        html = `<div class="event row fixed" data-eventID=${i} style="min-height:${
          heightElement > heightPerHour ? heightElement : heightPerHour
        }px;">${el.name} <g>${
          el.name == "EOD" ? "" : `from ${el.startTime} to`
        } ${el.endTime}</g></div>`;
      } else {
        const heightElement =
          (Number.parseInt(el.duration.split(":")[0]) +
            Number.parseInt(el.duration.split(":")[1]) / 60) *
          heightPerHour;

        html = `<div class="event row" data-eventID=${i} style="min-height:${
          heightElement > heightPerHour ? heightElement : heightPerHour
        }px;"> ${el.name}<g> for ${el.duration.split(":")[0]}h and ${
          el.duration.split(":")[1]
        }m </g></div>`;
      }
      events.insertAdjacentHTML("beforeend", html);
      let eventRows = document.querySelectorAll(".event.row");
      eventRows.forEach((element) => {
        element.addEventListener("click", this.#eventRowClick.bind(this));
      });
    });
  }
  sortEvents(acc) {
    // setup
    const now = new Date();
    let nowMinutes = now.getMinutes() + now.getHours() * 60;
    // let nowMinutes = toMinutes("11:00");
    const tempEvent = JSON.parse(JSON.stringify(acc.eventList));
    // const tempEvent = acc.eventList;
    let beforeNowFixed = [];
    let afterNowFixed = [];
    let dynamics = [];
    let cantDoDynamics = [];
    let sorted = [];
    let EOD = this.toMinutes("24:00");

    let endOfDay = new FixedEvent("EOD", "", true, "24:00", "24:00");
    let afterSleeptimeFixed;
    afterNowFixed = tempEvent
      .filter((event) => event.fixed)
      .filter((event) => this.toMinutes(event.endTime) > nowMinutes);
    dynamics = tempEvent.filter((event) => !event.fixed);
    // dynamics[0].name = "gogo";
    afterSleeptimeFixed = afterNowFixed.filter(
      (event) =>
        this.toMinutes(event.startTime) > this.toMinutes(acc.generalSleepTime)
    );
    // afterNowFixed = afterNowFixed.filter(
    //   (event) =>
    //     this.toMinutes(event.startTime) < this.toMinutes(acc.generalSleepTime)
    // );
    afterNowFixed = afterNowFixed.sort(function (a, b) {
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
    // console.log(afterNowFixed);
    // logic/////////////////////////////////////////////////////////////
    afterNowFixed.push(endOfDay);
    let curser = nowMinutes;
    let fixedIndex = 0;
    let tempFixed = afterNowFixed[fixedIndex];
    let currentDynamic = dynamics[0];
    let count = 0;
    //////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    while (true && count < 10) {
      if (curser >= EOD) {
        cantDoDynamics = dynamics.slice(
          dynamics.findIndex((element) => element == currentDynamic)
        );
        // console.log("hey");
        break;
      }
      //////////////for no dynamics////////////////
      if (!currentDynamic) {
        // console.log("na");
        // console.log("free", this.toHours(sleepTime - curser));
        dynamics.push(
          new DynamicEvent("free", "", false, this.toHours(EOD - curser))
        );
        currentDynamic = dynamics[0];
      }
      let availableToFixed = this.toMinutes(tempFixed.startTime) - curser;
      if (availableToFixed <= 0) {
        sorted.push(tempFixed);
        curser = this.toMinutes(tempFixed.endTime);
        tempFixed = afterNowFixed[++fixedIndex];
        continue;
      }
      ///////////////////////////////////////////////////////
      if (this.toMinutes(currentDynamic.duration) > availableToFixed) {
        // setting the cuurent dynamic to a duration without the available time
        currentDynamic.duration = this.toHours(
          this.toMinutes(currentDynamic.duration) - availableToFixed
        );
        sorted.push(
          new DynamicEvent(
            currentDynamic.name,
            currentDynamic.description,
            currentDynamic.fixed,
            this.toHours(availableToFixed)
          )
        );
        availableToFixed = 0;
        curser = this.toMinutes(tempFixed.endTime);
        if (tempFixed == endOfDay) {
          curser = EOD;
        }
        sorted.push(tempFixed);
        tempFixed = afterNowFixed[++fixedIndex];
        //////////////////////////////////////////////////////
        /////////////////////////////////////////////////
        ////////////////////////////////////////////
      } else if (this.toMinutes(currentDynamic.duration) <= availableToFixed) {
        curser += this.toMinutes(currentDynamic.duration);
        sorted.push(currentDynamic);
        if (
          !dynamics[
            dynamics.findIndex((element) => element == currentDynamic) + 1
          ]
        ) {
          // console.log("free", this.toHours(sleepTime - curser));
          dynamics.push(
            new DynamicEvent("free", "", false, this.toHours(EOD - curser))
          );
          // when freee
        }
        currentDynamic =
          dynamics[
            dynamics.findIndex((element) => element == currentDynamic) + 1
          ];
      }
      count++;
    }
    if (sorted[sorted.length - 1].name != "EOD") sorted.push(endOfDay);
    sorted = sorted.filter((event) =>
      event.duration ? toMinutes(event.duration) > 0 : true
    );
    // console.log(sorted, tempFixed, currentDynamic);
    return sorted;
  }
  toMinutes(time) {
    return (
      Number.parseInt(time.split(":")[0] * 60) +
      Number.parseInt(time.split(":")[1])
    );
  }
  toHours(time) {
    return (
      Math.trunc(Number.parseInt(time / 60))
        .toString()
        .padStart(2, "0") +
      ":" +
      Number.parseInt(time % 60)
        .toString()
        .padStart(2, "0")
    );
  }
  #sumbitNewEvent(e) {
    e.preventDefault();

    let durationhd = document.querySelector("#event-duration-hd").value;
    let durationmd = document.querySelector("#event-duration-md").value;
    let durationsh = document.querySelector("#event-duration-sh").value;
    let durationsm = document.querySelector("#event-duration-sm").value;
    let durationeh = document.querySelector("#event-duration-eh").value;
    let durationem = document.querySelector("#event-duration-em").value;
    let newName = document.querySelector("#event-name").value;
    let description = document.querySelector("#event-description").value;
    let newEvent;
    if (!fixedTimeInput.classList.contains("hidden")) {
      const starttime =
        durationsh.toString().padStart(2, 0) +
        ":" +
        durationsm.toString().padStart(2, 0);
      const endtime =
        durationeh.toString().padStart(2, 0) +
        ":" +
        durationem.toString().padStart(2, 0);
      newEvent = new FixedEvent(newName, description, true, starttime, endtime);
    } else {
      const duration =
        durationhd.toString().padStart(2, 0) +
        ":" +
        durationmd.toString().padStart(2, 0);
      newEvent = new DynamicEvent(newName, description, false, duration);
    }
    this.activeAcc.addNewEvent(newEvent);
    this.#renderEvents();
    document.querySelector("#event-name").value =
      document.querySelector("#event-duration-hd").value =
      document.querySelector("#event-duration-md").value =
      document.querySelector("#event-duration-sh").value =
      document.querySelector("#event-duration-sm").value =
      document.querySelector("#event-duration-eh").value =
      document.querySelector("#event-duration-em").value =
        null;
  }
  #eventRowClick(e) {
    newEventForm.classList.add("hidden");
    EventDetails.classList.remove("hidden");
    display.classList.remove("fixed");
    // console.log(fixedtoggle.value);
    // this.optimizedEvent[e.target.dat]
  }
  #newEventDisplay(e) {
    console.log(e.target);
    newEventForm.classList.remove("hidden");
    EventDetails.classList.add("hidden");
    if (!fixedTimeInput.classList.contains("hidden")) {
      display.classList.toggle("fixed");
    }
  }
  #changeFormToFixed() {
    fixedTimeInput.classList.toggle("hidden");
    dynamicTimeInput.classList.toggle("hidden");
    display.classList.toggle("fixed");
    fixedtoggle = document.querySelector(".fixed--toggle");
  }
  home() {
    //on start
    welcText.classList.add("hidden");
    loginForm.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    signInButton.classList.remove("hidden");
    signinForm.classList.add("hidden");
    startUp.classList.remove("hidden");
    subContent.classList.add("hidden");
    statusBar.classList.add("hidden");

    nav.classList.remove("loggedMobile");
    outerDiv.classList.remove("loggedMobile");
    topText.classList.remove("loggedMobile");
    welcText.classList.remove("loggedMobile");
  }
  loggedIn() {
    nav.classList.add("loggedMobile");
    outerDiv.classList.add("loggedMobile");
    topText.classList.add("loggedMobile");
    welcText.classList.remove("hidden");
    welcText.classList.add("loggedMobile");
    loginForm.classList.add("hidden");
    logoutButton.classList.remove("hidden");
    signInButton.classList.add("hidden");
    startUp.classList.add("hidden");
    subContent.classList.remove("hidden");
    statusBar.classList.remove("hidden");
  }
  signingIn() {
    signinForm.classList.remove("hidden");
    welcText.classList.add("hidden");
    loginForm.classList.add("hidden");
    signInButton.classList.add("hidden");
  }
  timedifference(hours1, minutes1, hours2, minutes2) {
    //return difference string , hours, minutes
    hours1 = Number.parseInt(hours1);
    hours2 = Number.parseInt(hours2);
    minutes1 = Number.parseInt(minutes1);
    minutes2 = Number.parseInt(minutes2);

    const difInMinutes = hours1 * 60 + minutes1 - (hours2 * 60 + minutes2);
    const hoursDif = Math.trunc(difInMinutes / 60);
    const minutesDif = difInMinutes % 60;
    const difference = `${hoursDif}Hours ${minutesDif} Minutes`;

    return [difference, hoursDif, minutesDif, difInMinutes];
  }
  tick() {
    this.#renderEvents();
    if (!this.activeAcc) return;
    const sleepHours = this.nightOwl ? 24 : this.activeAcc.getSleepTimeHours();
    const sleepMinutes = this.nightOwl
      ? 0
      : this.activeAcc.getSleepTimeMinutes();
    let now = new Date();
    nowRow.innerHTML = `Now <g>${now.getHours().toString().padStart(2, 0)}:${now
      .getMinutes()
      .toString()
      .padStart(2, 0)}</g>`;
    timeLeft.innerHTML = `Time left on your day: <p class="highlights">${this.toHours(
      24 * 60 - now.getMinutes()
    )}
      `;
    // ---set day view height----
    // const calheight =
    //   (this.timedifference(24, 0, now.getHours(), now.getMinutes())[3] / 60) *
    //     50 +
    //   this.optimizedEvent.length * 50;
    // const minheight = this.optimizedEvent.length * 50;

    // events.style.height = `${calheight > minheight ? calheight : minheight}px`;
  }
}
new App();

const suraj = new Account("Suraj Wijewickrama", "suraj", "23:00");
const eat = new FixedEvent("eat", "eat lunch", true, "12:00", "13:00");
const diner = new FixedEvent("diner", "eat diner", true, "19:00", "20:30");
const study = new DynamicEvent("study", "java script", false, "3:00");
const games = new DynamicEvent(
  "Play games",
  "play valorant, karmaverse",
  false,
  "2:00"
);
const uplate = new FixedEvent("lat", "eat lunch", true, "22:40", "23:40");

suraj.addNewEvent(study);
suraj.addNewEvent(eat);
suraj.addNewEvent(games);
suraj.addNewEvent(diner);
suraj.addNewEvent(uplate);
// console.log(suraj);
[suraj, new Account("Thilini Wijewickrama", "thilla", "00:00")];

const sortEvents = function (acc) {
  // setup
  // const now = new Date();
  let nowMinutes = now.getMinutes() + now.getHours() * 60;
  nowMinutes = toMinutes("11:00");
  const tempEvent = acc.eventList;
  let beforeNowFixed = [];
  let afterNowFixed = [];
  let dynamics = [];
  let sorted = [];
  let sleepTime = toMinutes(acc.generalSleepTime);
  let sleepTimeEvent = new FixedEvent("sleep", "", true, sleepTime, "23:59");
  let afterSleeptime;
  afterNowFixed = tempEvent
    .filter((event) => event.fixed)
    .filter((event) => toMinutes(event.endTime) > nowMinutes);
  dynamics = tempEvent.filter((event) => !event.fixed);
  afterSleeptime = afterNowFixed.filter(
    (event) => toMinutes(event.startTime) > toMinutes(acc.generalSleepTime)
  );
  afterNowFixed = afterNowFixed.filter(
    (event) => toMinutes(event.startTime) < toMinutes(acc.generalSleepTime)
  );
  console.log(afterNowFixed, dynamics, tempEvent);
  // logic
  let curser = nowMinutes;
  let fixedIndex = 0;
  let tempFixed = afterNowFixed[fixedIndex];
  let currentDynamic = dynamics[0];
  afterNowFixed.push(sleepTimeEvent);
  let count = 0;

  //
  //
  while (count < 3) {
    console.log(tempFixed);
    let availableToFixed = toMinutes(tempFixed.startTime) - curser;
    if (curser == sleepTime) break;

    if (toMinutes(currentDynamic.duration) > availableToFixed) {
      // setting the cuurent dynamic to a duration without the available time
      currentDynamic.duration = toHours(
        toMinutes(currentDynamic.duration) - availableToFixed
      );
      sorted.push(
        new DynamicEvent(
          currentDynamic.name,
          currentDynamic.description,
          currentDynamic.fixed,
          availableToFixed
        )
      );
      availableToFixed = 0;
      curser = toMinutes(tempFixed.endTime);
      if (tempFixed == sleepTimeEvent) {
        curser = sleepTime;
      }
      sorted.push(tempFixed);
      tempFixed = afterNowFixed[++fixedIndex];
      console.log("index", fixedIndex);
    } else if (toMinutes(currentDynamic.duration) < availableToFixed) {
      console.log("awa");
      curser += toMinutes(currentDynamic.duration);
      sorted.push(currentDynamic);
      if (
        !dynamics[
          dynamics.findIndex((element) => element == currentDynamic) + 1
        ]
      ) {
        sorted.push(
          new DynamicEvent("free", "", false, toHours(sleepTime - curser))
        );
        curser = sleepTime;
      }
      currentDynamic =
        dynamics[
          dynamics.findIndex((element) => element == currentDynamic) + 1
        ];
    }
    count++;
  }

  console.log(sorted, tempFixed, currentDynamic, toHours(curser));
};
const toMinutes = function (time) {
  return (
    Number.parseInt(time.split(":")[0] * 60) +
    Number.parseInt(time.split(":")[1])
  );
};
// console.log(toMinutes("2:30"));
const toHours = function (time) {
  return (
    Math.trunc(Number.parseInt(time / 60))
      .toString()
      .padStart(2, "0") +
    ":" +
    Number.parseInt(time % 60)
      .toString()
      .padStart(2, "0")
  );
};
// sortEvents(suraj);

// console.log(30 % 4);
