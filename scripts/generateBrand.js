import fs from "fs";
import { faker } from "@faker-js/faker";
import { BRAND_IDS } from "./config.js";

const TOTAL = BRAND_IDS.length;
const stream = fs.createWriteStream("data/brand.csv");

stream.write("id,name\n");

for (let i = 1; i <= TOTAL; i++) {
	const name = faker.company.name().replace(/,/g, "");
	stream.write(`${i},"${name}"\n`);
}

stream.end();
console.log("✅ brand.csv done");
