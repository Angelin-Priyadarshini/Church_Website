const https = require('https');

function postHttps(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  const apiKey = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
  const token = '4qmFsgLZCRIYVUMwLUwzUGpsS2NEeW9KeDZDTTZMMldBGrwJOGdhRUJ4cUJCM3ItQmpyN0Jnb2tObUZpT0RZek5URXRNREF3TUMweVlqRTRMV0UxTVdZdE5UZ3lOREk1WW1RMVlUaGpFdEFHUVZOdmNqSmFZMVkxY1RWT2EzYzJkbWhrY0RNeVZFbzFVR2xhZUZKNVowSmlZa3BGVGxocmNtUnZReTFHY2kxWFpuWk1jMFpNTVdwNGIxUjBhMnRqUzJSVlFXeE5RbTVzYnkxUFZWUnBhbTFtZURBNGJFaGhTRXRzWXpKS2RGQnJSVlZXU0hCNVRrY3pjM1pxWW5sUFFXcFhWVlZyV25oSFVYRlhkbEpNUkdGcVpITkhhRlkxTFRad2JIQTJUa001Y1U5VWR6Wm9ZVlpVVVhWSlpEQnVTbXRYV1ROcFNWaHRVRkZmVEhsMFVHRXdOMkpMVGxsSFRtbFlUMWRGYjBneldXaEpNWFpxYTBKRVdtaEVSMDVITmpkaFJsQlBSelZvWmxkTWQwRldkWFpDYkRWRFRuZGtUbkJ5TldFMWQwWlROek5sZVhKNGJuQjRlVXhUYVhWUVIwRjBWMnhQZVVoWGFsbGFjRXBNY1dsbFoxZENTREUzVFRsRWNHNWtYMjFUWms5MmEyOXBiSE00TVRSMU5uUnRVVXgyYUVneFZFMDVlVjkwVTBGa1VtYzBhVmwzVG1jeGJIWjRhWGx6YWxKQldIaGxNbkJwVFVadFlYVnNTRlpvYVVneE5EbFRjMUpmU1ZFMmRqbFpZbFIwVmxoZlZYUkxOWFJrZFZCYU1uQkNZV0ZwTUZObVZVcHdTMFV5Yld3NU9XVTJWbk00TlVFeFpWTXhVa1Y2V21sV1pHVkdOVmxMV0V4d05DMHdlbWRPVkhOWVZUSlhOMFZaUVRkT2JqUkJkakpzVjJJanpHZDNMVmRVU1RONE9FOWxOM05FVURRMmEyUkdhMVZ4UXpsT2FHTkxOSGQ1TFdGQ1QwVTNSWEZDV2xKblJIVlNNa3hrVm1OdFFsRlRhR00wYkV4SGJHWllSelZWUWs0M2IxUmxaR1ZtWlhwUmNGTktOVmRFVUhkQ1dXUmFTbXBPZEhKelUwOXdZMGhNV0RWWVdVOHlRbFEwZFZSRVJEQmxORTh5WldkT1FXNWZRWEZ2UWs1elowMU5UMmRYZG5oM01GaDNTa3AwYUZCMVl6ZFBjR1J3WlRoZk5FeG1aVUpWZDJ4R1RWTmpRM05oZWpOYVZHRktZMFJyV1RoNlFuaERZelJ3Wlc1M1kydEhOM3BhVDFwVU0wMW1abk5KUTJ4dVFqQXpSSGhzVVRjd2R6RlVkR296UkhsbVoyaFFVVnBXVG1aUFkxVkxSRE5MTFhoU1ZITXplV053Vldod1ltbGhORmsyZGtvemExWlRabkpPYTJkSFR6aFJVamRmYTJwblJTMDNlVGN3WkMxU00yZG9kSGxYY0dwUFRqVjJORkZIYm5Gbk5rSmxVMFpVY0V3M2NFbEpRa3hLWkdKWVpEWnRRbVppUjIxU2IydFBaME42VmxsRldWTjRlbmcxTWxSMFlYRjNaRmQ1YWs5UGMzSXhSVVpoTTFGTk5rUXhURTlPVTBkdVZsbzJlazFTVm5vWUJBJTNEJTNE';
  const payload = {
    context: { client: { clientName: 'WEB', clientVersion: '2.20260515.01.00', platform: 'DESKTOP' } },
    continuation: token
  };

  try {
    const res = await postHttps(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, payload);
    const firstItem = res.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems[0];
    const lockup = firstItem.richItemRenderer.content.lockupViewModel;
    console.log('Title:', lockup.metadata.lockupMetadataViewModel.title.content);
    console.log('Metadata contentMetadataViewModel:', JSON.stringify(lockup.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
