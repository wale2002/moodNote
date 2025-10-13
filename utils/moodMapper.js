// backend/utils/moodMapper.js
const moodMap = {
  ecstatic: 3,
  happy: 2,
  peaceful: 1,
  sad: 0,
};

exports.mapMoodToValue = (mood) => moodMap[mood] || 0;

exports.categorizeMood = (value) => {
  if (value === 0) return "negative";
  if (value === 1) return "neutral";
  return "positive";
};
