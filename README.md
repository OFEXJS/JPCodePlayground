# 在线代码运行工具（Agent 产物）

> 一个纯前端的在线代码运行工具，支持 **JavaScript / NodeJS** 与 **Python** 即时执行，专为算法练习、面试刷题、快速验证代码而生。

在线访问：https://zhengjialux.github.io/CodePlayground/index.html

![在线代码运行工具](/Example.png)  
（截图示例：左侧编辑器 + 右侧执行结果）

## 核心特性

| 功能                     | 说明                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| 完全前端运行             | 代码永不上传服务器，隐私 100% 保障                                |
| 支持 JavaScript & Python | JS 直接 `new Function()` 执行，Python 使用 Pyodide（WebAssembly） |
| 语法高亮 + 行号          | 手写高亮引擎，关键词、字符串、注释、console/print 精准上色        |
| 实时执行结果             | 点击「运行代码」后右侧立即显示输出，JSON 自动美化高亮             |
| Tab 缩进                 | 按 Tab 键插入制表符，光标位置完美对齐                             |
| 自动隐藏旧结果           | 输入或切换语言时右侧自动恢复提示，避免旧输出干扰                  |
| 零第三方编辑器           | 纯原生 `<textarea>` + 高亮层实现，轻量、零卡顿                    |

## 使用文档

### 1. 基本操作

1. 在顶部下拉框选择语言（JavaScript / NodeJS 或 Python）
2. 在左侧编辑器编写代码
3. 点击「运行代码」按钮
4. 右侧面板自动显示执行结果（点击运行前显示“点击运行查看结果”）

### 2. 支持的输出方式

- `console.log(...)`（JS）
- `print(...)`（Python）
- 返回的任何对象都会被 `JSON.stringify` 美化
- 错误信息会完整显示堆栈

### 3. 示例代码

#### JavaScript 示例

```
// 快速验证算法
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
console.log("fib(10) =", fib(10));

// JSON 输出会自动高亮
console.log({ name: "TEST", features: ["JS", "Python", "即时运行"] });
```

#### Python 示例

```
def twoSum(nums, target):
    d = {}
    for i, n in enumerate(nums):
        if target - n in d:
            return [d[target - n], i]
        d[n] = i

print(twoSum([2, 7, 11, 15], 9))

import json
print(json.dumps({"status": "success", "lang": "Python"}, indent=2, ensure_ascii=False))
```

## 技术栈

- React 18 + Vite
- Pyodide v0.26.2（Python 运行时）
- 纯原生 `<textarea>` + 高亮层实现编辑器
