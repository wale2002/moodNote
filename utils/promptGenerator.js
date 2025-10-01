// backend/utils/promptGenerator.js
const prompts = [
  "What made you smile today?",
  "Reflect on a challenge you overcame.",
  "Describe your mood in three words.",
  "What are you grateful for today?",
  "What’s one thing you learned today?",
  "Write about a moment you felt at peace.",
  "What’s something you’re looking forward to?",
  "Describe a time when you helped someone.",
  "What was the highlight of your day?",
  "How do you take care of your mental health?",
  "What’s a goal you’re working towards?",
  "Write about a book, movie, or show that inspired you.",
  "What’s one positive thing you can say about yourself today?",
  "How did you practice self-care today?",
  "What’s a memory that always makes you laugh?",
  "Who in your life inspires you the most?",
  "What’s something new you want to try?",
  "What’s the best advice you’ve ever received?",
  "What’s something you’ve been putting off that you’ll tackle tomorrow?",
  "Describe a place where you feel happiest.",
  "Write about a time when you felt truly proud of yourself.",
  "How did you express kindness today?",
  "What’s a song that’s been stuck in your head recently?",
  "What’s one small thing you can do tomorrow to make your day better?",
  "What’s a hobby or activity that brings you joy?",
  "Write about a time when you overcame a fear.",
  "What’s one thing you’ve always wanted to learn?",
  "What’s a recent accomplishment that made you feel proud?",
  "What are three things that make you feel calm and relaxed?",
  "Write about a moment when you felt completely present.",
  "What’s something that’s been on your mind lately?",
];

module.exports.generatePrompt = () => {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};
