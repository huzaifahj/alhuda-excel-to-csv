import { createReadStream, writeFileSync } from "fs";
import { DateTime } from "luxon";
import { parse, unparse } from "papaparse";

// Set Ramadan dates
const ramadanStart = "2023-03-23";
const ramadanEnd = "2023-04-20";
const ramadanStartTs = DateTime.fromISO(ramadanStart).valueOf();
const ramadanEndTs = DateTime.fromISO(ramadanEnd).valueOf();

async function main() {
  const rows: Array<string[]> = [];
  await new Promise((resolve) => {
    parse(createReadStream("input.csv"), {
      step: (row) => {
        rows.push(row.data as string[]);
      },
      complete: resolve,
    });
  });

  type OutputRow = {
    d_date: string;
    fajr_begins: string;
    fajr_jamah: string;
    sunrise: string;
    zuhr_begins: string;
    zuhr_jamah: string;
    asr_mithl_1: string;
    asr_mithl_2: string;
    asr_jamah: string;
    maghrib_begins: string;
    maghrib_jamah: string;
    isha_begins: string;
    isha_jamah: string;
    is_ramadan: "0" | "1";
    hijri_date: string;
  };

  let days: OutputRow[] = [];
  for (const row of rows) {
    const obj: OutputRow = {
      d_date: row[0],
      fajr_begins: row[3],
      fajr_jamah: row[4],
      sunrise: row[5],
      zuhr_begins: row[6],
      zuhr_jamah: row[7],
      asr_mithl_1: row[8],
      asr_mithl_2: row[8],
      asr_jamah: row[9],
      maghrib_begins: row[10],
      maghrib_jamah: row[11],
      isha_begins: row[12],
      isha_jamah: row[13],
      is_ramadan: "0",
      hijri_date: "",
    };

    //  Skip rows
    if (obj.d_date === "DATE" || !obj.d_date) continue;

    // Date formatting
    const dateSplit = obj.d_date.split("/");
    obj.d_date = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;

    // Time formatting
    for (const [key, value] of Object.entries(obj)) {
      // Add leading zero to Fajr and Sunrise
      if (["fajr_begins", "fajr_jamah", "sunrise"].includes(key)) {
        const hours = value.split(":")[0];
        const minutes = value.split(":")[1];
        if (hours.length === 1) {
          (obj as any)[key] = `0${hours}:${minutes}`;
        }
      }

      // Make Zuhr PM if needed
      if (["zuhr_begins", "zuhr_jamah"].includes(key)) {
        const hours = value.split(":")[0];
        const minutes = value.split(":")[1];
        if (Number(hours) !== 11 && Number(hours) !== 12) {
          (obj as any)[key] = `${String(Number(hours) + 12)}:${minutes}`;
        }
      }

      // Make times after Zuhr PM
      if (
        [
          "asr_mithl_1",
          "asr_mithl_2",
          "asr_jamah",
          "maghrib_begins",
          "maghrib_jamah",
          "isha_begins",
          "isha_jamah",
        ].includes(key)
      ) {
        const hours = value.split(":")[0];
        const minutes = value.split(":")[1];
        (obj as any)[key] = `${String(Number(hours) + 12)}:${minutes}`;
      }
    }

    // Check if Ramadan
    const dateTs = DateTime.fromISO(obj.d_date).valueOf();
    if (dateTs >= ramadanStartTs && dateTs <= ramadanEndTs) {
      obj.is_ramadan = "1";
    }

    days.push(obj);
  }

  // Sort days
  days = days.sort((a, b) => {
    return (
      DateTime.fromISO(a.d_date).valueOf() -
      DateTime.fromISO(b.d_date).valueOf()
    );
  });

  // Export as CSV
  const outputString = unparse(days, {
    header: true,
  });
  writeFileSync("output.csv", outputString);

  console.log("Completed");
}

main();
