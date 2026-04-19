// generateStockCSV.js
import fs from "fs";
import { TOTAL_PRODUCTS, BATCH_SIZE } from "./config.js";

const stream = fs.createWriteStream("data/stock.csv");

let stockId = 0;
let productId = 1;

function generateBatch() {
	let batch = "";

	for (let i = 0; i < BATCH_SIZE && productId <= TOTAL_PRODUCTS; i++) {
		const count = Math.floor(Math.random() * 5) + 1;

		for (let j = 0; j < count; j++) {
			stockId++;

			const row = [
				stockId,
				`"BATCH-${2024 + Math.floor(Math.random() * 3)}-${stockId}"`,
				Math.floor(Math.random() * 500),
				`"Stock-${stockId}"`,
				productId,
			];

			batch += row.join(",") + "\n";
		}

		productId++;
	}

	if (!stream.write(batch)) {
		stream.once("drain", generateBatch);
	} else {
		if (productId <= TOTAL_PRODUCTS) setImmediate(generateBatch);
		else {
			stream.end();
			console.log("✅ stock.csv done");
		}
	}
}

generateBatch();
