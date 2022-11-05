export function prevMonth() {
  const tempDateObj = new Date(Date.now());

  if (tempDateObj.getMonth() === 0) {
    tempDateObj.setYear(tempDateObj.getYear() - 1);
    tempDateObj.setMonth(11);
    return tempDateObj.getMonth();
  }
  return tempDateObj.getMonth() - 1;
}

export function getUnixPreviousLastMonth() {
  const startOfMonth = new Date(Date.now());
  const endOfMonth = new Date(Date.now());

  if (startOfMonth.getMonth() === 0) {
    startOfMonth.setYear(startOfMonth.getYear() - 1);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setMonth(10);
  } else if (startOfMonth.getMonth() === 1) {
    startOfMonth.setYear(startOfMonth.getYear() - 1);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setMonth(11);
  } else {
    startOfMonth.setMonth(startOfMonth.getMonth() - 2);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
  }
  if (endOfMonth.getMonth() === 0) {
    endOfMonth.setYear(endOfMonth.getYear() - 1);
    endOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setDate(1);
    endOfMonth.setMonth(11);
  } else {
    endOfMonth.setMonth(endOfMonth.getMonth() - 1);
    endOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setDate(1);
  }

  return [
    (startOfMonth.getTime() / 1000).toFixed(0),
    (endOfMonth.getTime() / 1000).toFixed(0),
  ];
}

export function getUnixThisMonth() {
  const startOfMonth = new Date(Date.now());
  const endOfMonth = new Date(Date.now());

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  if (endOfMonth.getMonth() === 12) {
    endOfMonth.setYear(endOfMonth.getYear() + 1);
    endOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setDate(1);
    endOfMonth.setMonth(1);
  } else {
    endOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setDate(1);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  }

  return [
    (startOfMonth.getTime() / 1000).toFixed(0),
    (endOfMonth.getTime() / 1000).toFixed(0),
  ];
}

export function getUnixLastMonth() {
  const startOfMonth = new Date(Date.now());
  const endOfMonth = new Date(Date.now());

  if (startOfMonth.getMonth() === 0) {
    startOfMonth.setYear(startOfMonth.getYear() - 1);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setMonth(11);
  } else {
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
  }
  endOfMonth.setHours(0, 0, 0, 0);
  endOfMonth.setDate(1);

  return [
    (startOfMonth.getTime() / 1000).toFixed(0),
    (endOfMonth.getTime() / 1000).toFixed(0),
  ];
}

export function prevSecondMonth() {
  const tempDateObj = new Date(Date.now());

  if (tempDateObj.getMonth() === 0) {
    tempDateObj.setYear(tempDateObj.getYear() - 1);
    tempDateObj.setMonth(12);
  } else if (tempDateObj.getMonth() === 1) {
    tempDateObj.setYear(tempDateObj.getYear() - 1);
    tempDateObj.setMonth(11);
  } else {
    tempDateObj.setMonth(tempDateObj.getMonth() - 2);
  }
  return tempDateObj.getMonth();
}

export function getDate() {
  let today = new Date();
  let dd = today.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const mm = monthNames[today.getMonth()]; // January is 0!
  const yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  today = mm + ", " + dd + " " + yyyy;

  return today;
}

export function getTime() {
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();

  if (h < 10) {
    h = "0" + h;
  }

  if (m < 10) {
    m = "0" + m;
  }

  now = h + ":" + m;
  return now;
}

export function timeConverter(UNIX_timestamp) {
  const a = new Date(UNIX_timestamp * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  // const hour = a.getHours();
  // const min = a.getMinutes();
  // const sec = a.getSeconds();
  const time = month + " " + date + ", " + year;
  return time;
}

export const DateDiff = {
  inDays: function (d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return Math.floor((t2 - t1) / (24 * 3600 * 1000));
  },

  inWeeks: function (d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
  },

  inMonths: function (d1, d2) {
    const d1Y = d1.getFullYear();
    const d2Y = d2.getFullYear();
    const d1M = d1.getMonth();
    const d2M = d2.getMonth();

    return d2M + 12 * d2Y - (d1M + 12 * d1Y);
  },

  inYears: function (d1, d2) {
    return d2.getFullYear() - d1.getFullYear();
  },
};

export const getMonthsAndDays = (seconds) => {
  const monthsCount = Math.floor(seconds / 2629743);

  seconds %= 2629743;

  const daysCount = Math.floor(seconds / (3600 * 24));

  return {
    monthsCount,
    daysCount,
  };
};
