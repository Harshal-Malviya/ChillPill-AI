// src/audius.js
export const getRandomTrack = async (query = "lofi chill") => {
  try {
    const response = await fetch(
      `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
        query
      )}&app_name=chillpill`
    );

    if (!response.ok) throw new Error("Audius API error");

    const data = await response.json();
    if (!data || !data.data || data.data.length === 0) {
      return null;
    }

    // Pick a random track
    const randomTrack = data.data[Math.floor(Math.random() * data.data.length)];

    return {
      title: randomTrack.title,
      artist: randomTrack.user?.name || "Unknown Artist",
      streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${randomTrack.id}/stream?app_name=chillpill`,
    };
  } catch (err) {
    console.error("Audius fetch failed:", err);
    return null;
  }
};
