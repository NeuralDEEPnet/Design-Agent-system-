# Failures & Mistakes

## 1. Gemini SDK `tools` Placement
**Date**: 2026-04-10
**Error**: `Object literal may only specify known properties, and 'tools' does not exist in type 'GenerateContentParameters'.`
**Context**: Attempted to pass the `tools` array at the top level of the `generateContentStream` parameters.
**Lesson Learned**: In the current `@google/genai` SDK version used in this project, the `tools` array must be placed *inside* the `config` object, not at the root level of the request parameters.

## 2. Gemini SDK `FunctionCall` Typing
**Date**: 2026-04-10
**Error**: `Type 'FunctionCall' is not assignable to type '{ name: string; args: any; }'. Types of property 'name' are incompatible. Type 'string | undefined' is not assignable to type 'string'.`
**Context**: Defined a custom `Part` type to handle function calls and assumed `name` and `args` were strictly defined as strings/objects.
**Lesson Learned**: The `FunctionCall` object returned by the SDK has optional properties (`name?: string`, `args?: any`). Custom types mapping to it must account for `undefined` values to satisfy the TypeScript compiler.
