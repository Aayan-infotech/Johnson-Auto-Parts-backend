import app from "./app";
import getConfig from "./config/loadConfig";

const startServer=async()=>{
  const config = await getConfig();
  const PORT = config.PORT || 5050;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();