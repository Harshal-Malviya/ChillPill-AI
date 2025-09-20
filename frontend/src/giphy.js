// giphy.js
export async function getMemeGif(query = "funny indian meme") {
  const API_KEY = "oNgumhsXWcz1GbvTWdBXsfiT2NqZHODI"; // Your Giphy API key
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=100&rating=pg-13&random_id=${Math.floor(Math.random() * 1000)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Track used GIFs in session storage, reset after 20 unique memes
      let usedGifs = JSON.parse(sessionStorage.getItem('usedGifs') || '[]');
      
      const availableGifs = data.data.filter(gif => !usedGifs.includes(gif.id));
      
      if (availableGifs.length === 0) {
        usedGifs = []; // Reset if all used
        sessionStorage.setItem('usedGifs', JSON.stringify(usedGifs));
        // eslint-disable-next-line
        availableGifs = data.data; // Use all again
      }

      const randomIndex = Math.floor(Math.random() * availableGifs.length);
      const selectedGif = availableGifs[randomIndex];
      usedGifs.push(selectedGif.id);
      if (usedGifs.length > 20) usedGifs = usedGifs.slice(-20); // Keep last 20
      sessionStorage.setItem('usedGifs', JSON.stringify(usedGifs));

      return selectedGif.images.original.url; // Random gif link
    }
    return null;
  } catch (error) {
    console.error("Error fetching meme gif:", error);
    return null;
  }
}