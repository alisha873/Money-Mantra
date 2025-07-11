const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Money Mantra backend is running!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
