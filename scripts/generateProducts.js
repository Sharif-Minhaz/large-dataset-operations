// generateProductsCSV.js
import { faker } from "@faker-js/faker";
import fs from "fs";
import { TOTAL_PRODUCTS, BATCH_SIZE, CATEGORY_IDS, BRAND_IDS } from "./config.js";

const stream = fs.createWriteStream("data/products.csv");

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function escapeCSV(value) {
	if (value == null) return "";
	return `"${String(value).replace(/"/g, '""')}"`;
}

let id = 0;

function generateBatch() {
	let batch = "";

	for (let i = 0; i < BATCH_SIZE && id < TOTAL_PRODUCTS; i++) {
		id++;

		const deleted = Math.random() < 0.05;

		const row = [
			id,
			escapeCSV(faker.commerce.productName()),
			escapeCSV(faker.commerce.productDescription()),
			rand(CATEGORY_IDS),
			rand(BRAND_IDS),
			faker.date.past().toISOString().slice(0, 19).replace("T", " "),
			faker.number.float({ min: 10, max: 500, precision: 0.01 }),
			faker.number.float({ min: 20, max: 1000, precision: 0.01 }),
			deleted ? faker.date.recent().toISOString().slice(0, 19).replace("T", " ") : "",
		];

		batch += row.join(",") + "\n";
	}

	if (!stream.write(batch)) {
		stream.once("drain", generateBatch);
	} else {
		if (id < TOTAL_PRODUCTS) setImmediate(generateBatch);
		else {
			stream.end();
			console.log("✅ products.csv done");
		}
	}
}

generateBatch();
