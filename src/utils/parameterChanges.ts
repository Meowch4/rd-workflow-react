import type {
  EquipmentParameters,
  ParameterChange,
} from "../types/parameters";

// 对比原始参数和现在的参数并返回一个装着不同项的数组
export function getParameterChanges(
  original: EquipmentParameters,
  current: EquipmentParameters,
): ParameterChange[] {
  const fields = Object.keys(current) as Array<keyof EquipmentParameters>;

  return fields.flatMap((field) => {
    const before = original[field];
    const after = current[field];

    return before === after ? [] : [{ field, before, after }];
  });
}
