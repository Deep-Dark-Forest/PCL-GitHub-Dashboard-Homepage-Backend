const axios = require('axios');
const fs = require('fs');
const path = './';
const repo = 'Hex-Dragon/PCL2';
const url = `https://api.github.com/repos/${repo}/labels`;
const excludePatterns = /➦ (删除|解锁|锁定)|完成|重复|忽略|拒绝 / 放弃/;

(async function () {
  try {
    const { data: labels } = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.PAT}`,
      },
    });

    for (const label of labels) {
      if (excludePatterns.test(label.name)) continue;
      const sanitizedLabel = label.name.replace(/[🟩🟪🟥🟨🚫<>"\\/:|?* ]/g, '_');
      const fileName = `${sanitizedLabel}open.md`;
      const issuesUrl = `https://api.github.com/search/issues?q=repo:${repo}+is:issue+is:open+label:"${encodeURIComponent(
        label.name
      )}"`;
      const { data: issues } = await axios.get(issuesUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${process.env.PAT}`,
        },
      });
      fs.writeFileSync(path + fileName, `${issues.total_count}`);
    }
  } catch (error) {
    console.error(`Error fetching labels or writing files: ${error.message}`);
    process.exit(1);
  }
})();
