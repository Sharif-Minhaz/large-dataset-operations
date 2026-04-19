import fs from "fs";
import { faker } from "@faker-js/faker";
import { CATEGORY_IDS } from "./config.js";

const TOTAL = CATEGORY_IDS.length;
const stream = fs.createWriteStream("data/category.csv");

stream.write("id,name\n");

for (let i = 1; i <= TOTAL; i++) {
	const name = faker.commerce.department();
	stream.write(`${i},"${name}"\n`);
}

stream.end();
console.log("✅ category.csv done");
