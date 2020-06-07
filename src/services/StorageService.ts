export default class StorageService {
  private static ram: Record<string, string> = {}

  public static setItem(key: string, value: {} | string) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn(e)
      StorageService.ram[key] = JSON.stringify(value)
    }
  }

  public static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.warn(e)
      StorageService.ram[key] = undefined
    }
  }

  public static getItem<T>(key: string): T {
    try {
      return JSON.parse(sessionStorage.getItem(key))
    } catch (e) {
      console.warn(e)
      return JSON.parse(StorageService.ram[key])
    }
  }
}
