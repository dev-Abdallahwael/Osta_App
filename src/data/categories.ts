export interface Category {
  id: string;
  nameKey: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'electrician', nameKey: 'categories.electrician.name', icon: '⚡' },
  { id: 'plumber', nameKey: 'categories.plumber.name', icon: '🔧' },
  { id: 'mechanic', nameKey: 'categories.mechanic.name', icon: '🚗' },
  { id: 'carpenter', nameKey: 'categories.carpenter.name', icon: '🪚' },
  { id: 'painter', nameKey: 'categories.painter.name', icon: '🎨' },
  { id: 'ac_technician', nameKey: 'categories.ac_technician.name', icon: '❄️' },
  { id: 'appliance_repair', nameKey: 'categories.appliance_repair.name', icon: '🧺' },
  { id: 'satellite_tv', nameKey: 'categories.satellite_tv.name', icon: '📡' },
  { id: 'handyman', nameKey: 'categories.handyman.name', icon: '🛠️' },
  { id: 'locksmith', nameKey: 'categories.locksmith.name', icon: '🔐' },
  { id: 'mover', nameKey: 'categories.mover.name', icon: '🚚' },
  { id: 'cleaning', nameKey: 'categories.cleaning.name', icon: '🧹' },
  { id: 'pest_control', nameKey: 'categories.pest_control.name', icon: '🐜' },
  { id: 'gardening', nameKey: 'categories.gardening.name', icon: '🌿' },
  { id: 'tiling', nameKey: 'categories.tiling.name', icon: '🧱' },
  { id: 'welding', nameKey: 'categories.welding.name', icon: '🔥' },
  { id: 'glass_aluminum', nameKey: 'categories.glass_aluminum.name', icon: '🪟' },
  { id: 'water_heater', nameKey: 'categories.water_heater.name', icon: '♨️' },
  { id: 'solar', nameKey: 'categories.solar.name', icon: '☀️' },
  { id: 'renovation', nameKey: 'categories.renovation.name', icon: '🏗️' },
];
