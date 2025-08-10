// src/libs/random.ts
/**
 * 获取小于N的随机整数
 * @param count
 */
export const getRandomMin = (count: number) => Math.floor(Math.random() * count);

/**
 * 获取一定范围内的随机整数
 * @param min
 * @param max
 */
export const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + min;

/**
 * 生成只包含字母的固定长度的字符串
 * @param length
 */
export const getRandomCharString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * 从列表中获取一个随机项
 * @param list
 */
export const getRandItemData = <T>(list: T[]) => {
    return list[getRandomMin(list.length)];
};

/**
 * 从列表中获取多个随机项组成一个新列表
 * @param list
 */
export const getRandListData = <T>(list: T[]) => {
    const result: T[] = [];
    for (let i = 0; i < getRandomMin(list.length); i++) {
        const random = getRandItemData<T>(list);
        const canPush = !result.find((item) => {
            if ('id' in (random as Record<string, unknown>)) {
                const check = random as Record<string, unknown>;
                const current = item as Record<string, unknown>;
                return current.id === check.id;
            }
            return item === random;
        });
        if (canPush) result.push(random);
    }
    return result;
};

// 格式化日期
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化时间
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期时间
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 合并CSS类名
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}