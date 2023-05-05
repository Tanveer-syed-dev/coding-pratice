// const addDays = require("date-fns/addDays");

// const result = addDays(new Date(2023, 0, 20), 3);
// console.log(result);

const addDays = require("date-fns/addDays");

const getDateAfterXDays = (days) => {
  const newDate = addDays(new Date(2020, 07, 22), days);
  console.log(
    `${newDate.getDate()}-${newDate.getMonth() + 1}-${newDate.getFullYear()}`
  );
};

getDateAfterXDays(5);
// module.exports = getDateAfterXDays;
