// src/mock/mockData.js

// Ant Design preset colors
const presetColors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

// Mock data with random tag colors
const mockData = [
  { key: "TEAM194", name: "Aung Kyaw", location: "16.776474, 96.171004" },
  { key: "TEAM432", name: "Kyaw Thaung", location: "16.77122, 96.175772" },
  { key: "TEAM820", name: "Zaw Min", location: "16.776539, 96.168959" },
  { key: "TEAM286", name: "Mya Hnin", location: "16.78781, 96.16733" },
  { key: "TEAM698", name: "Ko Ko", location: "16.78585, 96.161588" },
  { key: "TEAM851", name: "Aye Chan", location: "16.786012, 96.14788" },
  { key: "TEAM344", name: "Soe Win", location: "16.779877, 96.143969" },
  { key: "TEAM289", name: "Hla Hla", location: "16.780137, 96.13744" },
  { key: "TEAM570", name: "Thura", location: "16.780642, 96.131666" },
  { key: "TEAM517", name: "Than Myint", location: "16.793038, 96.122994" },
  { key: "TEAM363", name: "Moe Moe", location: "16.802123, 96.122292" },
  { key: "TEAM627", name: "Aung Aung", location: "16.803815, 96.12437" },
  { key: "TEAM795", name: "Khin Khin", location: "16.803723, 96.133336" },
  { key: "TEAM544", name: "Nay Lin", location: "16.804693, 96.133012" },
  { key: "TEAM719", name: "Wai Yan", location: "16.815558, 96.128566" },
  { key: "TEAM947", name: "Min Min", location: "16.823456, 96.187345" },
  { key: "TEAM382", name: "Thet Thet", location: "16.795123, 96.154789" },
  { key: "TEAM613", name: "Myint Myint", location: "16.847890, 96.172910" },
  { key: "TEAM758", name: "Lwin Lwin", location: "16.732145, 96.108654" },
  { key: "TEAM492", name: "Zin Zin", location: "16.814321, 96.135678" },
  { key: "TEAM305", name: "Htet Htet", location: "16.768901, 96.192345" },
  { key: "TEAM841", name: "Nandar", location: "16.789012, 96.123456" },
  { key: "TEAM176", name: "Yee Yee", location: "16.832167, 96.167890" },
  { key: "TEAM624", name: "Su Su", location: "16.753290, 96.145678" },
  { key: "TEAM309", name: "Phyo Phyo", location: "16.801234, 96.179123" },
  { key: "TEAM470", name: "Thida", location: "16.775678, 96.112345" },
  { key: "TEAM583", name: "Kyaw Kyaw", location: "16.842190, 96.198765" },
  { key: "TEAM206", name: "Mai Mai", location: "16.787654, 96.163456" },
  { key: "TEAM938", name: "Aung Htay", location: "16.799876, 96.174321" },
  { key: "TEAM725", name: "Win Win", location: "16.812345, 96.156789" },
].map((item) => ({
  ...item,
  tagColor: presetColors[Math.floor(Math.random() * presetColors.length)],
}));

export default mockData;