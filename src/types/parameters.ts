// 设备参数
export interface EquipmentParameters {
  model: string;
  powerKw: number;
  weightKg: number;
  minTemperatureC: number;
  maxTemperatureC: number;
}

// 设备参数模板
export interface EquipmentTemplate {
  id: string;
  name: string;
  parameters: EquipmentParameters;
}
