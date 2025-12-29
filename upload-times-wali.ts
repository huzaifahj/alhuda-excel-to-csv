import * as fs from "fs";

const csvContent = fs.readFileSync("./output-2026.csv", "utf-8");
const lines = csvContent.trim().split("\n");
const dataLines = lines.slice(1);

const times = dataLines.map((line) => {
  const cols = line.split(",");
  return {
    date: cols[0],
    fajr_adhan: cols[1],
    fajr_jamaah: cols[2],
    sunrise: cols[3],
    dhuhr_adhan: cols[4],
    dhuhr_jamaah: cols[5],
    asr_adhan: cols[6],
    asr_jamaah: cols[8],
    maghrib_adhan: cols[9],
    maghrib_jamaah: cols[10],
    esha_adhan: cols[11],
    esha_jamaah: cols[12],
    mosque_id: "al_huda_welfare_foundation_rm6_4aj",
  };
});

const BATCH_SIZE = 50;

async function uploadBatch(batch: typeof times, batchNum: number) {
  const res = await fetch(
    "https://wali-server-b364f9a5f80d.herokuapp.com/v1/timetable/bulk-edit",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ times: batch }),
    }
  );
  console.log(
    `Batch ${batchNum}: ${res.status} (${batch[0].date} - ${
      batch[batch.length - 1].date
    })`
  );
}

async function main() {
  console.log(
    `Uploading ${times.length} entries in batches of ${BATCH_SIZE}...`
  );

  for (let i = 0; i < times.length; i += BATCH_SIZE) {
    const batch = times.slice(i, i + BATCH_SIZE);
    await uploadBatch(batch, Math.floor(i / BATCH_SIZE) + 1);
  }

  console.log("Done!");
}

main();
