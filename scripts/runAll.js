import { spawn } from "child_process";

const run = (script) => {
	return new Promise((resolve, reject) => {
		const proc = spawn("node", [script], { stdio: "inherit" });

		proc.on("close", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${script} failed`));
		});
	});
};

async function main() {
	try {
		console.log("🚀 Starting full generation pipeline...\n");

		await run("scripts/generateCategory.js");
		await run("scripts/generateBrand.js");

		await run("scripts/generateProducts.js");
		await run("scripts/generateImages.js");
		await run("scripts/generateStock.js");

		console.log("\n🎉 ALL DATA GENERATED SUCCESSFULLY");
	} catch (err) {
		console.error("❌ Pipeline failed:", err.message);
		process.exit(1);
	}
}

main();
