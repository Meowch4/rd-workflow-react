import type { EquipmentTemplate } from "../types/parameters";
// 设备参数模板mock data
export const equipmentTemplatesData: EquipmentTemplate[] = [
  {
    id: "template-standard-chiller",
    name: "Standard Chiller",
    parameters: {
      model: "SC-300",
      powerKw: 35,
      weightKg: 650,
      minTemperatureC: -5,
      maxTemperatureC: 40,
    },
  },
  {
    id: "template-low-temperature-chiller",
    name: "Low Temperature Chiller",
    parameters: {
      model: "LT-500",
      powerKw: 60,
      weightKg: 980,
      minTemperatureC: -25,
      maxTemperatureC: 30,
    },
  },
];
