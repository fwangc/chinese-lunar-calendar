const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
];

const monthNames = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
const dayNames = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
const zodiac = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const minSupported = new Date(1900, 0, 31);
const maxSupported = new Date(2049, 11, 31);
const specialDates = [
  {
    month: 6,
    day: 6,
    label: "Fan's birthday"
  }
];

const els = {
  grid: document.querySelector("#calendarGrid"),
  title: document.querySelector("#monthTitle"),
  selectedGregorian: document.querySelector("#selectedGregorian"),
  selectedSpecial: document.querySelector("#selectedSpecial"),
  selectedLunar: document.querySelector("#selectedLunar"),
  selectedZodiac: document.querySelector("#selectedZodiac"),
  selectedGanzhi: document.querySelector("#selectedGanzhi"),
  selectedMonthLength: document.querySelector("#selectedMonthLength"),
  moonDisc: document.querySelector("#moonDisc"),
  prev: document.querySelector("#prevMonth"),
  next: document.querySelector("#nextMonth"),
  today: document.querySelector("#todayButton")
};

let visibleDate = clampDate(new Date());
let selectedDate = new Date(visibleDate);

function leapMonth(year) {
  return lunarInfo[year - 1900] & 0xf;
}

function leapDays(year) {
  if (leapMonth(year)) {
    return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

function monthDays(year, month) {
  return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

function lunarYearDays(year) {
  let total = 348;
  for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
    total += (lunarInfo[year - 1900] & bit) ? 1 : 0;
  }
  return total + leapDays(year);
}

function toLunar(date) {
  const target = stripTime(date);
  if (target < minSupported || target > maxSupported) return null;

  let offset = Math.floor((target - minSupported) / 86400000);
  let year = 1900;
  let daysInYear = lunarYearDays(year);

  while (year < 2050 && offset >= daysInYear) {
    offset -= daysInYear;
    year += 1;
    daysInYear = lunarYearDays(year);
  }

  const leap = leapMonth(year);
  let isLeap = false;
  let month = 1;
  let daysInMonth = monthDays(year, month);

  while (month <= 12 && offset >= daysInMonth) {
    offset -= daysInMonth;

    if (leap === month && !isLeap) {
      isLeap = true;
      daysInMonth = leapDays(year);
    } else {
      if (isLeap) isLeap = false;
      month += 1;
      daysInMonth = monthDays(year, month);
    }
  }

  return {
    year,
    month,
    day: offset + 1,
    isLeap,
    monthDays: daysInMonth,
    zodiac: zodiac[(year - 4) % 12],
    ganzhi: heavenlyStems[(year - 4) % 10] + earthlyBranches[(year - 4) % 12]
  };
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampDate(date) {
  const clean = stripTime(date);
  if (clean < minSupported) return new Date(minSupported);
  if (clean > maxSupported) return new Date(maxSupported);
  return clean;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getSpecialDate(date) {
  return specialDates.find((specialDate) => {
    return date.getMonth() === specialDate.month && date.getDate() === specialDate.day;
  });
}

function formatGregorian(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatMonthTitle(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function lunarMonthLabel(lunar) {
  return `${lunar.isLeap ? "Leap " : ""}${monthNames[lunar.month - 1]}`;
}

function renderCalendar() {
  els.title.textContent = formatMonthTitle(visibleDate);
  els.grid.replaceChildren();

  const firstOfMonth = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const firstGridDate = new Date(firstOfMonth);
  firstGridDate.setDate(firstGridDate.getDate() - firstOfMonth.getDay());

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(firstGridDate);
    cellDate.setDate(firstGridDate.getDate() + index);
    const lunar = toLunar(cellDate);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.setAttribute("aria-label", `${formatGregorian(cellDate)}, lunar ${lunar ? lunarMonthLabel(lunar) + " " + dayNames[lunar.day - 1] : "not supported"}`);

    if (cellDate.getMonth() !== visibleDate.getMonth()) button.classList.add("is-muted");
    if (sameDay(cellDate, selectedDate)) button.classList.add("is-selected");
    if (sameDay(cellDate, new Date())) button.classList.add("is-today");
    const specialDate = getSpecialDate(cellDate);
    if (specialDate) button.classList.add("is-special");

    button.innerHTML = `
      <span class="solar-day">${cellDate.getDate()}</span>
      <span>
        <span class="lunar-day">${lunar ? dayNames[lunar.day - 1] : "Out of range"}</span>
        <span class="lunar-month">${lunar ? lunarMonthLabel(lunar) : ""}</span>
        ${specialDate ? `<span class="special-label">${specialDate.label}</span>` : ""}
      </span>
    `;

    button.addEventListener("click", () => {
      selectedDate = cellDate;
      if (visibleDate.getMonth() !== cellDate.getMonth()) {
        visibleDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
      }
      renderCalendar();
      renderDetails();
    });

    els.grid.append(button);
  }
}

function renderDetails() {
  const lunar = toLunar(selectedDate);
  const specialDate = getSpecialDate(selectedDate);
  els.selectedGregorian.textContent = formatGregorian(selectedDate);
  els.selectedSpecial.textContent = specialDate ? specialDate.label : "-";

  if (!lunar) {
    els.selectedLunar.textContent = "Out of supported range";
    els.selectedZodiac.textContent = "-";
    els.selectedGanzhi.textContent = "-";
    els.selectedMonthLength.textContent = "-";
    els.moonDisc.style.setProperty("--phase-lit", "50%");
    return;
  }

  els.selectedLunar.textContent = `${lunar.year} ${lunarMonthLabel(lunar)} ${dayNames[lunar.day - 1]}`;
  els.selectedZodiac.textContent = `${lunar.zodiac}`;
  els.selectedGanzhi.textContent = `${lunar.ganzhi}年`;
  els.selectedMonthLength.textContent = `${lunar.monthDays} days`;

  const litPercent = Math.max(4, Math.min(96, (lunar.day / lunar.monthDays) * 100));
  els.moonDisc.style.setProperty("--phase-lit", `${litPercent}%`);
}

function moveMonth(amount) {
  const next = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + amount, 1);
  visibleDate = clampDate(next);
  renderCalendar();
}

els.prev.addEventListener("click", () => moveMonth(-1));
els.next.addEventListener("click", () => moveMonth(1));
els.today.addEventListener("click", () => {
  selectedDate = clampDate(new Date());
  visibleDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderCalendar();
  renderDetails();
});

renderCalendar();
renderDetails();
