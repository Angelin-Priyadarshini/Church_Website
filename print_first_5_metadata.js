const fs = require('fs');
const res = JSON.parse(fs.readFileSync('youtubei_response.json', 'utf8'));

const action = res.onResponseReceivedActions[0];
const continuationItems = action.appendContinuationItemsAction.continuationItems;

for (let i = 0; i < 5; i++) {
  const item = continuationItems[i];
  if (item && item.richItemRenderer && item.richItemRenderer.content && item.richItemRenderer.content.lockupViewModel) {
    const lockup = item.richItemRenderer.content.lockupViewModel;
    console.log(`\n--- Video ${i + 1} ---`);
    console.log('Title:', lockup.metadata?.lockupMetadataViewModel?.title?.content);
    console.log('Metadata contentMetadataViewModel:', JSON.stringify(lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel, null, 2));
  }
}
