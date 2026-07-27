async function test() {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=110025&country=India&format=jsonv2`, {
    headers: { 'User-Agent': 'GlassforceApp/1.0' }
  });
  const data = await response.json();
  console.log(data);
}
test();
