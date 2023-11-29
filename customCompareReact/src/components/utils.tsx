import * as React from "react";

export function incomeFormat(num: number, type: string) {
  if (num) {
    if (num < 1 && num > -1) {
      return "-";
    } else {
      switch (type) {
        case "money":
          if (num < 0) {
            return `($${new Intl.NumberFormat().format(
              parseInt((-num).toFixed(0))
            )})`;
          } else {
            return `$${new Intl.NumberFormat().format(
              parseInt(num.toFixed(0))
            )}`;
          }
        case "number":
          if (num < 0) {
            return `(${new Intl.NumberFormat().format(
              parseInt((-num).toFixed(0))
            )})`;
          } else {
            return new Intl.NumberFormat().format(parseInt(num.toFixed(0)));
          }
        case "percent":
          return `${num.toFixed(2)}%`;
        case "factor":
          return num.toFixed(2);
      }
    }
  } else {
    return "-";
  }
}
export const dialog = {
  "& .MuiDialog-paper": {
    minWidth: "666px",
  },
};
