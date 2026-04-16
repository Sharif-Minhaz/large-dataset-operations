import config from "./config/index.js";
import app from "./app.js";

app.listen(config.port, () => {
  console.log(`[server] Running on port ${config.port}`);
});
