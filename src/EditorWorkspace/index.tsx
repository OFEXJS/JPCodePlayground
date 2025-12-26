import { useState, useRef, useEffect } from "react";
import "./index.css";
import Empty from "../assets/Empty1.svg";

const defaultCodes = {
  javascript: `// JavaScript 示例
console.log("Hello World!");`,
  python: `# Python 示例
print("Hello World!")
import json
data = {"name": "Hello", "lang": "Python"}
print(json.dumps(data, indent=2, ensure_ascii=False))`,
};

let isPyodideLoaded = false;

const Editor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCodes.javascript);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false); // 运行状态指示器
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 }); // 光标位置
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const pyodideRef = useRef(null);

  const sync = () => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    const highlighter = highlighterRef.current;
    if (!textarea || !lineNumbers || !highlighter) return;

    lineNumbers.scrollTop = textarea.scrollTop;
    lineNumbers.scrollLeft = textarea.scrollLeft;
    highlighter.scrollTop = textarea.scrollTop;
    highlighter.scrollLeft = textarea.scrollLeft;

    // 修复行号生成逻辑，确保正确计算所有行数
    const lines = code.split("\n");
    const lineNumbersHTML = [];
    for (let i = 0; i < lines.length; i++) {
      lineNumbersHTML.push(i + 1);
    }
    lineNumbers.innerHTML = lineNumbersHTML.join("<br>");
  };

  useEffect(() => {
    sync();
  }, [code]);

  // 跟踪加载状态的ref，防止React严格模式下重复加载
  const pyodideLoadingPromiseRef = useRef<Promise<any> | null>(null);

  // 初始化时加载 Python 环境
  useEffect(() => {
    // 只有当尚未开始加载时才执行
    if (!pyodideLoadingPromiseRef.current) {
      console.log("开始加载 Pyodide");
      pyodideLoadingPromiseRef.current = loadPyodideAsync();
    }
  }, []);

  const loadPyodideAsync = async () => {
    if (!pyodideRef.current && !isPyodideLoaded) {
      isPyodideLoaded = true
      const script = document.createElement("script");
      script.src = "/pyodide/pyodide.js";
      document.body.appendChild(script);
      try {
        await new Promise((resolve) => (script.onload = resolve));
      } finally {
        isPyodideLoaded = false;
      }
      pyodideRef.current = await (window as any).loadPyodide({
        indexURL: "/pyodide/", // 同样去掉'public'前缀
      });
    }
    return pyodideRef.current;
  };

  // 优化后的语法高亮逻辑（核心修复）
  // 使用未来感的配色方案
  const highlightCode = (text: string, lang: string) => {
    const lines = text.split("\n");
    const htmlLines = [];

    for (const line of lines) {
      let html = "";
      let i = 0;
      while (i < line.length) {
        let char = line[i];

        // 跳过已处理的字符
        if (char === " " || char === "\t") {
          html += char;
          i++;
          continue;
        }

        // JavaScript / Python 通用处理
        if (lang === "javascript" || lang === "python") {
          // 注释处理
          if (
            (lang === "javascript" && line.slice(i, i + 2) === "//") ||
            (lang === "python" && char === "#")
          ) {
            html += '<span class="comment">' + line.slice(i) + "</span>";
            break;
          }

          // 字符串处理（双引号和单引号）
          if (char === '"' || char === "'") {
            let quote = char;
            let str = quote;
            i++;
            while (i < line.length) {
              char = line[i];
              str += char;
              if (char === "\\") {
                i++;
                if (i < line.length) str += line[i];
              } else if (char === quote) {
                break;
              }
              i++;
            }
            i++; // 跳过结束引号
            html += '<span class="string">' + str + "</span>";
            continue;
          }
          // 处理括号和大括号
          const brackets = ['(', ')', '[', ']'];
          const braces = ['{', '}'];

          if (brackets.includes(char)) {
            html += '<span class="bracket">' + char + '</span>';
            i++;
            continue;
          }

          if (braces.includes(char)) {
            html += '<span class="brace">' + char + '</span>';
            i++;
            continue;
          }
        }

        // 关键词和内置函数（JS）
        if (lang === "javascript") {
          const keywords = [
            "function", "const", "let", "var", "return", "if", "else", "for", "while",
            "class", "async", "await", "import", "export", "default", "try", "catch",
            "finally", "throw", "switch", "case", "break", "continue", "new", "this"
          ];
          const builtins = [
            "console", "log", "JSON", "stringify", "parse", "parseInt", "parseFloat",
            "Array", "Object", "String", "Number", "Boolean", "Map", "Set", "Promise",
            "fetch", "alert", "document", "window", "setTimeout", "setInterval"
          ];

          let word = "";
          let j = i;
          while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {
            word += line[j];
            j++;
          }

          // 函数名处理 (function后的名称)
          if (i > 0 && line.substring(i-9, i) === 'function ') {
            html += '<span class="function">' + word + '</span>';
            i = j;
            continue;
          }

          // 类名处理 (class后的名称)
          if (i > 0 && line.substring(i-6, i) === 'class ') {
            html += '<span class="type">' + word + '</span>';
            i = j;
            continue;
          }

          if (keywords.includes(word)) {
            html += '<span class="keyword">' + word + '</span>';
            i = j;
            continue;
          }
          if (builtins.includes(word)) {
            html += '<span class="builtin">' + word + '</span>';
            i = j;
            continue;
          }
        }

        // Python 关键词和内置函数
        if (lang === "python") {
          const pyKeywords = [
            "def", "class", "if", "else", "elif", "for", "while", "import", "from",
            "return", "print", "async", "await", "and", "or", "not", "in"
          ];
          const pyBuiltins = [
            "print", "len", "range", "list", "dict", "tuple", "set", "str",
            "int", "float", "bool", "sum", "max", "min", "abs", "open"
          ];

          let word = "";
          let j = i;
          while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {
            word += line[j];
            j++;
          }

          // 装饰器处理
          if (i > 0 && line[i-1] === '@') {
            html += '<span class="decorator">@' + word + '</span>';
            i = j;
            continue;
          }

          if (pyKeywords.includes(word)) {
            html += '<span class="keyword">' + word + '</span>';
            i = j;
            continue;
          }
          if (pyBuiltins.includes(word)) {
            html += '<span class="builtin">' + word + '</span>';
            i = j;
            continue;
          }

          // 函数名处理 (def后的函数名)
          if (i > 3 && line.substring(i-4, i) === 'def ') {
            html += '<span class="function">' + word + '</span>';
            i = j;
            continue;
          }
        }

        // 默认字符
        html += char;
        i++;
      }

      htmlLines.push(html || "&nbsp;");
    }

    return htmlLines.join("\n");
  };

  const formatJson = (str: string) => {
    try {
      const obj = JSON.parse(str);
      const pretty = JSON.stringify(obj, null, 2);
      return pretty
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          (match) => {
            let cls = "number";
            if (/^"/.test(match)) cls = /:$/.test(match) ? "key" : "string";
            else if (/true|false/.test(match)) cls = "boolean";
            else if (/null/.test(match)) cls = "null";
            return `<span class="${cls}">${match}</span>`;
          }
        );
    } catch {
      return str;
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("<span class='loading-animation'>运行中...</span>");
    let result = "";

    try {
      if (language === "javascript") {
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;

        // 捕获所有控制台输出
        console.log = (...args: any[]) => {
          logs.push(
            args
              .map((a) => {
                try {
                  return typeof a === "object"
                    ? JSON.stringify(a, null, 2)
                    : String(a);
                } catch {
                  return String(a); // 处理循环引用等情况
                }
              })
              .join(" ")
          );
        };

        console.error = (...args: any[]) => {
          logs.push(
            "<span class='error-message'>" +
            args
              .map((a) => {
                try {
                  return typeof a === "object"
                    ? JSON.stringify(a, null, 2)
                    : String(a);
                } catch {
                  return String(a);
                }
              })
              .join(" ") +
            "</span>"
          );
        };

        // 增加执行超时保护
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("代码执行超时（5秒）")), 5000)
        );

        await Promise.race([
          Promise.resolve(new Function(code)()),
          timeoutPromise,
        ]);

        console.log = originalLog;
        console.error = originalError;
        result = logs.join("\n") || "（无输出）";
      } else if (language === "python") {
        const pyodide = (await loadPyodideAsync()) as any;
        pyodide.runPython(`
          import sys
          import traceback
          from io import StringIO

          sys.stdout = StringIO()
          sys.stderr = StringIO()
        `);

        try {
          await pyodide.runPythonAsync(code);
          const stdout = pyodide.runPython("sys.stdout.getvalue()");
          const stderr = pyodide.runPython("sys.stderr.getvalue()");
          result = stdout || "（无输出）";
          if (stderr) {
            result += "\n<span class='error-message'>" + stderr + "</span>";
          }
        } catch (pyErr) {
          const errorOutput =
            pyodide.runPython("sys.stderr.getvalue()") || String(pyErr);
          throw new Error(errorOutput);
        }
      }
    } catch (err: any) {
      result = (isPyodideLoaded ? "<span class='warning-message'>环境未准备好：" : "<span class='error-message'>错误: ") +
        err.message.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
        "</span>";
    } finally {
      setIsRunning(false);
    }

    setOutput(result);
  };

  const handleLangChange = (lang: "javascript" | "python") => {
    setLanguage(lang);
    setCode(defaultCodes[lang]);
    setOutput("");
    setIsRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      // 使用空格代替制表符，提供更一致的缩进体验
      const tab = " ".repeat(2); // 使用2个空格
      const newCode = code.substring(0, start) + tab + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tab.length;
      }, 0);
    }

    // 增加代码折叠快捷键支持 (Ctrl+/) - 仅用于缩进识别
    if (e.ctrlKey && e.key === "/") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (start === end) {
        // 无选中文本时，在当前行添加注释
        const lineStart = code.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = code.indexOf("\n", start);
        const currentLine = code.substring(
          lineStart,
          lineEnd === -1 ? code.length : lineEnd
        );

        const commentChar = language === "python" ? "#" : "//";
        const newLine = currentLine.includes(commentChar)
          ? currentLine.replace(new RegExp(`\\s*${commentChar}\\s*`), "")
          : currentLine + ` ${commentChar}`;

        const newCode =
          code.substring(0, lineStart) +
          newLine +
          code.substring(lineEnd === -1 ? code.length : lineEnd);
        setCode(newCode);
      }
    }
  };

  // 跟踪光标位置，提供更好的编辑体验
  const handleCursorMove = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const pos = target.selectionStart;
    const lines = code.substring(0, pos).split("\n");
    setCursorPosition({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  return (
    <div className="app">
      <div className="header">
        <div className="language-selector">
          <select
            value={language}
            onChange={(e) =>
              handleLangChange(e.target.value as "javascript" | "python")
            }
            className="language-dropdown"
          >
            <option value="javascript">JavaScript / NodeJS</option>
            <option value="python">Python</option>
          </select>
        </div>
        <button
          onClick={runCode}
          className={`run-button ${isRunning ? "running" : ""}`}
          disabled={isRunning}
        >
          {isRunning ? "运行中..." : "运行代码"}
        </button>
        <div className="cursor-info">
          行: {cursorPosition.line}, 列: {cursorPosition.col}
        </div>
      </div>

      <div className="container">
        <div className="editor-panel">
          <div className="line-numbers" ref={lineNumbersRef}>
            1
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={sync}
            onInput={(e) => {
              sync();
              handleCursorMove(e);
            }}
            onKeyDown={handleKeyDown}
            onSelect={handleCursorMove}
            onMouseUp={handleCursorMove}
            spellCheck={false}
            placeholder="在此输入代码..."
          />
          <div
            className="highlighter"
            ref={highlighterRef}
            dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
          />
        </div>

        <div className={`output-panel visible`}>
          <h3>执行结果</h3>
          {output ? (
            <pre
              className="output-content"
              dangerouslySetInnerHTML={{
                __html:
                  output.trim() &&
                    (output.trim().startsWith("{&lt;") ||
                      output.trim().startsWith("[&lt;") ||
                      output.trim().startsWith("{") ||
                      output.trim().startsWith("[")
                    ) &&
                    !output.includes('<span class="error-message"')
                    ? formatJson(output.replace(/<[^>]*>/g, "")) // 移除HTML标签后格式化
                    : output,
              }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <img src={Empty} alt="暂无输出" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;