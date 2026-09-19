import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createInitialDemoData,
  DEMO_DATA_STORAGE_KEY,
  loadDemoData,
  resetDemoData,
  saveDemoData,
} from "./demoDataStorage";

// Vitest 默认在 Node.js 环境运行测试，不是真正的浏览器，因此不一定存在浏览器提供的LocalStorage相关方法
// 所以要创建与localStorage行为相似的假对象
function createStorageMock(): Storage {
  const values = new Map<string, string>();

  // 返回与localStorage拥有同样行为方法的对象来模拟localStorage
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

// 无论测试成功还是失败，都会清理本次测试创建的全局替身
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("demo data storage", () => {
  // 正常保存并恢复
  it("loads previously saved business data", () => {
    const storage = createStorageMock();
    // 临时把测试运行环境中的全局 localStorage 替换成我们创建的假 Storage
    vi.stubGlobal("localStorage", storage);
    const data = createInitialDemoData();
    // 先制造一份与初始 Mock 不同的数据
    data.projects[0] = { ...data.projects[0], name: "Persisted Project" };

    // 验证保存成功
    expect(saveDemoData(data)).toBe(true);
    // 验证重新读取时正常恢复
    expect(loadDemoData()).toEqual({
      data,
      recoveredFromInvalidStorage: false,
    });
  });

  // json已损坏
  it("recovers from malformed JSON and removes it", () => {
    const storage = createStorageMock();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(DEMO_DATA_STORAGE_KEY, "{broken-json");

    const result = loadDemoData();

    // loadDemoData catch 到error之后应该删除损坏数据
    expect(result.recoveredFromInvalidStorage).toBe(true);
    // 返回初始Mock
    expect(result.data).toEqual(createInitialDemoData());
    // 损坏数据已被删除
    expect(storage.getItem(DEMO_DATA_STORAGE_KEY)).toBeNull();
  });

  // json合法但版本不支持
  it("recovers from a stored snapshot with an unsupported version", () => {
    const storage = createStorageMock();
    vi.stubGlobal("localStorage", storage);
    storage.setItem(
      DEMO_DATA_STORAGE_KEY,
      // 创建不合法版本json数据
      JSON.stringify({ ...createInitialDemoData(), version: 2 }),
    );

    const result = loadDemoData();

    expect(result.recoveredFromInvalidStorage).toBe(true);
    expect(result.data.version).toBe(1);
  });

  // reset必须立即写入
  it("writes clean mock data immediately when reset", () => {
    // 设置mock localStorage
    const storage = createStorageMock();
    vi.stubGlobal("localStorage", storage);
    // 创建一个没有cr的mock数据
    const changedData = createInitialDemoData();
    changedData.changeRequests = [];
    saveDemoData(changedData);

    const resetData = resetDemoData();

    // 检查localStorage中已经立即写入完整的初始数据
    expect(JSON.parse(storage.getItem(DEMO_DATA_STORAGE_KEY) ?? "null")).toEqual(
      resetData,
    );
    expect(resetData.changeRequests.length).toBeGreaterThan(0);
  });
});
