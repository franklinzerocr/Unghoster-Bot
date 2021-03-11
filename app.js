import config from 'config';
import { twitterClient } from './api.mjs';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

(async function () {
  try {
    console.log('Init');
    const twitter = twitterClient(config.keys);
    let nextCursor = -1;
    let pageCounter = 0;
    let userCountPerPage = 200;

    while (nextCursor) {
      let follows = await twitter.accountsAndUsers.friendsList({ cursor: nextCursor, count: userCountPerPage });
      let now = new Date();

      nextCursor = follows.next_cursor;

      //   console.log('follows');
      //   console.log(follows);
      //   console.log('-----');

      for (let user of follows.users) {
        // console.log('user');
        // console.log(user);
        // console.log('----');
        if (!user.status) continue;
        let lastTweetDate = new Date(user.status.created_at);
        let diff = now - lastTweetDate;
        let yearsDiff = diff / 1000 / 60 / 60 / 24;
        if (yearsDiff >= 730) {
          console.log('Unfollowing ' + user.screen_name);
          await twitter.accountsAndUsers.friendshipsDestroy({ screen_name: user.screen_name });
          console.log('--Bye bye!--');
          console.log('  --------');
        }
      }
      pageCounter++;
      console.log(pageCounter * userCountPerPage + ' Users');

      await sleep(61000);
    }

    console.log('End');
  } catch (e) {
    console.log(e);
  }

  //   console.log(status);
})();
