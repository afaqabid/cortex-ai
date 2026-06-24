async function test() {
  const urls = [
    "https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf",
    "https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf"
  ];

  for (const url of urls) {
    try {
      console.log("Fetching:", url);
      const res = await fetch(url);
      console.log("Status:", res.status, "Ok:", res.ok);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        console.log("Size:", buffer.byteLength);
      }
    } catch (e) {
      console.error("Error fetching", url, e);
    }
  }
}

test();
