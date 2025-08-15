const fs = require('fs');
const axios = require('axios');

const USERNAME = 'Dantdmnl'; // your GitHub username
const README_PATH = 'README.md';
const ACTIVITY_START = '<!--RECENT_ACTIVITY:start-->';
const ACTIVITY_END = '<!--RECENT_ACTIVITY:end-->';

async function fetchEvents() {
  const res = await axios.get(`https://api.github.com/users/${USERNAME}/events/public`, {
    headers: { 'User-Agent': 'axios/1.11.0' }
  });
  return res.data.slice(0, 5); // latest 5 events
}

function renderEvent(event) {
  switch(event.type) {
    case 'PushEvent':
      return `⬆️ Pushed ${event.payload.commits.length} commit(s) to [${event.repo.name}](https://github.com/${event.repo.name})`;
    case 'PullRequestEvent':
      return `🔀 ${event.payload.action} PR [#${event.payload.pull_request.number}](${event.payload.pull_request.html_url}) in [${event.repo.name}](https://github.com/${event.repo.name})`;
    case 'IssuesEvent':
      return `🐛 ${event.payload.action} issue [#${event.payload.issue.number}](${event.payload.issue.html_url}) in [${event.repo.name}](https://github.com/${event.repo.name})`;
    default:
      return `📌 ${event.type} in [${event.repo.name}](https://github.com/${event.repo.name})`;
  }
}

(async () => {
  try {
    const events = await fetchEvents();
    const rendered = events.map(renderEvent).join('\n');

    let readme = fs.readFileSync(README_PATH, 'utf-8');
    const regex = new RegExp(`${ACTIVITY_START}[\\s\\S]*${ACTIVITY_END}`, 'm');
    const replacement = `${ACTIVITY_START}\n${rendered}\n${ACTIVITY_END}`;

    readme = readme.replace(regex, replacement);
    fs.writeFileSync(README_PATH, readme, 'utf-8');
    console.log('✅ README updated with latest activity!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
