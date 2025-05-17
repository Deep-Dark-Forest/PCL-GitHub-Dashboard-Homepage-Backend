const axios = require('axios');
const fs = require('fs');
const path = './data/';
const repo = 'Hex-Dragon/PCL2';
const labelsUrl = `https://api.github.com/repos/${repo}/labels`;

const states = [
  {
    suffix: '.md',
    exclude: /➦ (删除|解锁|锁定)/,
    query: 'is:issue'
  },
  {
    suffix: 'open.md',
    exclude: /➦ 删除|➦ 解锁|➦ 锁定|投票中|新提交|社区处理中|等待确认|受阻碍|可合并|处理中|🚫 阻碍者|完成|重复|忽略|拒绝 \/ 放弃/,
    query: 'is:issue is:open'
  },
  {
    suffix: 'closed.md',
    exclude: /➦ 删除|➦ 解锁|➦ 锁定|投票中|新提交|社区处理中|等待确认|受阻碍|🟥 高|🟨 中|🟩 低|🟪 极高|可合并|处理中|🚫 阻碍者|完成|重复|忽略|拒绝 \/ 放弃/,
    query: 'is:issue is:closed'
  }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async function () {
  try {
    const { data: labels } = await axios.get(labelsUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.PAT}`,
      },
    });

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    for (const state of states) {
      for (const label of labels) {
        if (state.exclude.test(label.name)) continue;

        const sanitizedLabel = label.name.replace(/[·🟩🟪🟥✨🟨🚫<>"\\/:|?* ]/g, '_');
        const fileName = `${sanitizedLabel}${state.suffix}`;
        const queryPart = state.query.replace(/ /g, '+');
        const issuesUrl = `https://api.github.com/search/issues?q=repo:${repo}+${queryPart}+label:"${encodeURIComponent(label.name)}"`;

        try {
          await delay(1000);
          const { data: issues } = await axios.get(issuesUrl, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Bearer ${process.env.PAT}`,
            },
          });
          fs.writeFileSync(`${path}${fileName}`, `${issues.total_count}`);
        } catch (error) {
          console.error(`Error processing label "${label.name}":`);
          console.error(`URL: ${issuesUrl}`);
          if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
          } else {
            console.error(error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Main process failed:`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
})();