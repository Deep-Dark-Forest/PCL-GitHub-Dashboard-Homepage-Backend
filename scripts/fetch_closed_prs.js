const axios = require('axios');
const fs = require('fs');
const path = './data/';
const repo = 'Hex-Dragon/PCL2';
const labelsUrl = `https://api.github.com/repos/${repo}/labels`;

(async function () {
  try {
    if (!fs.existsSync(path)) fs.mkdirSync(path);

    const { data: labels } = await axios.get(labelsUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.PAT}`,
      }
    });

    const mergedRes = await axios.get(
      `https://api.github.com/search/issues?q=repo:${repo}+is:pr+is:merged`,
      { headers: { Authorization: `Bearer ${process.env.PAT}` } }
    );
    fs.writeFileSync(`${path}PR已合并.md`, mergedRes.data.total_count.toString());

    const closedUnmergedRes = await axios.get(
      `https://api.github.com/search/issues?q=repo:${repo}+is:pr+is:closed+-is:merged`,
      { headers: { Authorization: `Bearer ${process.env.PAT}` } }
    );
    fs.writeFileSync(`${path}PR已关闭未合并.md`, closedUnmergedRes.data.total_count.toString());

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();