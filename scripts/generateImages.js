// generateImagesCSV.js
import fs from "fs";
import { TOTAL_PRODUCTS, BATCH_SIZE } from "./config.js";

const stream = fs.createWriteStream("data/images.csv");

let imageId = 0;
let productId = 1;

function generateBatch() {
	let batch = "";

	for (let i = 0; i < BATCH_SIZE && productId <= TOTAL_PRODUCTS; i++) {
		const count = Math.floor(Math.random() * 3) + 1;

		for (let j = 0; j < count; j++) {
			imageId++;

			const row = [
				imageId,
				`"https://img.example.com/products/${productId}-${j}.jpg"`,
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
			console.log("✅ images.csv done");
		}
	}
}

generateBatch();
