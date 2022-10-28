# AshLang

**AshLang** is a functional programming language built with **Rust**.

*⚠️Work in Progress⚠️*

## 😎Why I built this?
1. Wanted to explore the process of building a programming language.
2. Just wanted to merge the features of other languages that I love into one language.
    - Simple syntax like `Kotlin`, `Go`, `V` & `Zig`.
    - Dynamic like `Python` & `JavaScript`.
    - Null-Safety like `V`, `Dart` & `Swift`.
    - Faster than `Python`.
3. Because I can 😜

## ✨Features
- Simple Functional Syntax.
- Dynamic Typing.
- Null-Safety Support.
- Interpreted.
- Language Server Support for VSCode/VSCode Web.
    - Syntax Highlighting
    - Code Formatting
- Execution support in VSCode/VSCode Web
- Open Source
## 🛠️Building
- Tokenizer
- Parser
- Interpreter
- Code Formatter
- LSP Server for VSCode/VSCode Web
## 🤔Usage

Execute the code

    ash_lang_cli run ./code.ash

Format the code

    ash_lang_cli fmt ./code.ash

## 📖Docs
### Data Types
1. Int
2. Double
3. String
4. Boolean
5. List
6. Map

## 📦Example
```rust
// BubbleSort implemented in AshLang
fn bubbleSort(arr) {
  let i = 0, j = 0;
  while (i < len(arr)) {
    j = 0;
    while (j < (len(arr) - 1)) {
      let x = get(arr, j), y = get(arr, j + 1);
      if (x > y) {
        arr = set(set(arr, j, y), j + 1, x);
      }
      j += 1;
    }
    i += 1;
  }
  return arr;
}

fn main() {
  let nums = [1, 3, 5, 7, 9, 2, 4 ,6, 8, 0];
  println(bubbleSort(nums));
}
```
More examples are located in the `examples/` folder.

## 💪Contributors
- **Ayush Chothe**
    - Language Design
    - Implementation
        - Tokenizer
        - Parser
        - Interpreter
        - Code Formatter
        - LSP Server for VsCode
